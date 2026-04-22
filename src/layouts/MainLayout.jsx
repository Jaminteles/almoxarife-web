import { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Toolbar,
  Typography,
  IconButton,
  AppBar,
  Avatar,
  Badge,
  Tooltip,
  Divider
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

// Ícones
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const drawerWidth = 240;

/**
 * Configuração declarativa do menu.
 *
 * Por que assim? Porque é MUITO mais fácil manter: para adicionar um módulo novo
 * no futuro, basta incluir um objeto aqui. A estrutura JSX abaixo renderiza
 * todos os itens automaticamente. Isso é o padrão "data-driven UI".
 *
 * `enabled: false` => vira "botão fantasma" (clicável mas leva para página
 * ComingSoon e visualmente opaco).
 */
const menuItems = [
  { label: "Início",        icon: <HomeIcon />,        path: "/",              enabled: true  },
  { label: "Funcionários",  icon: <PeopleIcon />,      path: "/funcionarios",  enabled: true  },
  { label: "Fornecedores",  icon: <StorefrontIcon />,  path: "/fornecedores",  enabled: true  },
  { label: "Produtos / Itens", icon: <Inventory2Icon />, path: "/produtos",    enabled: false },
  { label: "Entradas",      icon: <DownloadIcon />,    path: "/entradas",      enabled: false },
  { label: "Saídas",        icon: <UploadIcon />,      path: "/saidas",        enabled: false },
  { label: "Movimentações", icon: <SwapHorizIcon />,   path: "/movimentacoes", enabled: false },
  { label: "Relatórios",    icon: <AssessmentIcon />,  path: "/relatorios",    enabled: false },
  { label: "Configurações", icon: <SettingsIcon />,    path: "/configuracoes", enabled: false }
];

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  /**
   * Relógio que atualiza a cada segundo.
   * `useEffect` com setInterval. Muito importante: o return do useEffect
   * precisa limpar o interval, senão ele continua rodando mesmo quando o
   * componente é desmontado (leak de memória).
   */
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  /**
   * Função que decide se um item do menu está "ativo" (destacado em vermelho).
   * Para "/" precisa ser comparação exata, senão TODA rota começa com "/" e
   * tudo ficaria ativo. Para as outras, basta começar com o path.
   */
  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Espaçamento sob a AppBar no modo desktop */}
      <Toolbar sx={{ display: { xs: "none", sm: "block" } }} />

      {/* Lista principal de navegação */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);

          const button = (
            <ListItemButton
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false); // fecha o drawer no mobile
              }}
              sx={{
                // Item ativo = vermelho translúcido + texto vermelho
                bgcolor: active ? "rgba(239,68,68,0.12)" : "transparent",
                color:   active ? "primary.main" : "text.primary",
                opacity: item.enabled ? 1 : 0.45, // itens desabilitados ficam "fantasmas"
                "&:hover": {
                  bgcolor: active ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.05)"
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: active ? "primary.main" : "text.secondary",
                  minWidth: 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500 }}
              />
            </ListItemButton>
          );

          // Se o item for "fantasma", envolve num Tooltip explicando
          return item.enabled ? (
            button
          ) : (
            <Tooltip key={item.path} title="Em desenvolvimento" placement="right" arrow>
              {button}
            </Tooltip>
          );
        })}
      </List>

      {/* Rodapé da sidebar: data e hora atuais (como na imagem de referência) */}
      <Divider />
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: "rgba(239,68,68,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <CalendarTodayIcon sx={{ fontSize: 18, color: "primary.main" }} />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Data e hora
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {now.toLocaleDateString("pt-BR")} {now.toLocaleTimeString("pt-BR")}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* TOPBAR */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: "background.paper",
          borderBottom: "1px solid rgba(255,255,255,0.06)"
        }}
      >
        <Toolbar>
          {/* Botão hamburger — só aparece no mobile */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            {drawerOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>

          <Typography
            variant="h6"
            onClick={() => navigate("/")}
            sx={{
              cursor: "pointer",
              flexGrow: 1,
              fontWeight: 700,
              "&:hover": { opacity: 0.85 }
            }}
          >
            Sistema de Almoxarifado
          </Typography>

          {/* Ações do topo direito */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton color="inherit" size="small">
              <DarkModeIcon />
            </IconButton>
            <IconButton color="inherit" size="small">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: 1 }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main" }}>JS</Avatar>
              <Box sx={{ display: { xs: "none", md: "block" }, lineHeight: 1.2 }}>
                <Typography variant="body2" fontWeight={600}>Olá, João Silva</Typography>
                <Typography variant="caption" color="text.secondary">Administrador</Typography>
              </Box>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer desktop (fixo à esquerda) */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: "none", sm: "block" },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            borderRight: "1px solid rgba(255,255,255,0.06)"
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer mobile (abre e fecha) */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }} // melhor performance no mobile
        sx={{
          display: { xs: "block", sm: "none" },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "background.paper"
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Área principal de conteúdo */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          mt: "64px",
          width: { sm: `calc(100% - ${drawerWidth}px)` }
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
