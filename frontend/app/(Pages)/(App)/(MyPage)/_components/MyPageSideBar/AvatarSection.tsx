import { CustomAvatar } from '@/app/components/CustomAvatar';
import Tag from '@/app/components/Tag';
import { MyPageSideBarUser } from '.';

type Props = {
  user: MyPageSideBarUser;
};

const AvatarSection: React.FC<Props> = (props) => {
  const { user } = props;

  return (
    <div className='flex items-center justify-center flex-row gap-2'>
      <CustomAvatar fileName={user.avatarUrl} sx={{ width: 44, height: 44 }} />
      <div className='flex flex-col gap-2'>
        <div className='flex flex-wrap justify-start gap-[2px]'>
          {user.tags.map((tag) => (
            <Tag key={tag} tag={tag} className='bg-gray-50' />
          ))}
        </div>
        <h2 className='text-base font-semibold'>{user.name}</h2>
      </div>
    </div>
  );
};

export default AvatarSection;
