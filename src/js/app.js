import { PERIODS, today, validateMeal, totalCalories } from './domain.js';
import { listMeals, addMeal, updateMeal, removeMeal } from './storage.js';
import { setupAccount } from './account-ui.js';
const $ = id => document.getElementById(id);
const format = n => new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(n);
function el(tag, className, text) { const node = document.createElement(tag); if(className) node.className=className; if(text!==undefined) node.textContent=text; return node; }

// Alimento em edição (null = modo "adicionar"). O mesmo modal serve para os dois casos.
let editing = null;

// Mensagens de retorno ao usuário (sucesso ou erro), lidas por leitores de tela via role="status".
function notify(message, type = 'info') { const n=$('notice'); n.textContent=message; n.dataset.type=type; }
function friendlyError(error) {
  const msg = error?.message || 'Erro inesperado.';
  return /sess[aã]o|session|jwt|auth/i.test(msg) ? 'Sua sessão expirou ou você não está conectado. Entre novamente e tente de novo.' : msg;
}

function openMeal(period = PERIODS[0].id, item = null) {
  editing = item;
  $('meal-form').reset(); $('meal-error').textContent='';
  $('period').value = item ? item.period : period;
  if (item) { $('food').value = item.name; $('calories').value = item.calories; }
  $('meal-title').textContent = item ? 'Editar alimento' : 'Adicionar alimento';
  $('meal-submit').textContent = item ? 'Salvar alterações' : 'Salvar alimento';
  $('meal-dialog').showModal(); $('food').focus();
}

async function deleteMeal(item, button) {
  if (!confirm(`Excluir "${item.name}" (${format(item.calories)} kcal)?`)) return;
  button.disabled = true;
  try { await removeMeal(item.id); await render(); notify(`"${item.name}" foi excluído.`, 'success'); }
  catch (error) { button.disabled = false; notify(`Não foi possível excluir: ${friendlyError(error)}`, 'error'); }
}

function mealRow(item) {
  const row=el('li','meal-item');
  const info=el('div','meal-item-info'); info.append(el('span','',item.name),el('strong','',`${format(item.calories)} kcal`));
  const actions=el('div','meal-actions');
  const edit=el('button','item-action','✎'); edit.type='button'; edit.title='Editar';
  edit.setAttribute('aria-label',`Editar ${item.name}`); edit.addEventListener('click',()=>openMeal(item.period,item));
  const del=el('button','item-action danger','🗑'); del.type='button'; del.title='Excluir';
  del.setAttribute('aria-label',`Excluir ${item.name}`); del.addEventListener('click',()=>deleteMeal(item,del));
  actions.append(edit,del); row.append(info,actions); return row;
}

async function render() {
  const grid=$('meals'); grid.setAttribute('aria-busy','true');
  try {
    const date=$('day').value;
    const items=await listMeals(date);
    if (date !== $('day').value) return;
    $('total').textContent=format(totalCalories(items)); $('count').textContent=items.length;
    grid.replaceChildren();
    for(const period of PERIODS){
      const group=items.filter(item=>item.period===period.id);
      const card=el('article','meal-card'); const head=el('div','meal-head'); const info=el('div');
      info.append(el('h3','',period.label),el('small','',period.time));
      head.append(el('span','meal-icon',period.icon),info,el('span','meal-total',`${format(totalCalories(group))} kcal`)); card.append(head);
      if(!group.length) card.append(el('p','empty','Nenhum alimento registrado.'));
      else { const list=el('ul','meal-list'); for(const item of group) list.append(mealRow(item)); card.append(list); }
      const button=el('button','add-link','+ Adicionar alimento'); button.type='button'; button.setAttribute('aria-label',`Adicionar alimento em ${period.label}`); button.addEventListener('click',()=>openMeal(period.id)); card.append(button); grid.append(card);
    }
  } catch(error){ notify(`Não foi possível carregar as refeições: ${friendlyError(error)}`,'error'); }
  finally { grid.removeAttribute('aria-busy'); }
}

$('day').value=today(); $('day').addEventListener('change',()=>{ notify(''); render(); });
for(const p of PERIODS){ const option=el('option','',p.label); option.value=p.id; $('period').append(option); }
$('new-meal').addEventListener('click',()=>openMeal()); $('close-meal').addEventListener('click',()=>$('meal-dialog').close());
$('meal-dialog').addEventListener('close',()=>{ editing=null; });
$('meal-form').addEventListener('submit',async e=>{
  e.preventDefault();
  // Na edição, mantém a data original do alimento; no cadastro, usa a data selecionada.
  const input={name:$('food').value,calories:$('calories').value,period:$('period').value,date:editing ? editing.date : $('day').value};
  const result=validateMeal(input); if(!result.valid){ $('meal-error').textContent=Object.values(result.errors).join(' '); return; }
  const submit=$('meal-submit'); const label=submit.textContent; submit.disabled=true; submit.textContent='Salvando…';
  const current=editing;
  try {
    const response=await fetch('/api/validate-meal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
    if(!response.ok) throw new Error('O servidor não aceitou os dados.');
    const validated=await response.json();
    if(current) await updateMeal(current.id, validated.data); else await addMeal(validated.data);
    $('meal-dialog').close(); await render();
    notify(current ? `"${validated.data.name}" foi atualizado.` : `"${validated.data.name}" foi adicionado.`, 'success');
  }catch(error){ $('meal-error').textContent=friendlyError(error); }finally{ submit.disabled=false; submit.textContent=label; }
});
await setupAccount(render); await render();
