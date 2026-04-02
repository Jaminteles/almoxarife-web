import { useState } from "react";
import { Drawer, List, ListItemButton, ListItemText, Box, Toolbar, Typography, IconButton, AppBar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const drawerWidth = 220;

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawerContent = (
    <>
    <Box sx={{ mt: { xs: 6.8, sm: 0 } }}>
      <List>
        <ListItemButton onClick={() => navigate("/funcionarios")} sx={{ pl: 2 }}>
          <ListItemText primary="Funcionários" />
        </ListItemButton>

        <ListItemButton onClick={() => navigate("/fornecedores")} sx={{ pl: 2 }}>
          <ListItemText primary="Fornecedores" />
        </ListItemButton>
      </List>
    </Box>
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* AppBar com botão menu */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
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
            noWrap
            onClick={() => navigate("/")}
            sx={{
                cursor: "pointer",
                "&:hover": { opacity: 0.8 }
            }}
            >
            Sistema de Almoxarifado
            </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer - Desktop (permanente) */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          display: { xs: "none", sm: "block" },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            mt: 8
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Drawer - Mobile (temporário/colapsável) */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          display: { xs: "block", sm: "none" },
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            overflowY: "auto"
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Conteúdo Principal */}
        <Box
        component="main"
        sx={{
            flexGrow: 1,
            p: 3,
            mt: "64px",
            ml: { sm: `${0}px` },
            display: "flex",
            flexDirection: "column"
        }}
        >
        {children}
        </Box>
    </Box>
  );
}