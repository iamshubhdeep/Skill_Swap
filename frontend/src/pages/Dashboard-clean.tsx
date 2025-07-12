import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    Chip,
    Avatar,
    Button,
    Alert,
    Skeleton,
    Stack,
    Divider
} from '@mui/material';
import { Person, Star, SwapHoriz, Edit } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';

interface User {
    id: string;
    name: string;
    email: string;
    bio?: string;
    location?: string;
    profilePhoto?: string;
    skillsOffered: Array<{ name: string; level: string; description?: string }>;
    skillsWanted: Array<{ name: string; level: string; description?: string }>;
    rating?: number;
    completedSwaps?: number;
    isAdmin: boolean;
}

const Dashboard: React.FC = () => {
    const { user: authUser, token } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        fetchUserData();
    }, [token, navigate]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const response = await apiService.getCurrentUser();
            setUser(response.data.user);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return null;
    }

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width="40%" height={40} />
                    <Skeleton variant="text" width="60%" height={20} sx={{ mt: 1 }} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="rectangular" height={300} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="rectangular" height={300} />
                    </Box>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Welcome back, {user?.name || authUser?.name}!
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
                {/* Profile Summary Card */}
                <Box sx={{ flex: { xs: 1, lg: 1 } }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Avatar
                                    src={user?.profilePhoto}
                                    sx={{ width: 80, height: 80, mr: 2 }}
                                >
                                    <Person sx={{ fontSize: 40 }} />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h5" gutterBottom>
                                        {user?.name || 'Your Name'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        {user?.email}
                                    </Typography>
                                    {user?.location && (
                                        <Typography variant="body2" color="text.secondary">
                                            📍 {user.location}
                                        </Typography>
                                    )}
                                    {user?.rating && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <Star sx={{ fontSize: 18, color: 'primary.main', mr: 0.5 }} />
                                            <Typography variant="body2">
                                                {user.rating.toFixed(1)} ({user.completedSwaps || 0} swaps)
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<Edit />}
                                    onClick={() => navigate('/profile')}
                                    size="small"
                                >
                                    Edit
                                </Button>
                            </Box>

                            {user?.bio && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        About
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {user.bio}
                                    </Typography>
                                </Box>
                            )}

                            <Divider sx={{ my: 2 }} />

                            {/* Quick Stats */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                                <Box>
                                    <Typography variant="h6" color="primary">
                                        {user?.skillsOffered?.length || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Skills Offered
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h6" color="secondary">
                                        {user?.skillsWanted?.length || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Skills Wanted
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h6" color="text.primary">
                                        {user?.completedSwaps || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Completed Swaps
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Skills Overview */}
                <Box sx={{ flex: { xs: 1, lg: 1 } }}>
                    <Stack spacing={3}>
                        {/* Skills Offered */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="primary" gutterBottom>
                                    Skills I Can Teach
                                </Typography>
                                {user?.skillsOffered && user.skillsOffered.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {user.skillsOffered.map((skill, index) => (
                                            <Chip
                                                key={index}
                                                label={`${skill.name} (${skill.level})`}
                                                color="primary"
                                                variant="outlined"
                                                title={skill.description}
                                            />
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            No skills added yet
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            onClick={() => navigate('/profile')}
                                            size="small"
                                        >
                                            Add Skills
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Skills Wanted */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" color="secondary" gutterBottom>
                                    Skills I Want to Learn
                                </Typography>
                                {user?.skillsWanted && user.skillsWanted.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {user.skillsWanted.map((skill, index) => (
                                            <Chip
                                                key={index}
                                                label={`${skill.name} (${skill.level})`}
                                                color="secondary"
                                                variant="outlined"
                                                title={skill.description}
                                            />
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            No learning goals set yet
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            onClick={() => navigate('/profile')}
                                            size="small"
                                        >
                                            Add Learning Goals
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Quick Actions
                                </Typography>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Button
                                        variant="contained"
                                        startIcon={<SwapHoriz />}
                                        onClick={() => navigate('/browse')}
                                        fullWidth
                                    >
                                        Browse Skills
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/swap-requests')}
                                        fullWidth
                                    >
                                        My Swaps
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Stack>
                </Box>
            </Box>
        </Container>
    );
};

export default Dashboard;
