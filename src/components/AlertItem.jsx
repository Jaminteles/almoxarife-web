import { Box, Typography, Button } from "@mui/material";

/**
 * Linha de alerta no dashboard (ex.: "Estoque baixo", "Itens vencendo").
 *
 * O componente é "burro" — só exibe o que recebe. Toda lógica (navegar,
 * buscar dados, etc.) fica fora dele. Isso é o padrão "presentational
 * component": fácil de testar, fácil de reusar.
 */
export default function AlertItem({ icon, color = "#ef4444", title, description, actionLabel = "Ver itens", onAction }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 2,
        border: "1px solid rgba(255,255,255,0.06)",
        bgcolor: "rgba(255,255,255,0.02)"
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
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
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">{description}</Typography>
      </Box>
      <Button
        size="small"
        variant="outlined"
        sx={{ color, borderColor: color, flexShrink: 0, "&:hover": { borderColor: color, bgcolor: `${color}11` } }}
        onClick={onAction}
      >
        {actionLabel}
      </Button>
    </Box>
  );
}
