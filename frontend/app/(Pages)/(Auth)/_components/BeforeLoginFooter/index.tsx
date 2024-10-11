import React from 'react';
import { useRouter } from 'next/navigation';
import { CustomButton } from '@/app/components';

export const BeforeLoginFooter = () => {
  const router = useRouter();

  return (
    <div className='bg-disableBg flex justify-center flex-col items-center text-secondaryText gap-[20px] py-12 '>
      <div className='text-h3 text-black font-bold'>日本ローイング協会 サポートデスク</div>
      <CustomButton
        onClick={() => {
          router.push('/inquiry');
        }}
        buttonType='primary-outlined'
      >
        <p>お問い合わせはこちらへ</p>
      </CustomButton>
      <p className='text-black text-small text-center font-light [&_span]:inline-block'>
        <span>営業時間：土・日・祝日&nbsp;&nbsp;</span>
        <span>休業日を除く月曜〜金曜&nbsp;&nbsp;9:00〜12:00&nbsp;&nbsp;13:00〜17:00</span>
      </p>
    </div>
  );
};
