// ──────────────────────────────────────────────────────────────
// Interceptor HTTP global.
//
// Instala um wrapper sobre window.fetch que:
//   1. anexa o header Authorization: Bearer <token> às chamadas da API;
//   2. em resposta 401 (token ausente/expirado), limpa a sessão e
//      redireciona para /login.
//
// Fazemos isso de forma centralizada para não precisar tocar em cada
// página que usa fetch. (Todo o front-end consome a API via fetch.)
// ──────────────────────────────────────────────────────────────

// Usa o mesmo host pelo qual a página foi aberta (localhost no PC,
// ou o IP do PC quando acessada pelo celular na mesma rede), sempre na
// porta 5000 da API. Assim funciona tanto no PC quanto no celular sem
// precisar editar código.
export const API_BASE = `http://${window.location.hostname}:5000`;
export const TOKEN_KEY = "auth_token";
export const USER_KEY = "auth_user";

let instalado = false;

function ehApi(url) {
  return typeof url === "string" && url.startsWith(API_BASE);
}

function ehLogin(url) {
  return typeof url === "string" && url.includes("/api/auth/login");
}

function encerrarSessao() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (window.location.pathname !== "/login") {
    // Redirecionamento "duro" — garante limpar todo o estado da SPA.
    window.location.assign("/login");
  }
}

export function installHttpInterceptor() {
  if (instalado) return;
  instalado = true;

  // ── fetch ──
  const fetchOriginal = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url;
    let options = init;

    if (ehApi(url) && !ehLogin(url)) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        options = {
          ...init,
          headers: { ...(init.headers || {}), Authorization: `Bearer ${token}` },
        };
      }
    }

    const resposta = await fetchOriginal(input, options);
    if (ehApi(url) && !ehLogin(url) && resposta.status === 401) {
      encerrarSessao();
    }
    return resposta;
  };
}
