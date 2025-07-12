import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    Autocomplete,
    Card,
    CardContent,
    Chip,
    Avatar,
    Button,
    Skeleton,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    SelectChangeEvent,
    Stack
} from '@mui/material';
import { Search, Person, Star } from '@mui/icons-material';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

interface User {
    _id: string;
    name: string;
    email: string;
    profilePhoto?: string;
    skillsOffered: Array<{ name: string; level: string; description?: string }>;
    skillsWanted: Array<{ name: string; level: string; description?: string }>;
    bio?: string;
    rating?: number;
    completedSwaps?: number;
    location?: string;
}

interface PopularSkill {
    name: string;
    count: number;
}

const Browse: React.FC = () => {
    const { user: authUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
    const [popularSkills, setPopularSkills] = useState<PopularSkill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [swapDialogOpen, setSwapDialogOpen] = useState(false);
    const [selectedMySkill, setSelectedMySkill] = useState('');
    const [selectedTheirSkill, setSelectedTheirSkill] = useState('');

    // Fetch current user data
    const fetchCurrentUser = useCallback(async () => {
        try {
            const response = await apiService.getCurrentUser();
            setCurrentUser(response.data.user);
        } catch (err) {
            console.error('Failed to fetch current user:', err);
        }
    }, []);

    // Fetch all users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiService.getUsers({ isPublic: true });
            setUsers(response.data.users || []);
            setFilteredUsers(response.data.users || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch popular skills
    const fetchPopularSkills = useCallback(async () => {
        try {
            const response = await apiService.getPopularSkills();
            setPopularSkills(response.data.skills || []);
        } catch (err) {
            console.error('Failed to fetch popular skills:', err);
        }
    }, []);

    // Fetch skill suggestions
    const fetchSkillSuggestions = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSkillSuggestions([]);
            return;
        }
        try {
            const response = await apiService.getSkillSuggestions(query);
            setSkillSuggestions(response.data.suggestions || []);
        } catch (err) {
            console.error('Failed to fetch skill suggestions:', err);
        }
    }, []);

    // Filter users based on search criteria
    const filterUsers = useCallback(() => {
        let filtered = users;

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.skillsOffered.some(skill =>
                    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
                ) ||
                user.skillsWanted.some(skill =>
                    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        if (skillFilter) {
            filtered = filtered.filter(user =>
                user.skillsOffered.some(skill =>
                    skill.name.toLowerCase().includes(skillFilter.toLowerCase())
                )
            );
        }

        if (levelFilter) {
            filtered = filtered.filter(user =>
                user.skillsOffered.some(skill => skill.level === levelFilter)
            );
        }

        setFilteredUsers(filtered);
    }, [users, searchTerm, skillFilter, levelFilter]);

    useEffect(() => {
        fetchCurrentUser();
        fetchUsers();
        fetchPopularSkills();
    }, [fetchCurrentUser, fetchUsers, fetchPopularSkills]);

    useEffect(() => {
        filterUsers();
    }, [filterUsers]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (skillFilter) {
                fetchSkillSuggestions(skillFilter);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [skillFilter, fetchSkillSuggestions]);

    const handleSkillClick = (skillName: string) => {
        setSkillFilter(skillName);
    };

    const handleLevelChange = (event: SelectChangeEvent) => {
        setLevelFilter(event.target.value);
    };

    const handleSwapRequest = (user: User) => {
        setSelectedUser(user);
        setSelectedMySkill('');
        setSelectedTheirSkill('');
        setSwapDialogOpen(true);
    };

    const initiateSwap = async () => {
        try {
            if (!selectedUser || !selectedMySkill || !selectedTheirSkill) {
                toast.error('Please select both skills for the swap');
                return;
            }

            await apiService.createSwap({
                providerId: selectedUser._id,
                requesterOfferedSkill: selectedMySkill,
                requesterWantedSkill: selectedTheirSkill,
                message: `I'd like to swap my ${selectedMySkill} skills for your ${selectedTheirSkill} skills.`
            });

            setSwapDialogOpen(false);
            setSelectedUser(null);
            setSelectedMySkill('');
            setSelectedTheirSkill('');
            toast.success('Swap request sent successfully!');
        } catch (err: any) {
            console.error('Swap request error:', err);
            toast.error(err.response?.data?.message || 'Failed to create swap request');
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Skeleton variant="text" width="30%" height={40} />
                    <Skeleton variant="text" width="50%" height={20} sx={{ mt: 1 }} />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {[...Array(6)].map((_, index) => (
                        <Box key={index} sx={{ flex: { xs: '1 1 100%', md: '1 1 45%', lg: '1 1 30%' } }}>
                            <Skeleton variant="rectangular" height={300} />
                        </Box>
                    ))}
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Browse Skills
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    Find people with the skills you need and discover new learning opportunities
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* Search and Filter Controls */}
                <Box sx={{ mb: 4 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search users, skills, or descriptions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                        <Autocomplete
                            fullWidth
                            freeSolo
                            options={skillSuggestions}
                            value={skillFilter}
                            onInputChange={(_, newValue) => setSkillFilter(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Filter by skill"
                                    placeholder="Type a skill name..."
                                />
                            )}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Skill Level</InputLabel>
                            <Select
                                value={levelFilter}
                                label="Skill Level"
                                onChange={handleLevelChange}
                            >
                                <MenuItem value="">All Levels</MenuItem>
                                <MenuItem value="Beginner">Beginner</MenuItem>
                                <MenuItem value="Intermediate">Intermediate</MenuItem>
                                <MenuItem value="Advanced">Advanced</MenuItem>
                                <MenuItem value="Expert">Expert</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>

                {/* Popular Skills */}
                {popularSkills.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Popular Skills
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {popularSkills.slice(0, 10).map((skill) => (
                                <Chip
                                    key={skill.name}
                                    label={`${skill.name} (${skill.count})`}
                                    onClick={() => handleSkillClick(skill.name)}
                                    clickable
                                    variant={skillFilter === skill.name ? 'filled' : 'outlined'}
                                    color={skillFilter === skill.name ? 'primary' : 'default'}
                                />
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>

            {/* Results */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                </Typography>
            </Box>

            {/* User Cards */}
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                '& > *': {
                    flex: {
                        xs: '1 1 100%',
                        md: '1 1 calc(50% - 12px)',
                        lg: '1 1 calc(33.333% - 16px)'
                    }
                }
            }}>
                {filteredUsers.map((user) => (
                    <Card key={user._id} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar
                                    src={user.profilePhoto}
                                    sx={{ width: 56, height: 56, mr: 2 }}
                                >
                                    <Person />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" component="h3">
                                        {user.name}
                                    </Typography>
                                    {user.location && (
                                        <Typography variant="body2" color="text.secondary">
                                            {user.location}
                                        </Typography>
                                    )}
                                    {user.rating && (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Star sx={{ fontSize: 16, color: 'primary.main', mr: 0.5 }} />
                                            <Typography variant="body2">
                                                {user.rating.toFixed(1)} ({user.completedSwaps || 0} swaps)
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>

                            {user.bio && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    {user.bio.length > 100 ? `${user.bio.substring(0, 100)}...` : user.bio}
                                </Typography>
                            )}

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                    Skills Offered
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {user.skillsOffered.slice(0, 3).map((skill, index) => (
                                        <Chip
                                            key={index}
                                            label={`${skill.name} (${skill.level})`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))}
                                    {user.skillsOffered.length > 3 && (
                                        <Chip
                                            label={`+${user.skillsOffered.length - 3} more`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="secondary" gutterBottom>
                                    Skills Wanted
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {user.skillsWanted.slice(0, 3).map((skill, index) => (
                                        <Chip
                                            key={index}
                                            label={`${skill.name} (${skill.level})`}
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    ))}
                                    {user.skillsWanted.length > 3 && (
                                        <Chip
                                            label={`+${user.skillsWanted.length - 3} more`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                </Box>
                            </Box>
                        </CardContent>

                        <Box sx={{ p: 2, pt: 0 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => handleSwapRequest(user)}
                            >
                                Request Swap
                            </Button>
                        </Box>
                    </Card>
                ))}
            </Box>

            {filteredUsers.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No users found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Try adjusting your search criteria or filters
                    </Typography>
                </Box>
            )}

            {/* Swap Request Dialog */}
            <Dialog open={swapDialogOpen} onClose={() => setSwapDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Request Skill Swap</DialogTitle>
                <DialogContent>
                    {selectedUser && currentUser && (
                        <Box>
                            <Typography variant="body1" gutterBottom>
                                Request a skill swap with <strong>{selectedUser.name}</strong>
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Select which of your skills to offer and which of their skills you want to learn.
                            </Typography>

                            <Stack spacing={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Your Skill to Offer</InputLabel>
                                    <Select
                                        value={selectedMySkill}
                                        label="Your Skill to Offer"
                                        onChange={(e) => setSelectedMySkill(e.target.value)}
                                    >
                                        {currentUser.skillsOffered?.map((skill, index) => (
                                            <MenuItem key={index} value={skill.name}>
                                                {skill.name} ({skill.level})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Their Skill You Want</InputLabel>
                                    <Select
                                        value={selectedTheirSkill}
                                        label="Their Skill You Want"
                                        onChange={(e) => setSelectedTheirSkill(e.target.value)}
                                    >
                                        {selectedUser.skillsOffered?.map((skill, index) => (
                                            <MenuItem key={index} value={skill.name}>
                                                {skill.name} ({skill.level})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Their Skills Available:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                        {selectedUser.skillsOffered.map((skill, index) => (
                                            <Chip
                                                key={index}
                                                label={`${skill.name} (${skill.level})`}
                                                size="small"
                                                color="primary"
                                                variant={selectedTheirSkill === skill.name ? "filled" : "outlined"}
                                            />
                                        ))}
                                    </Box>
                                </Box>

                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>
                                        They Want to Learn:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {selectedUser.skillsWanted.map((skill, index) => (
                                            <Chip
                                                key={index}
                                                label={`${skill.name} (${skill.level})`}
                                                size="small"
                                                color="secondary"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            </Stack>
                        </Box>
                    )}

                    {!currentUser?.skillsOffered?.length && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            You need to add skills to your profile before requesting swaps.
                            Visit your profile to add skills you can offer.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSwapDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={initiateSwap}
                        disabled={!selectedMySkill || !selectedTheirSkill || !currentUser?.skillsOffered?.length}
                    >
                        Send Request
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Browse;
