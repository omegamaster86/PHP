import { FC } from 'react';
import CustomButton from '../CustomButton';
import { useRouter } from 'next/navigation';

const Footer: FC = () => {
  const router = useRouter();
  return (
    <div className='bg-primary-500 px-[15px] pt-[50px] pb-[20px] text-white'>
      <div className='max-w-4xl m-auto'>
        <div className='flex justify-between flex-wrap flex-col md:flex-row gap-3 m-auto'>
          <div className='flex flex-col gap-[12px] font-semibold'>
            {/* FIXME：リンク設定 */}
            <h2 className='text-h3'>一般向け情報</h2>
            <p className='text-caption font-light'>日本ローイング協会主催大会</p>
            <p className='text-caption font-light'>強化・日本代表チーム</p>
            <p className='text-caption font-light'>世界を目指すには</p>
            <p className='text-caption font-light'>全国マシンローイング大会</p>
            <p className='text-caption font-light'>パラローイング</p>
            <p className='text-caption font-light'>コースタルローイング</p>
            <p className='text-caption font-light'>全国ボート情報サイト</p>
          </div>
          <div className='flex flex-col gap-[12px] font-semibold'>
            <div className='font-thin'>Japan Rowing Association</div>
            <div className='text-h3 [&_span]:inline-block'>
              <span>公共社団法人&nbsp;</span>
              <span>日本ローイング協会&nbsp;事務局</span>
            </div>
            <p className='text-caption font-thin'>
              〒160-0013
              <br />
              東京都新宿区霞ヶ丘町4-2
              <br />
              ジャパンスポーツ
              <br />
              オリンピックスクエア&nbsp;606
            </p>
            <CustomButton
              buttonType='primary'
              className='text-white'
              onClick={() => {
                router.push('/inquiry');
              }}
            >
              お問い合わせはこちらへ
            </CustomButton>
          </div>
          <p className='text-caption font-thin mt-[50px]'>
            Copyright © 2024 Japan Rowing Association, All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
export default Footer;
