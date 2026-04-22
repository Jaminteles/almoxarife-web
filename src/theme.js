import { createTheme } from "@mui/material";

/**
 * Tema central do Sistema de Almoxarifado.
 *
 * Por que separar em arquivo próprio?
 * - Centraliza todas as cores/tipografia em um único lugar (Single Source of Truth).
 * - Evita repetir cores "mágicas" espalhadas pelos componentes.
 * - Se o cliente pedir para trocar a cor de destaque amanhã, troca-se aqui e pronto.
 */
const theme = createTheme({
  palette: {
    mode: "dark",
    // Vermelho como cor primária para acompanhar o visual do mockup
    primary: {
      main: "#ef4444",
      dark: "#dc2626",
      light: "#f87171",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#3b82f6"
    },
    success: { main: "#10b981" },
    warning: { main: "#f59e0b" },
    error:   { main: "#ef4444" },
    info:    { main: "#3b82f6" },
    background: {
      default: "#0f131a", // fundo da página (quase preto)
      paper:   "#171b24"  // fundo dos cards
    },
    divider: "rgba(255,255,255,0.08)",
    text: {
      primary:   "#f3f4f6",
      secondary: "#9ca3af",
      disabled:  "#4b5563"
    }
  },
  shape: {
    borderRadius: 12 // cantos arredondados — MUI aplica isso em tudo automaticamente
  },
  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 } // botões sem caixa alta
  },
  components: {
    // Sobrescritas globais de componentes — padronizam o visual do sistema inteiro
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none", // remove o gradiente padrão do MUI dark
          border: "1px solid rgba(255,255,255,0.06)"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10 }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: "2px 8px"
        }
      }
    }
  }
});

export default theme;
