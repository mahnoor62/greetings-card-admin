import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Grid
} from '@mui/material';
import { 
  Star,
  ShoppingCart
} from '@mui/icons-material';

const MostPopularARTemplate = ({ data, loading }) => {
  if (loading) {
    return (
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Most Popular AR Template
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  const templates = data || [];
  console.log("AR Templates data:", templates);
  const mostPopularTemplate = templates[0]; // Get the first (most popular) template
  
  // Debug the most popular template data
  if (mostPopularTemplate) {
    console.log("Most Popular AR Template Details:", {
      templateIndex: mostPopularTemplate.templateIndex,
      templateName: mostPopularTemplate.templateName,
      usageCount: mostPopularTemplate.usageCount,
      totalCustomizations: mostPopularTemplate.totalCustomizations
    });
  }

  if (!mostPopularTemplate) {
    return (
      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Most Popular AR Template
          </Typography>
          <Typography variant="body1" color="text.secondary">
            No AR template data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Star sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Most Popular AR Template
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '2rem',
              fontWeight: 'bold'
            }}
          >
            {mostPopularTemplate.templateIndex === 0 ? 1 : mostPopularTemplate.templateIndex}
          </Avatar>
          
          <Typography variant="h4" sx={{ 
            fontWeight: 'bold', 
            mb: 1,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {mostPopularTemplate.templateName}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Template No: {mostPopularTemplate.templateIndex === 0 ? 1 : mostPopularTemplate.templateIndex}
          </Typography>

          {/* Times Used - Centered below template info */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <ShoppingCart sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {mostPopularTemplate.usageCount} Times Used
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MostPopularARTemplate;
