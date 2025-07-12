import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Chip,
    useTheme,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Home,
    Search,
    SwapHoriz,
    Person,
    Dashboard,
    AdminPanelSettings,
    Logout,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleMenuClose();
        navigate('/');
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const menuItems = [
        { text: 'Home', icon: <Home />, path: '/' },
        { text: 'Browse Skills', icon: <Search />, path: '/browse' },
        ...(user ? [
            { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
            { text: 'Swap Requests', icon: <SwapHoriz />, path: '/swap-requests' },
            { text: 'Profile', icon: <Person />, path: '/profile' },
            ...(user.isAdmin ? [{ text: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin' }] : []),
        ] : []),
    ];

    const drawer = (
        <Box sx={{ width: 250 }} role="presentation">
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.text}
                        component={Link}
                        to={item.path}
                        onClick={handleDrawerToggle}
                        sx={{
                            backgroundColor: location.pathname === item.path ? 'primary.light' : 'transparent',
                            '&:hover': { backgroundColor: 'grey.100' },
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
                {user && (
                    <ListItem onClick={handleLogout} sx={{ '&:hover': { backgroundColor: 'grey.100' } }}>
                        <ListItemIcon><Logout /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItem>
                )}
            </List>
        </Box>
    );

    return (
        <>
            <AppBar position="sticky" elevation={1} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
                <Toolbar>
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: isMobile ? 1 : 0,
                            textDecoration: 'none',
                            color: 'primary.main',
                            fontWeight: 'bold',
                            mr: 4,
                        }}
                    >
                        SkillSwap
                    </Typography>

                    {!isMobile && (
                        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
                            <Button
                                color="inherit"
                                component={Link}
                                to="/browse"
                                sx={{ color: location.pathname === '/browse' ? 'primary.main' : 'text.primary' }}
                            >
                                Browse Skills
                            </Button>
                            {user && (
                                <>
                                    <Button
                                        color="inherit"
                                        component={Link}
                                        to="/dashboard"
                                        sx={{ color: location.pathname === '/dashboard' ? 'primary.main' : 'text.primary' }}
                                    >
                                        Dashboard
                                    </Button>
                                    <Button
                                        color="inherit"
                                        component={Link}
                                        to="/swap-requests"
                                        sx={{ color: location.pathname === '/swap-requests' ? 'primary.main' : 'text.primary' }}
                                    >
                                        Swap Requests
                                    </Button>
                                    {user.isAdmin && (
                                        <Button
                                            color="inherit"
                                            component={Link}
                                            to="/admin"
                                            sx={{ color: location.pathname === '/admin' ? 'primary.main' : 'text.primary' }}
                                        >
                                            Admin Panel
                                        </Button>
                                    )}
                                </>
                            )}
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {user ? (
                            <>
                                {user.isAdmin && (
                                    <Chip
                                        label="Admin"
                                        color="secondary"
                                        size="small"
                                        sx={{ mr: 1 }}
                                    />
                                )}
                                <IconButton
                                    size="large"
                                    edge="end"
                                    aria-label="account of current user"
                                    aria-haspopup="true"
                                    onClick={handleProfileMenuOpen}
                                    color="inherit"
                                >
                                    <Avatar
                                        src={user.profilePhoto}
                                        alt={user.name}
                                        sx={{ width: 32, height: 32 }}
                                    >
                                        {user.name.charAt(0)}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleMenuClose}
                                    anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'right',
                                    }}
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                >
                                    <MenuItem component={Link} to="/profile" onClick={handleMenuClose}>
                                        <Person sx={{ mr: 1 }} />
                                        Profile
                                    </MenuItem>
                                    <MenuItem component={Link} to="/dashboard" onClick={handleMenuClose}>
                                        <Dashboard sx={{ mr: 1 }} />
                                        Dashboard
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        <Logout sx={{ mr: 1 }} />
                                        Logout
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    color="inherit"
                                    component={Link}
                                    to="/login"
                                    variant="outlined"
                                    size="small"
                                >
                                    Login
                                </Button>
                                <Button
                                    component={Link}
                                    to="/register"
                                    variant="contained"
                                    size="small"
                                >
                                    Sign Up
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
                }}
            >
                {drawer}
            </Drawer>
        </>
    );
};

export default Navbar;
