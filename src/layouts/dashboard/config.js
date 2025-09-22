import ChartBarIcon from '@heroicons/react/24/solid/ChartBarIcon';
import CogIcon from '@heroicons/react/24/solid/CogIcon';
import LockClosedIcon from '@heroicons/react/24/solid/LockClosedIcon';
import ShoppingBagIcon from '@heroicons/react/24/solid/ShoppingBagIcon';
import UserIcon from '@heroicons/react/24/solid/UserIcon';
import UserPlusIcon from '@heroicons/react/24/solid/UserPlusIcon';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';
import CreditCardIcon from '@heroicons/react/24/solid/CreditCardIcon';
import CurrencyDollarIcon from '@heroicons/react/24/solid/CurrencyDollarIcon';
import TruckIcon from '@heroicons/react/24/solid/TruckIcon';
import NewspaperIcon from '@heroicons/react/24/solid/NewspaperIcon';
import { SvgIcon } from '@mui/material';

export const items = [
  {
    title: 'Cards',
    path: '/cards',
    icon: (
      <SvgIcon fontSize="medium">
        <CreditCardIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Transactions',
    path: '/transaction',
    icon: (
      <SvgIcon fontSize="medium">
        <CurrencyDollarIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Express Shipping',
    path: '/express-shipping-users',
    icon: (
      <SvgIcon fontSize="medium">
        <TruckIcon />
      </SvgIcon>
    )
  },
  {
    title: 'News and Offers',
    path: '/news-and-offers',
    icon: (
      <SvgIcon fontSize="medium">
        <NewspaperIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Account',
    path: '/account',
    icon: (
      <SvgIcon fontSize="medium">
        <UserIcon />
      </SvgIcon>
    )
  }
];
