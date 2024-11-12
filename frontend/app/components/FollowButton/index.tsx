import { ElementType } from 'react';
import clsx from 'clsx';

const FollowButton = ({
  isFollowed,
  handleFollowToggle,
  followedCount,
  icon: Icon,
  text,
}: {
  isFollowed: boolean;
  handleFollowToggle: () => void;
  followedCount: number;
  icon: ElementType;
  text: string;
}) => {
  return (
    <button
      type='button'
      className={clsx('flex items-center px-3 py-1 rounded-full border border-white gap-2', {
        'bg-white': !isFollowed,
      })}
      onClick={handleFollowToggle}
    >
      {isFollowed ? (
        <>
          <Icon className=' text-white h-4' />
          <p className='text-white text-2xs font-bold'>フォロー中</p>
          <div className=' bg-white rounded-full shrink-0 h-4 min-w-4 grid place-content-center'>
            <p className='text-2xs font-bold text-primary-500 px-2'>{followedCount.toLocaleString()}</p>
          </div>
        </>
        
      ) : (
        <>
          <Icon className='text-primary-500 h-4' />
          <p className='text-primary-500 text-2xs font-bold'>{text}をフォロー</p>
          <div className=' bg-primary-500 rounded-full shrink-0 h-4 min-w-4 grid place-content-center'>
            <p className='text-2xs font-bold text-white px-2'>{followedCount.toLocaleString()}</p>
          </div>
        </>
      )}
    </button>
  );
};

export default FollowButton;
