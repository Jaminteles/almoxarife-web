import { Box, Typography, ButtonBase } from "@mui/material";

/**
 * Botão de "Ação rápida" usado no dashboard.
 *
 * Usa ButtonBase (e não Button) porque queremos um visual totalmente
 * customizado mas mantendo acessibilidade (foco, enter, tab, etc.).
 * ButtonBase dá o comportamento de botão sem estilos visuais prontos.
 */
export default function QuickAction({ icon, color = "#3b82f6", label, onClick, disabled = false }) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: "100%",
        p: 1.5,
        borderRadius: 2,
        justifyContent: "flex-start",
        gap: 1.5,
        opacity: disabled ? 0.45 : 1,
        transition: "background-color .15s ease",
        "&:hover": {
          bgcolor: "rgba(255,255,255,0.04)"
        }
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          borderRadius: 2,
          bgcolor: `${color}22`,
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" fontWeight={500} textAlign="left">
        {label}
      </Typography>
    </ButtonBase>
  );
}
