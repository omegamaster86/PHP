import React from 'react';
import { useState } from 'react';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';

const FollowButton = () => {
  const [isFollowed, setIsFollowed] = useState(false);

  const handleFollowToggle = () => {
    if (isFollowed) {
      // FIXME deleted_flagを1にする機能を追加
      console.log('フォローを解除しました');
    } else {
      // FIXME
      console.log('フォローしました');
    }
    setIsFollowed((prevState) => !prevState);
  };

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
      <p className='text-white text-xs font-bold'>フォロー数</p>
    </div>
  );
};

export default FollowButton;
