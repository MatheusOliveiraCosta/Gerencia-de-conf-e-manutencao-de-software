import {
  getSession,
  signIn,
  signUp,
  signOut,
  isAuthConfigured,
  onAuthStateChange
} from './auth.js';

const $ = id => document.getElementById(id);

let initialized = false;
let currentOnChange = null;
let lastUserId = null;
let unsubscribeAuth = null;

function setAuthMessage(text = '', type = 'error') {
  const message = $('auth-message');
  if (!message) return;
  message.textContent = text;
  message.style.color = type === 'success' ? '#236047' : '';
}

function setFormBusy(busy) {
  const form = $('account-form');
  if (!form) return;
  for (const control of form.querySelectorAll('button[type="submit"], input')) {
    control.disabled = busy;
  }
}

function clearMealsPreview() {
  const grid = $('meals');
  const total = $('total');
  const count = $('count');
  if (grid) grid.replaceChildren();
  if (total) total.textContent = '0';
  if (count) count.textContent = '0';
}

function updateHelperText() {
  const helper = $('account-form')?.querySelector('.muted');
  if (!helper) return;
  helper.textContent = isAuthConfigured()
    ? 'Entre na sua conta ou crie um cadastro para sincronizar suas refeições.'
    : 'Modo demonstração local ativo (Supabase ainda não configurado neste ambiente).';
}

function applySessionUI(session) {
  const configured = isAuthConfigured();
  const email = session?.user?.email || '';

  const statusEl = $('account-status');
  const openBtn = $('open-account');
  const logoutBtn = $('logout');

  if (statusEl) {
    if (!configured) statusEl.textContent = 'Modo demonstração local';
    else statusEl.textContent = email || 'Não autenticado';
  }

  if (openBtn) openBtn.hidden = Boolean(configured && session);
  if (logoutBtn) logoutBtn.hidden = !(configured && session);

  if (configured && !session) {
    clearMealsPreview();
  }
}

async function notifyChange() {
  if (typeof currentOnChange === 'function') {
    await currentOnChange();
  }
}

export async function setupAccount(onChange) {
  currentOnChange = onChange;
  updateHelperText();

  const dialog = $('account-dialog');
  const form = $('account-form');
  const openBtn = $('open-account');
  const closeBtn = $('close-account');
  const logoutBtn = $('logout');

  if (!initialized) {
    initialized = true;

    openBtn?.addEventListener('click', () => {
      updateHelperText();
      setAuthMessage('');
      dialog?.showModal();
    });

    closeBtn?.addEventListener('click', () => {
      setAuthMessage('');
      dialog?.close();
    });

    form?.addEventListener('submit', async event => {
      event.preventDefault();
      setAuthMessage('');

      if (!isAuthConfigured()) {
        setAuthMessage('Supabase não configurado. Os dados continuam salvos apenas no modo demonstração local.');
        return;
      }

      const isSignUp = event.submitter?.value === 'signup';
      const email = $('email')?.value || '';
      const password = $('password')?.value || '';

      setFormBusy(true);
      try {
        const result = isSignUp
          ? await signUp(email, password)
          : await signIn(email, password);

        if (isSignUp && result.needsEmailConfirmation) {
          form.reset();
          setAuthMessage(
            'Conta criada! Confirme seu e-mail pelo link enviado antes de fazer login.',
            'success'
          );
          return;
        }

        const nextSession = result.session || (await getSession());
        lastUserId = nextSession?.user?.id ?? null;
        applySessionUI(nextSession);
        form.reset();
        setAuthMessage('');
        dialog?.close();
        await notifyChange();
      } catch (error) {
        setAuthMessage(error.message || 'Erro ao autenticar. Tente novamente.');
      } finally {
        setFormBusy(false);
      }
    });

    logoutBtn?.addEventListener('click', async () => {
      logoutBtn.disabled = true;
      try {
        await signOut();
        lastUserId = null;
        applySessionUI(null);
        await notifyChange();
      } catch (error) {
        setAuthMessage(error.message || 'Erro ao sair da conta.');
        dialog?.showModal();
      } finally {
        logoutBtn.disabled = false;
      }
    });
  }

  let initialSession = null;
  try {
    initialSession = await getSession();
  } catch (error) {
    const notice = $('notice');
    if (notice) notice.textContent = error.message;
  }

  lastUserId = initialSession?.user?.id ?? null;
  applySessionUI(initialSession);

  if (unsubscribeAuth) {
    unsubscribeAuth();
    unsubscribeAuth = null;
  }

  try {
    unsubscribeAuth = await onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') return;

      const nextUserId = session?.user?.id ?? null;
      const changed = nextUserId !== lastUserId;
      lastUserId = nextUserId;
      applySessionUI(session);

      if (changed) {
        await notifyChange();
      }
    });
  } catch {
    // Falha ao assinar listener não impede o carregamento inicial.
  }
}