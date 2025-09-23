// Commented out heroicons imports - using custom icons from public folder
// import ChartBarIcon from '@heroicons/react/24/solid/ChartBarIcon';
// import CogIcon from '@heroicons/react/24/solid/CogIcon';
// import LockClosedIcon from '@heroicons/react/24/solid/LockClosedIcon';
// import ShoppingBagIcon from '@heroicons/react/24/solid/ShoppingBagIcon';
// import UserIcon from '@heroicons/react/24/solid/UserIcon';
// import UserPlusIcon from '@heroicons/react/24/solid/UserPlusIcon';
// import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
// import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';
// import CreditCardIcon from '@heroicons/react/24/solid/CreditCardIcon';
// import CurrencyDollarIcon from '@heroicons/react/24/solid/CurrencyDollarIcon';
// import TruckIcon from '@heroicons/react/24/solid/TruckIcon';
// import NewspaperIcon from '@heroicons/react/24/solid/NewspaperIcon';
// import { SvgIcon } from '@mui/material';
import { Box } from '@mui/material';

export const items = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: (
      <Box
        component="img"
        src="/card.png"
        alt="Dashboard"
        sx={{
          width: 24,
          height: 24,
          objectFit: 'contain'
        }}
      />
    )
  },
  {
    title: 'Cards',
    path: '/cards',
    icon: (
      <Box
        component="img"
        src="/Cards.png"
        alt="Cards"
        sx={{
          width: 24,
          height: 24,
          objectFit: 'contain'
        }}
      />
    )
  },
  {
    title: 'Order',
    path: '/order',
    icon: (
      <Box
        component="img"
        src="/transaction.png"
        alt="Order"
        sx={{
          width: 24,
          height: 24,
          objectFit: 'contain'
        }}
      />
    )
  },
  {
    title: 'News and Offers',
    path: '/news-and-offers',
    icon: (
      <Box
        component="img"
        src="/news.png"
        alt="News and Offers"
        sx={{
          width: 24,
          height: 24,
          objectFit: 'contain'
        }}
      />
    )
  },
  {
    title: 'Account',
    path: '/account',
    icon: (
      <Box
        component="img"
        src="/user.png"
        alt="Account"
        sx={{
          width: 24,
          height: 24,
          objectFit: 'contain'
        }}
      />
    )
  }
];
