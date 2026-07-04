import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { API_BASE, TOKEN_KEY, USER_KEY } from "./http";
import { podeVer as verNivel, podeEditar as editarNivel } from "./permissions";

const AuthContext = createContext(null);

/**
 * Provedor de autenticação.
 * Mantém { user, token } persistidos em localStorage e expõe login/logout
 * e helpers de permissão (podeVer/podeEditar) já ligados ao nível do usuário.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(!!localStorage.getItem(TOKEN_KEY));

  // Ao montar com um token salvo, valida-o contra /api/auth/me.
  // Se o token estiver expirado/inválido, a sessão é encerrada.
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let ativo = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`);
        const json = await res.json();
        if (!ativo) return;
        if (res.ok && json.sucesso) {
          setUser(json.usuario);
          localStorage.setItem(USER_KEY, JSON.stringify(json.usuario));
        } else {
          limparSessao();
        }
      } catch {
        // Erro de rede: mantém o usuário do localStorage (modo otimista).
      } finally {
        if (ativo) setLoading(false);
      }
    })();

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function limparSessao() {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  const login = useCallback(async (email, senha) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    const json = await res.json();

    if (!res.ok || !json.sucesso) {
      throw new Error(json.erro || "Falha ao autenticar");
    }

    localStorage.setItem(TOKEN_KEY, json.token);
    localStorage.setItem(USER_KEY, JSON.stringify(json.usuario));
    setToken(json.token);
    setUser(json.usuario);
    return json.usuario;
  }, []);

  const logout = useCallback(() => {
    limparSessao();
  }, []);

  const podeVer = useCallback(
    (modulo) => (user ? verNivel(user.access_level, modulo) : false),
    [user]
  );
  const podeEditar = useCallback(
    (modulo) => (user ? editarNivel(user.access_level, modulo) : false),
    [user]
  );

  const value = { user, token, loading, login, logout, podeVer, podeEditar };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  }
  return ctx;
}
