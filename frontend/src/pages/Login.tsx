import React, { useState } from 'react';
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Link as MUILink,
    Alert,
    CircularProgress,
} from '@mui/material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Login successful!');
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box textAlign="center" mb={3}>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        Welcome Back
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Sign in to your SkillSwap account
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        required
                        autoComplete="email"
                        autoFocus
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        required
                        autoComplete="current-password"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Sign In'}
                    </Button>
                </Box>

                <Box textAlign="center" mt={2}>
                    <Typography variant="body2">
                        Don't have an account?{' '}
                        <MUILink component={Link} to="/register" underline="hover">
                            Sign up here
                        </MUILink>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
