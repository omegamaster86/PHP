'use client';

import Info from '@/app/(Pages)/(App)/(MyPage)/_components/Info';
import { TitleSideButton } from '@/app/(Pages)/(App)/_components/TitleSideButton';
import { CustomUserAvatar } from '@/app/components/CustomUserAvatar';
import { fetcher } from '@/app/lib/swr';
import { MyPageProfileInfoData } from '@/app/types';
import { formatDate } from '@/app/utils/dateUtil';
import { EditOutlined } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

export default function Profile() {
  const router = useRouter();
  const { data } = useSWR(
    {
      url: 'api/getMyPageProfileList',
    },
    fetcher<MyPageProfileInfoData>,
    {
      onSuccess: (data) => {
        if (!data.result) {
          router.push('/mypage/top');
        }
      },
      onError: (error) => {
        console.error(error);
        router.push('/mypage/top');
      },
    },
  );

  const profile = data?.result;

  if (!profile) {
    return null;
  }

  const left = [
    {
      label: '性別',
      value: profile.sex === null ? '-' : profile.sex,
    },
    {
      label: '身長',
      value: profile.height === null ? '-' : `${profile.height}cm`,
    },
  ];

  const residence =
    profile.countryName === null && profile.prefName === null
      ? '-'
      : [profile.countryName, profile.prefName].filter((x) => x).join(' ');

  const right = [
    {
      label: '生年月日',
      value: profile.dateOfBirth === null ? '-' : formatDate(profile.dateOfBirth, 'yyyy/MM/dd'),
    },
    {
      label: '体重',
      value: profile.weight === null ? '-' : `${profile.weight}kg`,
    },
  ];

  const EditButton = (
    <TitleSideButton href='/userInformation?mode=update' icon={EditOutlined} text='編集' />
  );

  return (
    <main>
      <div className='flex flex-col lg:flex-row gap-8 m-4 md:m-8'>
        {/* スマホの場合は表示 */}
        <div className='flex justify-between md:hidden'>
          <h2 className='text-xl'>プロフィール</h2>
          {EditButton}
        </div>

        <div className='flex items-center justify-center flex-row md:items-start'>
          <CustomUserAvatar
            fileName={profile.photo ?? undefined}
            sx={{ width: 260, height: 260 }}
          />
        </div>

        <div className='md:max-w-lg'>
          <div className='my-4 flex flex-col gap-2'>
            <div className='flex w-full justify-between'>
              <h3 className='text-2xl font-bold'>{profile.userName}</h3>
              {/* スマホの場合は非表示 */}
              <div className='hidden md:block'>{EditButton}</div>
            </div>
            <span className='text-gray-300'>{profile.mailaddress}</span>

            <div className='flex flex-col'>
              <div>
                <span className='whitespace-nowrap'>ユーザーID:</span>
                <span>{profile.userId}</span>
              </div>

              <div>
                <span className='whitespace-nowrap'>ユーザー種別:</span>
                <span className='break-all'>
                  {profile.userType
                    .filter((x) => !!x.isEnable)
                    .map((x) => x.userTypeName)
                    .join('/')}
                </span>
              </div>
            </div>
          </div>
          <h3 className='my-4'>プロフィール</h3>
          <div className='flex gap-4'>
            <div className='flex flex-col gap-2'>
              {left.map((item) => (
                <Info key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            <div className='flex flex-col gap-2'>
              {right.map((item) => (
                <Info key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </div>
          <div className='mt-2'>
            <Info label='居住地' value={residence} labelClassName='whitespace-nowrap' />
          </div>
        </div>
      </div>
    </main>
  );
}
