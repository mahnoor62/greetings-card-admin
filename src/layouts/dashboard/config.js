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
    title: 'Account',
    path: '/account',
    icon: (
      <SvgIcon fontSize="medium">
        <UserIcon />
      </SvgIcon>
    )
  }
];
