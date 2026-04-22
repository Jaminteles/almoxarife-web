import { Paper, Box, Typography } from "@mui/material";

/**
 * Cartão de resumo do dashboard.
 * Recebe:
 *  - icon: ícone JSX a exibir
 *  - color: cor de destaque (será usada no fundo do ícone e como hint visual)
 *  - value: número grande (pode ser string ou número)
 *  - label: descrição curta embaixo do número
 *  - footer: opcional — aparece embaixo (ex.: link "Ver detalhes →")
 *
 * Repare que o componente não decide o que fazer no clique do footer —
 * isso fica a cargo de quem usa. Separação de responsabilidades!
 */
export default function SummaryCard({ icon, color = "#3b82f6", value, label, footer }) {
  return (
    <Paper
      sx={{
        p: 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        transition: "transform .15s ease, border-color .15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "rgba(255,255,255,0.12)"
        }
      }}
    >
      {/* Caixa do ícone com cor translúcida correspondente */}
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: `${color}22`, // "22" em hex = ~13% opacidade
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {icon}
      </Box>

      <Typography variant="h4" fontWeight={700}>
        {value}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mt: -0.5 }}>
        {label}
      </Typography>

      {footer && <Box sx={{ mt: "auto", pt: 1 }}>{footer}</Box>}
    </Paper>
  );
}
