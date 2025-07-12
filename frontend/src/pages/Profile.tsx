import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Avatar,
    Chip,
    Stack,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton
} from '@mui/material';
import {
    Person,
    Edit,
    Add,
    Delete,
    Save,
    Cancel,
    PhotoCamera
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface Skill {
    name: string;
    level: string;
    description?: string;
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    bio?: string;
    location?: string;
    profilePhoto?: string;
    skillsOffered: Skill[];
    skillsWanted: Skill[];
    rating?: number;
    completedSwaps?: number;
    isPublic?: boolean;
}

const Profile: React.FC = () => {
    const { user: authUser, updateUser } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState('');
    const [skillDialog, setSkillDialog] = useState<{
        open: boolean;
        type: 'offered' | 'wanted';
        skill?: Skill;
        index?: number;
    }>({ open: false, type: 'offered' });

    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        location: '',
        isPublic: true
    });

    const [newSkill, setNewSkill] = useState<Skill>({
        name: '',
        level: 'Beginner',
        description: ''
    });

    const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

    useEffect(() => {
        // Check if user is authenticated
        if (!authUser) {
            toast.error('Please log in to view your profile');
            navigate('/login');
            return;
        }

        fetchProfile();
    }, [authUser, navigate]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await apiService.getCurrentUser();
            const userData = response.data.user;
            setProfile(userData);
            setFormData({
                name: userData.name || '',
                bio: userData.bio || '',
                location: userData.location || '',
                isPublic: userData.isPublic !== false
            });
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            setError('Failed to load profile');
            toast.error('Failed to load profile. Redirecting to dashboard...');

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const response = await apiService.updateProfile(formData);
            setProfile(response.data.user);
            updateUser(response.data.user);
            setEditing(false);
            toast.success('Profile updated successfully');
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

    const handleAddSkill = () => {
        if (!profile || !newSkill.name.trim()) {
            toast.error('Please enter a skill name');
            return;
        }

        const updatedProfile = { ...profile };
        if (skillDialog.type === 'offered') {
            // Check for duplicates
            const isDuplicate = updatedProfile.skillsOffered.some(skill =>
                skill.name.toLowerCase() === newSkill.name.toLowerCase()
            );
            if (isDuplicate) {
                toast.error('You already offer this skill');
                return;
            }
            updatedProfile.skillsOffered = [...updatedProfile.skillsOffered, newSkill];
        } else {
            // Check for duplicates
            const isDuplicate = updatedProfile.skillsWanted.some(skill =>
                skill.name.toLowerCase() === newSkill.name.toLowerCase()
            );
            if (isDuplicate) {
                toast.error('This skill is already in your learning goals');
                return;
            }
            updatedProfile.skillsWanted = [...updatedProfile.skillsWanted, newSkill];
        }

        setProfile(updatedProfile);
        setSkillDialog({ open: false, type: 'offered' });
        setNewSkill({ name: '', level: 'Beginner', description: '' });

        // Save to backend
        saveSkillsToBackend(updatedProfile);
    };

    const handleRemoveSkill = (type: 'offered' | 'wanted', index: number) => {
        if (!profile) return;

        const updatedProfile = { ...profile };
        if (type === 'offered') {
            updatedProfile.skillsOffered.splice(index, 1);
        } else {
            updatedProfile.skillsWanted.splice(index, 1);
        }

        setProfile(updatedProfile);
        saveSkillsToBackend(updatedProfile);
    };

    const saveSkillsToBackend = async (updatedProfile: UserProfile) => {
        try {
            console.log('Saving skills to backend:', updatedProfile.skillsOffered, updatedProfile.skillsWanted);
            const response = await apiService.updateProfile({
                skillsOffered: updatedProfile.skillsOffered,
                skillsWanted: updatedProfile.skillsWanted
            });
            console.log('Skills save response:', response.data);
            toast.success('Skills updated successfully');

            // Update the auth context with the updated user data
            updateUser(response.data.user);
        } catch (error: any) {
            console.error('Error saving skills:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || 'Failed to save skills');

            // Revert the profile state if save failed
            fetchProfile();
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" gutterBottom>Loading Profile...</Typography>
            </Container>
        );
    }

    if (!profile || error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error || 'Failed to load profile'}
                </Alert>
                <Stack direction="row" spacing={2}>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/dashboard')}
                    >
                        Go to Dashboard
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={fetchProfile}
                    >
                        Retry Loading Profile
                    </Button>
                </Stack>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    My Profile
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/dashboard')}
                    sx={{ minWidth: 120 }}
                >
                    ← Dashboard
                </Button>
            </Box>

            {/* Show user name and status */}
            <Alert severity="info" sx={{ mb: 3 }}>
                Managing profile for: <strong>{profile.name}</strong> ({profile.email})
                {error && <span> - {error}</span>}
            </Alert>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* Profile Information */}
                <Box sx={{ flex: '0 0 300px' }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                                <Avatar
                                    src={profile.profilePhoto}
                                    sx={{ width: 120, height: 120, mb: 2 }}
                                >
                                    <Person sx={{ fontSize: 60 }} />
                                </Avatar>
                                <IconButton color="primary">
                                    <PhotoCamera />
                                </IconButton>
                                <Typography variant="caption" color="text.secondary">
                                    Change Photo
                                </Typography>
                            </Box>

                            {editing ? (
                                <Stack spacing={2}>
                                    <TextField
                                        label="Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Location"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Bio"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        multiline
                                        rows={3}
                                        fullWidth
                                    />
                                    <Stack direction="row" spacing={1}>
                                        <Button startIcon={<Save />} onClick={handleSaveProfile} variant="contained">
                                            Save
                                        </Button>
                                        <Button startIcon={<Cancel />} onClick={() => setEditing(false)}>
                                            Cancel
                                        </Button>
                                    </Stack>
                                </Stack>
                            ) : (
                                <Stack spacing={2}>
                                    <Typography variant="h6">{profile.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        📧 {profile.email}
                                    </Typography>
                                    {profile.location && (
                                        <Typography variant="body2" color="text.secondary">
                                            📍 {profile.location}
                                        </Typography>
                                    )}
                                    {profile.bio && (
                                        <Typography variant="body2">
                                            {profile.bio}
                                        </Typography>
                                    )}
                                    {profile.rating && (
                                        <Typography variant="body2">
                                            ⭐ {profile.rating.toFixed(1)} ({profile.completedSwaps || 0} swaps)
                                        </Typography>
                                    )}
                                    <Button startIcon={<Edit />} onClick={() => setEditing(true)} variant="outlined">
                                        Edit Profile
                                    </Button>
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                {/* Skills Section */}
                <Box sx={{ flex: 1 }}>
                    <Stack spacing={3}>
                        {/* Skills Offered */}
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">Skills I Offer</Typography>
                                    <Button
                                        startIcon={<Add />}
                                        onClick={() => setSkillDialog({ open: true, type: 'offered' })}
                                        size="small"
                                    >
                                        Add Skill
                                    </Button>
                                </Box>
                                {profile.skillsOffered.length > 0 ? (
                                    <Stack spacing={1}>
                                        {profile.skillsOffered.map((skill, index) => (
                                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    label={`${skill.name} (${skill.level})`}
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                                {skill.description && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        - {skill.description}
                                                    </Typography>
                                                )}
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveSkill('offered', index)}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No skills added yet. Add your skills to start offering them for swaps!
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>

                        {/* Skills Wanted */}
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6">Skills I Want to Learn</Typography>
                                    <Button
                                        startIcon={<Add />}
                                        onClick={() => setSkillDialog({ open: true, type: 'wanted' })}
                                        size="small"
                                    >
                                        Add Skill
                                    </Button>
                                </Box>
                                {profile.skillsWanted.length > 0 ? (
                                    <Stack spacing={1}>
                                        {profile.skillsWanted.map((skill, index) => (
                                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Chip
                                                    label={`${skill.name} (${skill.level})`}
                                                    color="secondary"
                                                    variant="outlined"
                                                />
                                                {skill.description && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        - {skill.description}
                                                    </Typography>
                                                )}
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveSkill('wanted', index)}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        No learning goals set. Add skills you want to learn!
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Stack>
                </Box>
            </Stack>

            {/* Add Skill Dialog */}
            <Dialog open={skillDialog.open} onClose={() => setSkillDialog({ open: false, type: 'offered' })}>
                <DialogTitle>
                    Add {skillDialog.type === 'offered' ? 'Skill I Offer' : 'Skill I Want to Learn'}
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
                        <TextField
                            label="Skill Name"
                            value={newSkill.name}
                            onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Skill Level</InputLabel>
                            <Select
                                value={newSkill.level}
                                onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}
                            >
                                {skillLevels.map((level) => (
                                    <MenuItem key={level} value={level}>{level}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Description (Optional)"
                            value={newSkill.description}
                            onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                            multiline
                            rows={2}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSkillDialog({ open: false, type: 'offered' })}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddSkill} variant="contained">
                        Add Skill
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Quick Actions */}
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="h6" gutterBottom>
                    Quick Actions
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/dashboard')}
                    >
                        Go to Dashboard
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/browse')}
                    >
                        Browse Skills
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/swap-requests')}
                    >
                        My Swaps
                    </Button>
                </Stack>
            </Box>
        </Container>
    );
};

export default Profile;
