import { FC } from 'react';
import CustomButton from '../CustomButton';
import { useRouter } from 'next/navigation';

const Footer: FC = () => {
  const router = useRouter();
  return (
    <div className='bg-primary-500 pt-[50px] pb-[20px] text-white'>
      <div className='max-w-5xl m-auto px-3'>
        <div className='flex flex-col md:flex-row mb-8 gap-6 md:gap-12'>
          <div className='flex flex-col gap-2 font-semibold w-fit'>
            <h2 className='text-h3'>一般向け情報</h2>
            <a
              className='text-caption font-light'
              href='https://www.jara.or.jp/race/current/'
              rel='noopener noreferrer'
              target='_blank'
            >
              日本ローイング協会主催大会
            </a>
            <a
              className='text-caption font-light'
              href='https://www.jara.or.jp/kyoka/current/'
              rel='noopener noreferrer'
              target='_blank'
            >
              強化・日本代表チーム
            </a>
            <a
              className='text-caption font-light'
              href='https://www.jara.or.jp/tryout/'
              rel='noopener noreferrer'
              target='_blank'
            >
              世界を目指すには
            </a>
            <a
              className='text-caption font-light'
              href='https://www.jara.or.jp/mr/current/'
              rel='noopener noreferrer'
              target='_blank'
            >
              全国マシンローイング大会
            </a>
            <a
              className='text-caption font-light'
              href='https://www.jara.or.jp/para/current/'
              rel='noopener noreferrer'
              target='_blank'
            >
              パラローイング
            </a>
            <a
              className='text-caption font-light'
              href='https://www.jara.or.jp/coastal/current/'
              rel='noopener noreferrer'
              target='_blank'
            >
              コースタルローイング
            </a>
            <a
              className='text-caption font-light'
              href='https://www.rowing-boat.jp/'
              rel='noopener noreferrer'
              target='_blank'
            >
              全国ボート情報サイト
            </a>
          </div>
          <div className='flex flex-col gap-2 font-semibold'>
            <h2 className='text-h3'>日本ローイング協会について</h2>
            <a
              className='text-caption font-light'
              href='https://www.jara.or.jp/info/current/'
              rel='noopener noreferrer'
              target='_blank'
            >
              日本ローイング協会からのお知らせ
            </a>
            <a
              className='text-caption font-light'
              href='https://www.jara.or.jp/jara/'
              rel='noopener noreferrer'
              target='_blank'
            >
              日本ローイング協会について（事業計画/報告）
            </a>
            <a
              className='text-caption font-light'
              href='https://www.jara.or.jp/jara/index.html#soshiki'
              rel='noopener noreferrer'
              target='_blank'
            >
              組織図
            </a>
            <a
              className='text-caption font-light'
              href='https://www.jara.or.jp/public/'
              rel='noopener noreferrer'
              target='_blank'
            >
              出版物の案内
            </a>
            <a
              className='text-caption font-light'
              href='https://www.jara.or.jp/history.html'
              rel='noopener noreferrer'
              target='_blank'
            >
              日本のローイング略史
            </a>
            <a
              className='text-caption font-light'
              href='https://www.jara.or.jp/about.html'
              rel='noopener noreferrer'
              target='_blank'
            >
              ローイング競技について
            </a>
          </div>
        </div>
        <div className='flex flex-col gap-[12px] font-semibold'>
          <div>
            <span className='block font-thin'>Japan Rowing Association</span>
            <span className='text-h3 [&_span]:inline-block'>
              <span>公共社団法人&nbsp;</span>
              <span>日本ローイング協会&nbsp;事務局</span>
            </span>
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
  );
};
export default Footer;
