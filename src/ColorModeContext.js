import { createContext } from "react";

/**
 * Contexto para alternar entre tema claro e escuro.
 * - mode: "dark" | "light"
 * - toggle(): inverte o modo
 */
const ColorModeContext = createContext({
  mode: "dark",
  toggle: () => {}
});

export default ColorModeContext;
