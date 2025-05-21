import { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography
} from '@mui/material';
import TablePagination from '@mui/material/TablePagination';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/use-auth';

const LeaderBoard = () => {
  //get gameslug from parameters
  const router = useRouter();
  const { game: gameSlug } = router.query;

  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  // set leaderboard data in stat
  const [leaderboard, setLeaderboard] = useState([]);
  // pagination stats
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  // leaderboard api
  const LeaderBoard = async () => {
    setLoading(true);
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const token = window.localStorage.getItem('token');

    try {
      if (token) {
        const response = await axios.get(
          `${API_BASE_URL}/api/user/player/leader-board/${gameSlug}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-access-token': token
            }
          }
        );
        console.log(response);
        setLeaderboard(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };
  const totalCount = leaderboard.length;

  useEffect(() => {
    LeaderBoard();
  }, [gameSlug]);

  return (
    <>
      <Head>
        <title>LeaderBoard| {process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      <Box
        sx={{
          backgroundColor: 'background.paper',
          // flex: '1 1 auto',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center'
          // marginTop:'0'
        }}
      >
        <Box
          sx={{
            maxWidth: 700,
            px: 3,
            py: '100px',
            width: '100%'
          }}
        >
          <Box sx={{ display: 'flex', width: '100%' }}>
            <Box sx={{ width: '100%', textAlign: 'center', margin: '20px' }}>
              <Typography variant="h4">Leaderboard</Typography>
            </Box>
          </Box>
          <div>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 100 }}>
                <TableHead>
                  <TableRow style={{ backgroundColor: '#add540' }}>
                    <TableCell align="right" style={{ backgroundColor: '#add540' }}>User</TableCell>
                    <TableCell align="right"
                               style={{ backgroundColor: '#add540' }}>Player</TableCell>
                    <TableCell align="right" style={{ backgroundColor: '#add540' }}>Game</TableCell>
                    <TableCell align="right"
                               style={{ backgroundColor: '#add540' }}>Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    leaderboard.map((entry, index) => (
                      <TableRow key={index}>
                        <TableCell align="right">{entry.userId.name}</TableCell>
                        <TableCell align="right">{entry.playerId.name}</TableCell>
                        <TableCell align="right">{entry.gameId.name}</TableCell>
                        <TableCell align="right">{entry.score}</TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>

            {/*pagination*/}
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </div>

        </Box>
      </Box>
    </>
  );
};

export default LeaderBoard;
