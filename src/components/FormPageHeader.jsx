import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

/**
 * Cabeçalho padrão para páginas de formulário (Cadastro / Edição).
 *
 * Por que criar um componente?
 * Porque TODA página de form do sistema precisa de:
 *   [<-] [Título grande]
 *        [subtítulo em cinza]
 *
 * Sem esse componente, eu teria que copiar esse bloco JSX em 4 arquivos
 * (Form e Edit de Funcionários + Form e Edit de Fornecedores). Com ele,
 * muda-se o layout em 1 lugar e reflete em todos.
 *
 * Props:
 *   - title: título principal (ex.: "Cadastrar Funcionário")
 *   - subtitle: texto auxiliar abaixo (ex.: "Preencha os dados do novo funcionário")
 *   - backTo: rota para onde voltar (se não passar, usa navigate(-1) = página anterior)
 */
export default function FormPageHeader({ title, subtitle, backTo }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) navigate(backTo);
    else navigate(-1);
  };

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 3 }}>
      <Tooltip title="Voltar">
        <IconButton
          onClick={handleBack}
          sx={{
            mt: 0.5,
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 2,
            "&:hover": { bgcolor: "rgba(255,255,255,0.04)" }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>

      <Box>
        <Typography variant="h5" fontWeight={600}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
