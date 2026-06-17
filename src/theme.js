import { createTheme } from "@mui/material";

/**
 * Tema central do Sistema de Almoxarifado.
 *
 * Agora é uma FÁBRICA: `getTheme(mode)` devolve o tema no modo escuro ou claro.
 * Assim o mesmo conjunto de regras (cor primária, tipografia, formatos) é
 * reaproveitado nos dois modos, mudando só as cores de fundo/texto.
 */
export function getTheme(mode = "dark") {
  const escuro = mode === "dark";

  // Borda dos cards: clara sobre fundo escuro, escura sobre fundo claro.
  const bordaPaper = escuro
    ? "1px solid rgba(255,255,255,0.06)"
    : "1px solid rgba(0,0,0,0.08)";

  return createTheme({
    palette: {
      mode,
      // Vermelho como cor primária para acompanhar o visual do mockup
      primary: {
        main: "#ef4444",
        dark: "#dc2626",
        light: "#f87171",
        contrastText: "#ffffff"
      },
      secondary: { main: "#3b82f6" },
      success: { main: "#10b981" },
      warning: { main: "#f59e0b" },
      error: { main: "#ef4444" },
      info: { main: "#3b82f6" },
      background: escuro
        ? { default: "#0f131a", paper: "#171b24" }
        : { default: "#f5f6f8", paper: "#ffffff" },
      divider: escuro ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
      text: escuro
        ? { primary: "#f3f4f6", secondary: "#9ca3af", disabled: "#4b5563" }
        : { primary: "#111827", secondary: "#6b7280", disabled: "#9ca3af" }
    },
    shape: {
      borderRadius: 12
    },
    typography: {
      fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: "none", fontWeight: 600 }
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: bordaPaper
          }
        }
      },
      MuiButton: {
        styleOverrides: { root: { borderRadius: 10 } }
      },
      MuiListItemButton: {
        styleOverrides: { root: { borderRadius: 10, margin: "2px 8px" } }
      }
    }
  });
}

// Compatibilidade: tema escuro padrão.
const theme = getTheme("dark");
export default theme;
