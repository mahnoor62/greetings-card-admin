
import QRCode from 'react-qr-code';
import { useMediaQuery, useTheme } from '@mui/material';


const QRCodeGenerator = ({ value }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('mobile'));
  return (
    // <div style={{ background: 'white', padding: '16px' }}>
    <QRCode value={value} size={200} />
    // </div>
  );
};

export default QRCodeGenerator;
