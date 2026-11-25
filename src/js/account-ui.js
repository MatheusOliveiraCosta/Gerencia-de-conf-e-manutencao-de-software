import { getSession, signIn, signUp, signOut } from './auth.js';
// Alexandre: conectar a sessão real, atualizar o estado e recarregar a lista.
const $ = id => document.getElementById(id);
export async function setupAccount(onChange) {
  const dialog = $('account-dialog');
  $('open-account').addEventListener('click', () => { $('auth-message').textContent = ''; dialog.showModal(); });
  $('close-account').addEventListener('click', () => dialog.close());
  $('account-form').addEventListener('submit', async e => {
    e.preventDefault();
    const action = e.submitter?.value === 'signup' ? signUp : signIn;
    try {
      await action($('email').value, $('password').value);
      $('account-form').reset(); dialog.close(); await onChange();
    } catch (error) { $('auth-message').textContent = error.message; }
  });
  $('logout').addEventListener('click', async () => {
    try { await signOut(); await onChange(); } catch (error) { $('auth-message').textContent = error.message; dialog.showModal(); }
  });
  const session = await getSession();
  $('account-status').textContent = session?.user?.email || 'Modo demonstração local';
  $('logout').hidden = !session;
  $('open-account').hidden = !!session;
}
