import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loading = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      <CircularProgress size={64} thickness={4} />
      <Typography variant="h6" sx={{ mt: 2, color: 'text.primary' }}>
        Loading...
      </Typography>
    </Box>
  );
};

export default Loading;