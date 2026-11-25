import { PERIODS, today, validateMeal, totalCalories } from './domain.js';
import { listMeals, addMeal } from './storage.js';
import { setupAccount } from './account-ui.js';
const $ = id => document.getElementById(id);
const format = n => new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(n);
function el(tag, className, text) { const node = document.createElement(tag); if(className) node.className=className; if(text!==undefined) node.textContent=text; return node; }
function openMeal(period = PERIODS[0].id) { $('meal-form').reset(); $('period').value=period; $('meal-error').textContent=''; $('meal-dialog').showModal(); }
async function render() {
  try {
    const date=$('day').value;
    const items=await listMeals(date);
    if (date !== $('day').value) return;
    $('total').textContent=format(totalCalories(items)); $('count').textContent=items.length;
    const grid=$('meals'); grid.replaceChildren();
    for(const period of PERIODS){
      const group=items.filter(item=>item.period===period.id);
      const card=el('article','meal-card'); const head=el('div','meal-head'); const info=el('div');
      info.append(el('h3','',period.label),el('small','',period.time));
      head.append(el('span','meal-icon',period.icon),info,el('span','meal-total',`${format(totalCalories(group))} kcal`)); card.append(head);
      if(!group.length) card.append(el('p','empty','Nenhum alimento registrado.'));
      else { const list=el('ul','meal-list'); for(const item of group){ const row=el('li','meal-item'); row.append(el('span','',item.name),el('strong','',`${format(item.calories)} kcal`)); /* TODO Camille: adicionar controles de edição e exclusão. */ list.append(row); } card.append(list); }
      const button=el('button','add-link','+ Adicionar alimento'); button.type='button'; button.addEventListener('click',()=>openMeal(period.id)); card.append(button); grid.append(card);
    }
    $('notice').textContent='';
  } catch(error){ $('notice').textContent=`Não foi possível carregar as refeições: ${error.message}`; }
}
$('day').value=today(); $('day').addEventListener('change',render);
for(const p of PERIODS){ const option=el('option','',p.label); option.value=p.id; $('period').append(option); }
$('new-meal').addEventListener('click',()=>openMeal()); $('close-meal').addEventListener('click',()=>$('meal-dialog').close());
$('meal-form').addEventListener('submit',async e=>{
  e.preventDefault(); const input={name:$('food').value,calories:$('calories').value,period:$('period').value,date:$('day').value};
  const result=validateMeal(input); if(!result.valid){ $('meal-error').textContent=Object.values(result.errors).join(' '); return; }
  const submit=e.submitter; if(submit) submit.disabled=true;
  try {
    const response=await fetch('/api/validate-meal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});
    if(!response.ok) throw new Error('O servidor não aceitou os dados.');
    const validated=await response.json(); await addMeal(validated.data); $('meal-dialog').close(); await render();
  }catch(error){ $('meal-error').textContent=error.message; }finally{ if(submit) submit.disabled=false; }
});
await setupAccount(render); await render();
