import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    Alert,
    Stack
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user: authUser, token } = useAuth();
    const navigate = useNavigate();

    console.log('Dashboard - Auth Status:', {
        token: token ? 'exists' : 'missing',
        authUser: authUser ? authUser.name : 'none'
    });

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                🎯 Skill Swap Dashboard
            </Typography>

            <Stack spacing={3}>
                {/* Debug Card */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            🔍 Debug Information
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Token: {token ? '✅ Present' : '❌ Missing'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Auth User: {authUser ? `✅ ${authUser.name} (${authUser.email})` : '❌ Not loaded'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Admin: {authUser?.isAdmin ? '✅ Yes' : '❌ No'}
                        </Typography>

                        {!token && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                You are not logged in. Please log in to see your dashboard.
                            </Alert>
                        )}

                        <Stack direction="row" spacing={2}>
                            {!token ? (
                                <>
                                    <Button variant="contained" onClick={() => navigate('/login')}>
                                        Go to Login
                                    </Button>
                                    <Button variant="outlined" onClick={() => navigate('/register')}>
                                        Create Account
                                    </Button>
                                </>
                            ) : (
                                <Button variant="outlined" onClick={() => window.location.reload()}>
                                    Refresh Page
                                </Button>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                {/* Test Accounts Card */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            🔑 Test Accounts Available
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                📧 john@example.com / password123 (Regular User)
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                📧 jane@example.com / password123 (Admin User)
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                📧 alice@example.com / password123 (Regular User)
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            🚀 Quick Actions
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button variant="contained" onClick={() => navigate('/browse')}>
                                Browse Skills
                            </Button>
                            <Button variant="outlined" onClick={() => navigate('/profile')}>
                                Edit Profile
                            </Button>
                            <Button variant="outlined" onClick={() => navigate('/swap-requests')}>
                                Swap Requests
                            </Button>
                            {authUser?.isAdmin && (
                                <Button variant="outlined" onClick={() => navigate('/admin')}>
                                    Admin Panel
                                </Button>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                {/* Backend Status */}
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            🌐 Backend Status
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                            Backend Server: <code>http://localhost:5000</code>
                        </Typography>
                        <Button
                            variant="outlined"
                            onClick={() => window.open('http://localhost:5000/api/health', '_blank')}
                        >
                            Check Backend Health
                        </Button>
                    </CardContent>
                </Card>
            </Stack>
        </Container>
    );
};

export default Dashboard;
