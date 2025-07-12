import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const AdminPanel: React.FC = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                    Admin Panel
                </Typography>
                <Typography variant="body1">
                    Admin panel page coming soon...
                </Typography>
            </Box>
        </Container>
    );
};

export default AdminPanel;
