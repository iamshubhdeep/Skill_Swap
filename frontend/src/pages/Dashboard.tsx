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
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Person,
    Star,
    School,
    Add,
    TrendingUp,
    Edit,
    Save,
    Cancel
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface Skill {
    name: string;
    level: string;
    description?: string;
}

interface User {
    id: string;
    _id?: string; // Backend might return _id instead of id
    name: string;
    email: string;
    bio?: string;
    location?: string;
    profilePhoto?: string;
    skillsOffered: Skill[];
    skillsWanted: Skill[];
    rating?: number;
    completedSwaps?: number;
    isAdmin: boolean;
}

const Dashboard: React.FC = () => {
    const { user: authUser, token, updateUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    const navigate = useNavigate();

    // Skill management state
    const [skillDialog, setSkillDialog] = useState<{
        open: boolean;
        type: 'offered' | 'wanted';
        skill?: Skill;
        index?: number;
        isEdit?: boolean;
    }>({ open: false, type: 'offered' });

    const [newSkill, setNewSkill] = useState<Skill>({
        name: '',
        level: 'Beginner',
        description: ''
    });

    const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

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
            console.log('API Response:', response.data); // Debug log

            const userData = response.data.user;
            console.log('User Data:', userData); // Debug log

            // Ensure skillsOffered and skillsWanted are arrays
            const processedUser = {
                ...userData,
                skillsOffered: userData.skillsOffered || [],
                skillsWanted: userData.skillsWanted || []
            };

            setUser(processedUser);
            setNewName(processedUser.name || '');
        } catch (err: any) {
            console.error('Error fetching user data:', err);
            setError(err.response?.data?.message || 'Failed to fetch user data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveName = async () => {
        try {
            const response = await apiService.updateProfile({ name: newName });
            setUser(response.data.user);
            updateUser(response.data.user);
            setEditingName(false);
            toast.success('Name updated successfully');
        } catch (error: any) {
            console.error('Error updating name:', error);
            toast.error('Failed to update name');
        }
    };

    const handleAddSkill = async () => {
        if (!user || !newSkill.name) return;

        try {
            const updatedUser = { ...user };
            if (skillDialog.isEdit && skillDialog.index !== undefined) {
                // Edit existing skill
                if (skillDialog.type === 'offered') {
                    updatedUser.skillsOffered[skillDialog.index] = newSkill;
                } else {
                    updatedUser.skillsWanted[skillDialog.index] = newSkill;
                }
            } else {
                // Add new skill
                if (skillDialog.type === 'offered') {
                    updatedUser.skillsOffered = [...updatedUser.skillsOffered, newSkill];
                } else {
                    updatedUser.skillsWanted = [...updatedUser.skillsWanted, newSkill];
                }
            }

            // Save to backend
            await apiService.updateProfile({
                skillsOffered: updatedUser.skillsOffered,
                skillsWanted: updatedUser.skillsWanted
            });

            setUser(updatedUser);
            // Only update auth context with basic user info
            updateUser({
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin
            });
            setSkillDialog({ open: false, type: 'offered' });
            setNewSkill({ name: '', level: 'Beginner', description: '' });
            toast.success(skillDialog.isEdit ? 'Skill updated successfully' : 'Skill added successfully');
        } catch (error: any) {
            console.error('Error saving skill:', error);
            toast.error('Failed to save skill');
        }
    };

    const handleEditSkill = (type: 'offered' | 'wanted', index: number) => {
        const skill = type === 'offered' ? user?.skillsOffered[index] : user?.skillsWanted[index];
        if (skill) {
            setNewSkill(skill);
            setSkillDialog({ open: true, type, index, isEdit: true });
        }
    };

    const handleRemoveSkill = async (type: 'offered' | 'wanted', index: number) => {
        if (!user) return;

        try {
            const updatedUser = { ...user };
            if (type === 'offered') {
                updatedUser.skillsOffered.splice(index, 1);
            } else {
                updatedUser.skillsWanted.splice(index, 1);
            }

            await apiService.updateProfile({
                skillsOffered: updatedUser.skillsOffered,
                skillsWanted: updatedUser.skillsWanted
            });

            setUser(updatedUser);
            // Only update auth context with basic user info
            updateUser({
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin
            });
            toast.success('Skill removed successfully');
        } catch (error: any) {
            console.error('Error removing skill:', error);
            toast.error('Failed to remove skill');
        }
    };

    if (!token) {
        return null;
    }

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>Loading Dashboard...</Typography>
                <Stack spacing={3}>
                    <Skeleton variant="rectangular" height={200} />
                    <Skeleton variant="rectangular" height={200} />
                </Stack>
            </Container>
        );
    }

    if (error && !user) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
                <Button onClick={fetchUserData} variant="outlined">
                    Retry
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Welcome back, {user?.name || authUser?.name || 'User'}!
            </Typography>

            {error && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    Some data may not be available: {error}
                </Alert>
            )}

            <Stack spacing={3}>
                {/* User Profile Card with Inline Name Editing */}
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar
                                src={user?.profilePhoto}
                                sx={{ width: 60, height: 60, mr: 2 }}
                            >
                                <Person sx={{ fontSize: 30 }} />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                {editingName ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <TextField
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            placeholder="Enter your name"
                                            autoFocus
                                        />
                                        <IconButton onClick={handleSaveName} color="primary">
                                            <Save />
                                        </IconButton>
                                        <IconButton onClick={() => {
                                            setEditingName(false);
                                            setNewName(user?.name || '');
                                        }} color="default">
                                            <Cancel />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <Typography variant="h6">
                                            {user?.name || authUser?.name}
                                        </Typography>
                                        <Tooltip title="Edit name">
                                            <IconButton
                                                size="small"
                                                onClick={() => setEditingName(true)}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                                <Typography variant="body2" color="text.secondary">
                                    {user?.email || authUser?.email}
                                </Typography>
                                {user?.location && (
                                    <Typography variant="body2" color="text.secondary">
                                        📍 {user.location}
                                    </Typography>
                                )}
                                {user?.rating && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <Star sx={{ fontSize: 16, mr: 0.5, color: 'primary.main' }} />
                                        <Typography variant="body2">
                                            {user.rating.toFixed(1)} ({user.completedSwaps || 0} swaps)
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            <Button
                                variant="outlined"
                                startIcon={<Person />}
                                onClick={() => navigate('/profile')}
                            >
                                Edit Profile
                            </Button>
                        </Box>

                        {user?.bio && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {user.bio}
                            </Typography>
                        )}

                        {/* Additional User Stats */}
                        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Stack direction="row" spacing={3} divider={<Box sx={{ width: 1, height: 20, bgcolor: 'divider' }} />}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" color="primary">
                                        {user?.skillsOffered?.length || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Skills Offered
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" color="secondary">
                                        {user?.skillsWanted?.length || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Skills Wanted
                                    </Typography>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="h6" color="success.main">
                                        {user?.completedSwaps || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Completed Swaps
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </CardContent>
                </Card>

                {/* Skills Overview */}
                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <School sx={{ mr: 1 }} />
                            My Skills
                        </Typography>

                        <Stack spacing={3}>
                            {/* Skills Offered Section */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                                        Skills I Offer ({user?.skillsOffered?.length || 0})
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<Add />}
                                        onClick={() => setSkillDialog({ open: true, type: 'offered' })}
                                        sx={{ minWidth: 120 }}
                                    >
                                        Add Skill
                                    </Button>
                                </Box>
                                {user?.skillsOffered && user.skillsOffered.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {user.skillsOffered.map((skill, index) => (
                                            <Chip
                                                key={index}
                                                label={`${skill.name} (${skill.level})`}
                                                color="primary"
                                                variant="filled"
                                                onDelete={() => handleRemoveSkill('offered', index)}
                                                onClick={() => handleEditSkill('offered', index)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    '&:hover': { backgroundColor: 'primary.dark' }
                                                }}
                                            />
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        p: 3,
                                        border: '2px dashed',
                                        borderColor: 'grey.300',
                                        borderRadius: 2,
                                        textAlign: 'center',
                                        backgroundColor: 'grey.50'
                                    }}>
                                        <Typography variant="body1" color="text.secondary" gutterBottom>
                                            No skills added yet
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Add your skills to start connecting with other learners!
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Skills Wanted Section */}
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <School sx={{ mr: 1, color: 'secondary.main' }} />
                                        Skills I Want to Learn ({user?.skillsWanted?.length || 0})
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        size="small"
                                        startIcon={<Add />}
                                        onClick={() => setSkillDialog({ open: true, type: 'wanted' })}
                                        sx={{ minWidth: 120 }}
                                    >
                                        Add Goal
                                    </Button>
                                </Box>
                                {user?.skillsWanted && user.skillsWanted.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {user.skillsWanted.map((skill, index) => (
                                            <Chip
                                                key={index}
                                                label={`${skill.name} (${skill.level})`}
                                                color="secondary"
                                                variant="filled"
                                                onDelete={() => handleRemoveSkill('wanted', index)}
                                                onClick={() => handleEditSkill('wanted', index)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    '&:hover': { backgroundColor: 'secondary.dark' }
                                                }}
                                            />
                                        ))}
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        p: 3,
                                        border: '2px dashed',
                                        borderColor: 'grey.300',
                                        borderRadius: 2,
                                        textAlign: 'center',
                                        backgroundColor: 'grey.50'
                                    }}>
                                        <Typography variant="body1" color="text.secondary" gutterBottom>
                                            No learning goals set
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Add skills you want to learn to find potential mentors!
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>

            {/* Skill Management Dialog */}
            <Dialog open={skillDialog.open} onClose={() => setSkillDialog({ open: false, type: 'offered' })} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {skillDialog.isEdit ? 'Edit' : 'Add'} {skillDialog.type === 'offered' ? 'Skill You Offer' : 'Learning Goal'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            autoFocus
                            label="Skill Name"
                            value={newSkill.name}
                            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                            fullWidth
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel>Skill Level</InputLabel>
                            <Select
                                value={newSkill.level}
                                label="Skill Level"
                                onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                            >
                                {skillLevels.map((level) => (
                                    <MenuItem key={level} value={level}>
                                        {level}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Description (Optional)"
                            value={newSkill.description || ''}
                            onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setSkillDialog({ open: false, type: 'offered' });
                        setNewSkill({ name: '', level: 'Beginner', description: '' });
                    }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddSkill}
                        variant="contained"
                        disabled={!newSkill.name.trim()}
                    >
                        {skillDialog.isEdit ? 'Update' : 'Add'} Skill
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Dashboard;
