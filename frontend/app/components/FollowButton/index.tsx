import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';

const FollowButton = ({
  isFollowed,
  handleFollowToggle,
  followedCount,
}: {
  isFollowed: boolean;
  handleFollowToggle: () => void;
  followedCount: string;
}) => {

  return (
    <div className='flex items-center gap-2'>
      <button
        type='button'
        className='bg-white rounded-full h-8 w-8 grid place-content-center'
        onClick={handleFollowToggle}
      >
        {isFollowed ? (
          <StarIcon className='text-systemWarningText' />
        ) : (
          <StarBorderIcon className='text-black' />
        )}
      </button>
      <p className='text-white text-xs font-bold'>フォロワー数：{followedCount}</p>
    </div>
  );
};

export default FollowButton;
