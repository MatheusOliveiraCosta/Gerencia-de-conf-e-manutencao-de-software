// TODO Alexandre: implementar autenticação real; não armazenar senhas no navegador.
export async function getSession() { return null; }
export async function signIn() { throw new Error('Login real ainda não integrado.'); }
export async function signUp() { throw new Error('Cadastro real ainda não integrado.'); }
export async function signOut() { throw new Error('Autenticação ainda não integrada.'); }
