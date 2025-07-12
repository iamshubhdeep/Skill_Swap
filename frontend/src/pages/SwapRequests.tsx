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
    Tabs,
    Tab,
    Badge,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Rating,
    Divider
} from '@mui/material';
import {
    Person,
    SwapHoriz,
    Check,
    Close,
    Schedule,
    Star,
    Send,
    Inbox,
    History
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { toast } from 'react-toastify';

interface Swap {
    _id: string;
    requesterId: string;
    providerId: string;
    requesterOfferedSkill: string;
    requesterWantedSkill: string;
    message: string;
    status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    requester: {
        _id: string;
        name: string;
        email: string;
        profilePhoto?: string;
        rating?: number;
    };
    provider: {
        _id: string;
        name: string;
        email: string;
        profilePhoto?: string;
        rating?: number;
    };
    requesterFeedback?: {
        rating: number;
        comment?: string;
        submittedAt: string;
    };
    providerFeedback?: {
        rating: number;
        comment?: string;
        submittedAt: string;
    };
}

const SwapRequests: React.FC = () => {
    const { user } = useAuth();
    const [swaps, setSwaps] = useState<Swap[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [feedbackDialog, setFeedbackDialog] = useState<{
        open: boolean;
        swap: Swap | null;
    }>({ open: false, swap: null });
    const [feedback, setFeedback] = useState({
        rating: 5,
        comment: ''
    });

    useEffect(() => {
        fetchSwaps();
    }, []);

    const fetchSwaps = async () => {
        try {
            setLoading(true);
            const response = await apiService.getMySwaps();
            setSwaps(response.data.swaps || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch swap requests');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (swapId: string, status: string) => {
        try {
            await apiService.updateSwapStatus(swapId, status);
            await fetchSwaps(); // Refresh the list
            toast.success(`Swap ${status} successfully`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update swap status');
        }
    };

    const handleFeedbackSubmit = async () => {
        if (!feedbackDialog.swap) return;

        try {
            await apiService.submitFeedback(
                feedbackDialog.swap._id,
                feedback.rating,
                feedback.comment
            );
            setFeedbackDialog({ open: false, swap: null });
            setFeedback({ rating: 5, comment: '' });
            await fetchSwaps();
            toast.success('Feedback submitted successfully');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to submit feedback');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'accepted': return 'info';
            case 'completed': return 'success';
            case 'declined': return 'error';
            case 'cancelled': return 'default';
            default: return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Schedule />;
            case 'accepted': return <Check />;
            case 'completed': return <Star />;
            case 'declined': return <Close />;
            case 'cancelled': return <Close />;
            default: return <SwapHoriz />;
        }
    };

    const filterSwaps = (type: 'received' | 'sent' | 'completed') => {
        return swaps.filter(swap => {
            if (type === 'received') {
                return swap.providerId === user?.id && swap.status === 'pending';
            } else if (type === 'sent') {
                return swap.requesterId === user?.id && swap.status !== 'completed';
            } else {
                return swap.status === 'completed';
            }
        });
    };

    const canProvideFeedback = (swap: Swap) => {
        if (swap.status !== 'completed') return false;

        if (swap.requesterId === user?.id) {
            return !swap.requesterFeedback;
        } else if (swap.providerId === user?.id) {
            return !swap.providerFeedback;
        }
        return false;
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>Loading Swap Requests...</Typography>
                <Stack spacing={2}>
                    {[...Array(3)].map((_, index) => (
                        <Skeleton key={index} variant="rectangular" height={150} />
                    ))}
                </Stack>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Swap Requests
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Manage your skill swap requests and track your learning journey
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    <Tab
                        icon={<Inbox />}
                        label={
                            <Badge badgeContent={filterSwaps('received').length} color="primary">
                                Received
                            </Badge>
                        }
                        iconPosition="start"
                    />
                    <Tab
                        icon={<Send />}
                        label={
                            <Badge badgeContent={filterSwaps('sent').length} color="secondary">
                                Sent
                            </Badge>
                        }
                        iconPosition="start"
                    />
                    <Tab
                        icon={<History />}
                        label={
                            <Badge badgeContent={filterSwaps('completed').length} color="success">
                                Completed
                            </Badge>
                        }
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Box>
                {activeTab === 0 && (
                    <SwapList
                        swaps={filterSwaps('received')}
                        title="Requests You've Received"
                        emptyMessage="No pending requests"
                        isReceived={true}
                        onStatusUpdate={handleStatusUpdate}
                        currentUserId={user?.id}
                        onFeedback={() => { }}
                    />
                )}
                {activeTab === 1 && (
                    <SwapList
                        swaps={filterSwaps('sent')}
                        title="Requests You've Sent"
                        emptyMessage="No requests sent"
                        isReceived={false}
                        onStatusUpdate={handleStatusUpdate}
                        currentUserId={user?.id}
                        onFeedback={() => { }}
                    />
                )}
                {activeTab === 2 && (
                    <SwapList
                        swaps={filterSwaps('completed')}
                        title="Completed Swaps"
                        emptyMessage="No completed swaps yet"
                        isReceived={false}
                        onStatusUpdate={handleStatusUpdate}
                        currentUserId={user?.id}
                        onFeedback={(swap) => setFeedbackDialog({ open: true, swap })}
                        showFeedback={true}
                        canProvideFeedback={canProvideFeedback}
                    />
                )}
            </Box>

            {/* Feedback Dialog */}
            <Dialog open={feedbackDialog.open} onClose={() => setFeedbackDialog({ open: false, swap: null })} maxWidth="sm" fullWidth>
                <DialogTitle>Provide Feedback</DialogTitle>
                <DialogContent>
                    {feedbackDialog.swap && (
                        <Box>
                            <Typography variant="body1" gutterBottom>
                                How was your skill swap experience with{' '}
                                <strong>
                                    {feedbackDialog.swap.requesterId === user?.id
                                        ? feedbackDialog.swap.provider.name
                                        : feedbackDialog.swap.requester.name}
                                </strong>
                                ?
                            </Typography>

                            <Box sx={{ my: 3 }}>
                                <Typography component="legend" gutterBottom>
                                    Rating
                                </Typography>
                                <Rating
                                    value={feedback.rating}
                                    onChange={(_, newValue) => setFeedback({ ...feedback, rating: newValue || 5 })}
                                    size="large"
                                />
                            </Box>

                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Comment (Optional)"
                                value={feedback.comment}
                                onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                                placeholder="Share your experience..."
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFeedbackDialog({ open: false, swap: null })}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleFeedbackSubmit}>
                        Submit Feedback
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

// SwapList Component
interface SwapListProps {
    swaps: Swap[];
    title: string;
    emptyMessage: string;
    isReceived: boolean;
    onStatusUpdate: (swapId: string, status: string) => void;
    currentUserId?: string;
    onFeedback: (swap: Swap) => void;
    showFeedback?: boolean;
    canProvideFeedback?: (swap: Swap) => boolean;
}

const SwapList: React.FC<SwapListProps> = ({
    swaps,
    title,
    emptyMessage,
    isReceived,
    onStatusUpdate,
    currentUserId,
    onFeedback,
    showFeedback = false,
    canProvideFeedback
}) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'accepted': return 'info';
            case 'completed': return 'success';
            case 'declined': return 'error';
            case 'cancelled': return 'default';
            default: return 'default';
        }
    };

    if (swaps.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {emptyMessage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {isReceived
                        ? 'When someone requests a swap with you, it will appear here'
                        : 'Browse skills and send swap requests to start learning!'}
                </Typography>
            </Box>
        );
    }

    return (
        <Stack spacing={2}>
            {swaps.map((swap) => {
                const otherUser = swap.requesterId === currentUserId ? swap.provider : swap.requester;
                const isRequester = swap.requesterId === currentUserId;

                return (
                    <Card key={swap._id}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar src={otherUser.profilePhoto} sx={{ mr: 2 }}>
                                    <Person />
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6">
                                        {isRequester ? 'Request to' : 'Request from'} {otherUser.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {new Date(swap.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                                    color={getStatusColor(swap.status) as any}
                                    variant="outlined"
                                />
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Skill Exchange:
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={`Offering: ${swap.requesterOfferedSkill}`}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                    <SwapHoriz color="action" />
                                    <Chip
                                        label={`Wanting: ${swap.requesterWantedSkill}`}
                                        color="secondary"
                                        variant="outlined"
                                        size="small"
                                    />
                                </Box>
                            </Box>

                            {swap.message && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        "{swap.message}"
                                    </Typography>
                                </Box>
                            )}

                            {/* Show feedback for completed swaps */}
                            {showFeedback && swap.status === 'completed' && (
                                <Box sx={{ mb: 2 }}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="subtitle2" gutterBottom>
                                        Feedback:
                                    </Typography>
                                    <Stack spacing={1}>
                                        {swap.requesterFeedback && (
                                            <Box>
                                                <Typography variant="body2">
                                                    <strong>Requester:</strong>
                                                    <Rating value={swap.requesterFeedback.rating} size="small" readOnly sx={{ ml: 1 }} />
                                                </Typography>
                                                {swap.requesterFeedback.comment && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        "{swap.requesterFeedback.comment}"
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                        {swap.providerFeedback && (
                                            <Box>
                                                <Typography variant="body2">
                                                    <strong>Provider:</strong>
                                                    <Rating value={swap.providerFeedback.rating} size="small" readOnly sx={{ ml: 1 }} />
                                                </Typography>
                                                {swap.providerFeedback.comment && (
                                                    <Typography variant="body2" color="text.secondary">
                                                        "{swap.providerFeedback.comment}"
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            )}

                            {/* Action buttons */}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {swap.status === 'pending' && isReceived && (
                                    <>
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<Check />}
                                            onClick={() => onStatusUpdate(swap._id, 'accepted')}
                                            size="small"
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<Close />}
                                            onClick={() => onStatusUpdate(swap._id, 'declined')}
                                            size="small"
                                        >
                                            Decline
                                        </Button>
                                    </>
                                )}

                                {swap.status === 'accepted' && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Star />}
                                        onClick={() => onStatusUpdate(swap._id, 'completed')}
                                        size="small"
                                    >
                                        Mark Complete
                                    </Button>
                                )}

                                {swap.status === 'pending' && !isReceived && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Close />}
                                        onClick={() => onStatusUpdate(swap._id, 'cancelled')}
                                        size="small"
                                    >
                                        Cancel
                                    </Button>
                                )}

                                {showFeedback && canProvideFeedback && canProvideFeedback(swap) && (
                                    <Button
                                        variant="outlined"
                                        startIcon={<Star />}
                                        onClick={() => onFeedback(swap)}
                                        size="small"
                                    >
                                        Leave Feedback
                                    </Button>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                );
            })}
        </Stack>
    );
};

export default SwapRequests;
