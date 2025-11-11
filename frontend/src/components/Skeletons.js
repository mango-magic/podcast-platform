import React from 'react';
import { Box, Skeleton, Card, CardContent, CircularProgress, Typography } from '@mui/material';

// Skeleton loader for dashboard stats
export const StatsSkeleton = () => (
  <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
    <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' } }}>
      <CardContent>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={48} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
    <Card sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' } }}>
      <CardContent>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={48} sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  </Box>
);

// Skeleton loader for recommendations
export const RecommendationsSkeleton = () => (
  <Box sx={{ mt: 4 }}>
    <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
    <Skeleton variant="text" width="60%" height={20} sx={{ mb: 3 }} />
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {[1, 2, 3].map((i) => (
        <Card 
          key={i} 
          sx={{ 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 11px)' },
            minWidth: { xs: '100%', sm: 'auto' }
          }}
        >
          <CardContent>
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="100%" height={20} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="90%" height={20} sx={{ mt: 0.5 }} />
          </CardContent>
        </Card>
      ))}
    </Box>
  </Box>
);

// Skeleton loader for onboarding
export const OnboardingSkeleton = () => (
  <Card sx={{ borderRadius: 3 }}>
    <CardContent sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={20} />
      </Box>
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Skeleton variant="rectangular" width="200px" height="40px" sx={{ borderRadius: 2, mx: 'auto' }} />
      </Box>
    </CardContent>
  </Card>
);

export default {
  StatsSkeleton,
  RecommendationsSkeleton,
  OnboardingSkeleton
};

