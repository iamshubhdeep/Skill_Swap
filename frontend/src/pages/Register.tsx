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
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const validateForm = () => {
        const newErrors: string[] = [];

        if (formData.name.trim().length < 2) {
            newErrors.push('Name must be at least 2 characters long');
        }

        if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
            newErrors.push('Please enter a valid email address');
        }

        if (formData.password.length < 6) {
            newErrors.push('Password must be at least 6 characters long');
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.push('Passwords do not match');
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            await register(formData.name, formData.email, formData.password);
            toast.success('Account created successfully!');
            navigate('/dashboard');
        } catch (err: any) {
            toast.error(err.message);
            setErrors([err.message]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box textAlign="center" mb={3}>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        Join SkillSwap
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Create your account and start exchanging skills
                    </Typography>
                </Box>

                {errors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errors.map((error, index) => (
                            <div key={index}>{error}</div>
                        ))}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        margin="normal"
                        required
                        autoComplete="name"
                        autoFocus
                    />
                    <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        margin="normal"
                        required
                        autoComplete="email"
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        margin="normal"
                        required
                        autoComplete="new-password"
                    />
                    <TextField
                        fullWidth
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        margin="normal"
                        required
                        autoComplete="new-password"
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Create Account'}
                    </Button>
                </Box>

                <Box textAlign="center" mt={2}>
                    <Typography variant="body2">
                        Already have an account?{' '}
                        <MUILink component={Link} to="/login" underline="hover">
                            Sign in here
                        </MUILink>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Register;
