import React from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    useTheme,
    alpha,
} from '@mui/material';
import {
    SwapHoriz,
    People,
    Star,
    Security,
    TrendingUp,
    Group,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
    const { user } = useAuth();
    const theme = useTheme();

    const features = [
        {
            icon: <SwapHoriz color="primary" sx={{ fontSize: 40 }} />,
            title: 'Skill Exchange',
            description: 'Trade your skills with others in the community. Offer what you know, learn what you need.',
        },
        {
            icon: <People color="primary" sx={{ fontSize: 40 }} />,
            title: 'Connect & Network',
            description: 'Build meaningful connections with like-minded individuals who share your passion for learning.',
        },
        {
            icon: <Star color="primary" sx={{ fontSize: 40 }} />,
            title: 'Rate & Review',
            description: 'Share feedback and build trust within the community through our rating system.',
        },
        {
            icon: <Security color="primary" sx={{ fontSize: 40 }} />,
            title: 'Safe & Secure',
            description: 'Enjoy peace of mind with our moderated platform and secure user verification.',
        },
    ];

    const stats = [
        { number: '1000+', label: 'Active Users', icon: <Group /> },
        { number: '500+', label: 'Skills Offered', icon: <TrendingUp /> },
        { number: '250+', label: 'Successful Swaps', icon: <SwapHoriz /> },
        { number: '4.8', label: 'Average Rating', icon: <Star /> },
    ];

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: 'white',
                    py: { xs: 8, md: 12 },
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 4 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="h2"
                                component="h1"
                                gutterBottom
                                sx={{
                                    fontWeight: 'bold',
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    mb: 3,
                                }}
                            >
                                Learn, Share, Grow Together
                            </Typography>
                            <Typography
                                variant="h5"
                                sx={{
                                    mb: 4,
                                    opacity: 0.9,
                                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                                }}
                            >
                                Connect with others to exchange skills, learn new talents, and build a community of growth.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {user ? (
                                    <>
                                        <Button
                                            component={Link}
                                            to="/browse"
                                            variant="contained"
                                            size="large"
                                            sx={{
                                                backgroundColor: 'white',
                                                color: theme.palette.primary.main,
                                                '&:hover': {
                                                    backgroundColor: alpha('#ffffff', 0.9),
                                                },
                                            }}
                                        >
                                            Browse Skills
                                        </Button>
                                        <Button
                                            component={Link}
                                            to="/dashboard"
                                            variant="outlined"
                                            size="large"
                                            sx={{
                                                borderColor: 'white',
                                                color: 'white',
                                                '&:hover': {
                                                    borderColor: 'white',
                                                    backgroundColor: alpha('#ffffff', 0.1),
                                                },
                                            }}
                                        >
                                            Go to Dashboard
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            component={Link}
                                            to="/register"
                                            variant="contained"
                                            size="large"
                                            sx={{
                                                backgroundColor: 'white',
                                                color: theme.palette.primary.main,
                                                '&:hover': {
                                                    backgroundColor: alpha('#ffffff', 0.9),
                                                },
                                            }}
                                        >
                                            Get Started
                                        </Button>
                                        <Button
                                            component={Link}
                                            to="/browse"
                                            variant="outlined"
                                            size="large"
                                            sx={{
                                                borderColor: 'white',
                                                color: 'white',
                                                '&:hover': {
                                                    borderColor: 'white',
                                                    backgroundColor: alpha('#ffffff', 0.1),
                                                },
                                            }}
                                        >
                                            Explore Skills
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Box>
                        <Box sx={{ flex: 1, textAlign: 'center' }}>
                            <Box
                                sx={{
                                    width: { xs: 250, md: 350 },
                                    height: { xs: 250, md: 350 },
                                    backgroundColor: alpha('#ffffff', 0.1),
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                }}
                            >
                                <SwapHoriz sx={{ fontSize: { xs: 80, md: 120 }, color: 'white' }} />
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Stats Section */}
            <Box sx={{ py: 6, backgroundColor: 'grey.50' }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-around' }}>
                        {stats.map((stat, index) => (
                            <Box key={index} sx={{ textAlign: 'center', minWidth: 150 }}>
                                <Box sx={{ color: 'primary.main', mb: 1 }}>
                                    {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                                </Box>
                                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {stat.number}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {stat.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* Features Section */}
            <Box sx={{ py: 8 }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        component="h2"
                        textAlign="center"
                        gutterBottom
                        sx={{ mb: 6, fontWeight: 'bold' }}
                    >
                        Why Choose SkillSwap?
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                sx={{
                                    maxWidth: 280,
                                    flex: '1 1 250px',
                                    textAlign: 'center',
                                    transition: 'transform 0.3s ease-in-out',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: 4,
                                    },
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Box sx={{ mb: 2 }}>
                                        {feature.icon}
                                    </Box>
                                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* How It Works Section */}
            <Box sx={{ py: 8, backgroundColor: 'grey.50' }}>
                <Container maxWidth="lg">
                    <Typography
                        variant="h3"
                        component="h2"
                        textAlign="center"
                        gutterBottom
                        sx={{ mb: 6, fontWeight: 'bold' }}
                    >
                        How It Works
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
                        {[
                            {
                                step: '1',
                                title: 'Create Your Profile',
                                description: 'List your skills and what you\'d like to learn. Set your availability and preferences.',
                            },
                            {
                                step: '2',
                                title: 'Find & Connect',
                                description: 'Browse other users\' skills and send swap requests to people you\'d like to learn from.',
                            },
                            {
                                step: '3',
                                title: 'Learn & Teach',
                                description: 'Meet up, exchange skills, and rate your experience to help build the community.',
                            },
                        ].map((step, index) => (
                            <Card key={index} sx={{ maxWidth: 350, flex: '1 1 300px', textAlign: 'center', p: 3 }}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        color: 'primary.main',
                                        fontWeight: 'bold',
                                        mb: 2,
                                    }}
                                >
                                    {step.step}
                                </Typography>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    {step.title}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    {step.description}
                                </Typography>
                            </Card>
                        ))}
                    </Box>
                </Container>
            </Box>

            {/* CTA Section */}
            {!user && (
                <Box
                    sx={{
                        py: 8,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        color: 'white',
                        textAlign: 'center',
                    }}
                >
                    <Container maxWidth="md">
                        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                            Ready to Start Learning?
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                            Join thousands of learners and start exchanging skills today.
                        </Typography>
                        <Button
                            component={Link}
                            to="/register"
                            variant="contained"
                            size="large"
                            sx={{
                                backgroundColor: 'white',
                                color: theme.palette.primary.main,
                                px: 4,
                                py: 1.5,
                                fontSize: '1.1rem',
                                '&:hover': {
                                    backgroundColor: alpha('#ffffff', 0.9),
                                },
                            }}
                        >
                            Sign Up Now
                        </Button>
                    </Container>
                </Box>
            )}
        </Box>
    );
};

export default Home;
