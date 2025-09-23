import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Box,
  Chip,
  LinearProgress
} from '@mui/material';
import { Visibility, AttachMoney, ShoppingCart } from '@mui/icons-material';

const PopularCardsTable = ({ data, loading }) => {
  if (loading) {
    return (
      <Paper sx={{ 
        p: 3, 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
          Most Popular Cards
        </Typography>
        <LinearProgress />
      </Paper>
    );
  }

  const cards = data?.popularCards || [];

  return (
    <Paper sx={{ 
      p: 3, 
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ShoppingCart sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Best Selling Cards
        </Typography>
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              '& .MuiTableCell-root': {
                fontWeight: 'bold',
                fontSize: '1rem',
                color: 'text.primary',
                borderBottom: '2px solid',
                borderColor: 'primary.main'
              }
            }}>
              <TableCell>Card</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Sales</TableCell>
              <TableCell>Revenue</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Category</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cards.length > 0 ? (
              cards.map((card, index) => (
                <TableRow key={card._id || index} sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.04)'
                  }
                }}>
                  <TableCell>
                    <Avatar
                      src={card.frontDesign ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/${card.frontDesign.replace(/\\/g, '/')}` : '/placeholder-card.png'}
                      alt={card.title}
                      sx={{ 
                        width: 60, 
                        height: 60,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                      variant="rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {card.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ShoppingCart sx={{ fontSize: 18, mr: 0.5, color: 'primary.main' }} />
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {card.salesCount || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoney sx={{ fontSize: 18, mr: 0.5, color: 'success.main' }} />
                      <Typography variant="body1" color="success.main" sx={{ fontWeight: 'bold' }}>
                        ${card.totalRevenue || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      ${card.price || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {card.cardType && card.cardType.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {card.cardType.slice(0, 2).map((type, idx) => (
                          <Chip
                            key={idx}
                            label={type}
                            size="small"
                            variant="filled"
                            color="primary"
                            sx={{ fontWeight: 'bold' }}
                          />
                        ))}
                        {card.cardType.length > 2 && (
                          <Chip
                            label={`+${card.cardType.length - 2}`}
                            size="small"
                            variant="outlined"
                            color="secondary"
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No category
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No cards found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PopularCardsTable;
