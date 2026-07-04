import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuth } from "./AuthContext";

/**
 * Exige um usuário autenticado. Enquanto valida o token, mostra um spinner.
 * Sem sessão → redireciona para /login guardando a rota de origem.
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Guarda de rota por módulo.
 * - acao="ver" (padrão): exige permissão de leitura (podeVer).
 * - acao="editar": exige permissão de escrita (podeEditar) — para rotas de
 *   cadastro/edição, impedindo que um usuário só-leitura chegue ao formulário
 *   digitando a URL direto.
 * Sem permissão → redireciona para a tela "sem permissão".
 */
export function RequireModule({ modulo, acao = "ver", children }) {
  const { user, podeVer, podeEditar, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const permitido = acao === "editar" ? podeEditar(modulo) : podeVer(modulo);
  if (!permitido) return <Navigate to="/sem-permissao" replace />;

  return children;
}

/**
 * Guarda de rota exclusiva do nível CENTRAL (ex.: solicitações de cadastro).
 */
export function RequireCentral({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.access_level !== "CENTRAL") return <Navigate to="/sem-permissao" replace />;

  return children;
}
