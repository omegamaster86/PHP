import { List } from '@mui/material';
import AvatarSection from './AvatarSection';
import NestedItem from './NestedItem';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/app/hooks/auth';

export type MyPageSideBarListItem = {
  title: string;
  link?: string;
  action?: () => void;
  items?: Omit<MyPageSideBarListItem, 'show'>[];
  active: boolean;
  show?: boolean;
};

export type MyPageSideBarUser = {
  name: string;
  tags: string[];
  avatarUrl?: string;
};

type Props = {
  user: MyPageSideBarUser;
  listItems: MyPageSideBarListItem[];
};

const MyPageSideBar: React.FC<Props> = (props) => {
  const { user, listItems } = props;
  const { logout } = useAuth({ middleware: 'auth' });

  return (
    <List
      component='nav'
      sx={{
        width: '100%',
        maxWidth: 256,
        bgcolor: 'background.paper',
        padding: '24px',
        borderRight: '1px solid #F6F6F6',
      }}
    >
      <AvatarSection user={user} />

      <hr className='my-4 opacity-30 bg-[#F6F6F6]' />
      <div
        className='text-xs gap-2 flex items-center px-4 cursor-pointer'
        onClick={() => {
          logout();
        }}
      >
        <LogoutIcon />
        ログアウト
      </div>
      <hr className='my-4 opacity-30 bg-[#F6F6F6]' />

      {listItems.map((item) => (
        <NestedItem key={item.title} item={item} withTreeLine />
      ))}
    </List>
  );
};

export default MyPageSideBar;
