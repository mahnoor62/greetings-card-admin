import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  LinearProgress,
  Grid
} from '@mui/material';
import { 
  Star, 
  AttachMoney, 
  ShoppingCart,
  Visibility,
  CurrencyExchange,
  AccountBalance,
  Receipt
} from '@mui/icons-material';

const MostPopularCard = ({ data, loading }) => {
  if (loading) {
    return (
      <Card sx={{ 
        // background: 'rgba(255, 255, 255, 0.95)',
        // backdropFilter: 'blur(10px)',
        borderRadius: 3,
        // boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Most Popular Card
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  const cards = data?.popularCards || [];
  console.log("data", data)
  console.log("cards", cards)
  const mostPopularCard = cards[0]; // Get the first (most popular) card
  
    // Debug the most popular card data
    if (mostPopularCard) {
      console.log("Most Popular Card Details:", {
        title: mostPopularCard.title,
        salesCount: mostPopularCard.salesCount,
        totalQuantitySold: mostPopularCard.totalQuantitySold,
        totalRevenue: mostPopularCard.totalRevenue,
        avgOrderValue: mostPopularCard.avgOrderValue,
        price: mostPopularCard.price,
        views: mostPopularCard.views
      });
    
      // Check if this is a fallback (no sales data)
      if (mostPopularCard.salesCount === 0 && mostPopularCard.totalRevenue === 0) {
        console.log("⚠️ This card has no sales data - showing views-based ranking");
      } else {
        console.log("✅ This card has actual sales data!");
        console.log(`📊 Sales Summary: ${mostPopularCard.salesCount} times sold, ${mostPopularCard.totalQuantitySold} units, AUD ${mostPopularCard.totalRevenue} revenue`);
        console.log(`🎯 This is the #1 best selling card based on actual sales performance!`);
      }
  }

  if (!mostPopularCard) {
    return (
      <Card sx={{ 
        // background: 'rgba(255, 255, 255, 0.95)',
        // backdropFilter: 'blur(10px)',
        borderRadius: 3,
        // boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No popular cards found
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
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Star sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Most Popular Card
          </Typography>
        </Box>

        <Grid container spacing={3} alignItems="center">
          {/* Card Image */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                src={mostPopularCard.frontDesign ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/${mostPopularCard.frontDesign.replace(/\\/g, '/')}` : '/placeholder-card.png'}
                alt={mostPopularCard.title}
                sx={{ 
                  width: 200, 
                  height: 200,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                  mx: 'auto',
                  border: '3px solid rgba(102, 126, 234, 0.2)'
                }}
                variant="rounded"
              />
            </Box>
          </Grid>

          {/* Card Details */}
          <Grid item xs={12} md={8}>
            <Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                textAlign: 'left',
                mb: 2,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {mostPopularCard.title}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ShoppingCart sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {mostPopularCard.totalQuantitySold || 0} Quantity Sold
                    </Typography>
                  </Box>
                </Grid>
                {/* <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CurrencyExchange sx={{ fontSize: 20, mr: 1, color: 'success.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      AUD {mostPopularCard.totalRevenue || 0} Revenue
                    </Typography>
                  </Box>
                </Grid> */}
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ShoppingCart sx={{ fontSize: 20, mr: 1, color: 'secondary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                      {mostPopularCard.salesCount || 0} Times Sold
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Visibility sx={{ fontSize: 20, mr: 1, color: 'info.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                      {mostPopularCard.views || 0} Views
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {/* <Receipt sx={{ fontSize: 20, mr: 1, color: 'error.main' }} /> */}
                    <CurrencyExchange sx={{ fontSize: 20, mr: 1, color: 'error.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                      A${mostPopularCard.price || 0} Price
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Sales Performance Summary */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: 2,
                p: 2,
                mb: 2,
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
                  Sales Performance Summary
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This card has been sold <strong>{mostPopularCard.salesCount} times</strong> with a total of{' '}
                  <strong>{mostPopularCard.totalQuantitySold} Quantity</strong> generating{' '}
                  <strong>AUD {mostPopularCard.totalRevenue}</strong> in revenue.
                </Typography>
              </Box>

              {/* Categories */}
              {mostPopularCard.cardType && mostPopularCard.cardType.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Categories:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {mostPopularCard.cardType.map((type, idx) => (
                      <Chip
                        key={idx}
                        label={type}
                        size="small"
                        variant="filled"
                        color="primary"
                        sx={{ fontWeight: 'bold' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Performance Badge */}
              <Box sx={{ 
                display: 'inline-block',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                borderRadius: 2,
                px: 2,
                py: 1,
                mt: 2
              }}>
                <Typography variant="body2" sx={{ 
                  color: 'white', 
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  🏆 #1 Top Best Sell
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MostPopularCard;
