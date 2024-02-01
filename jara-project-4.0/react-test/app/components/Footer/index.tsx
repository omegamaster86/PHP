import React from 'react';
import CustomButton from '../CustomButton';

const Footer: React.FC = () => {
  return (
    <div className='bg-primary-500 px-[100px] pt-[50px] text-white'>
      <div className='flex flex-row justify-between max-w-[900px] m-auto flex-wrap'>
        <div className='flex flex-col gap-[12px] font-semibold'>
          <h2 className='text-h3'>一般向け情報</h2>
          <p className='text-caption font-light'>日本ローイング協会主催大会</p>
          <p className='text-caption font-light'>強化・日本代表チーム</p>
          <p className='text-caption font-light'>世界を目指すには</p>
          <p className='text-caption font-light'>全国マシンローイング大会</p>
          <p className='text-caption font-light'>パラローイング</p>
          <p className='text-caption font-light'>コースタルローイング</p>
          <p className='text-caption font-light'>全国ボート情報サイト</p>
          <p className='text-caption font-thin pb-[20px] mt-[50px]'>
            Copyright © 2024 Japan Rowing Association, All rights reserved.
          </p>
        </div>
        <div className='flex flex-col gap-[12px] font-semibold'>
          <div>
            <div className='font-thin'>Japan Rowing Association</div>
            <div className='text-h3'>公共社団法人 日本ローイング協会 事務局</div>
          </div>
          <p className='text-caption font-thin'>
            〒160-0013
            <br />
            東京都新宿区霞ヶ丘町4-2
            <br />
            ジャパンスポーツオリンピックスクエア 606
          </p>
          <CustomButton buttonType='primary' className='text-white mt-[12px]' onClick={() => {}}>
            お問い合わせはこちらへ
          </CustomButton>
        </div>
      </div>
    </div>
  );
};
export default Footer;
