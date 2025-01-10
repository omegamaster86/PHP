'use client';

import Info from '@/app/(Pages)/(App)/(MyPage)/_components/Info';
import { RoundedBadge } from '@/app/components';
import EmptyScreen from '@/app/components/EmptyScreen';
import { fetcher } from '@/app/lib/swr';
import { MyPageVolunteerInfoData } from '@/app/types';
import { formatDate } from '@/app/utils/dateUtil';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

export default function Volunteer() {
  const router = useRouter();

  const { data } = useSWR(
    {
      url: 'api/getMyPageVolunteerInfoList',
    },
    fetcher<MyPageVolunteerInfoData>,
    {
      onSuccess: (data) => {
        if (!data.result) {
          router.push('/mypage/profile');
        }
      },
      onError: (error) => {
        console.error(error);
        router.push('/mypage/profile');
      },
    },
  );

  const volunteerInfo = data?.result;

  if (!volunteerInfo) {
    return null;
  }

  const infoList = [
    {
      label: '性別',
      value: volunteerInfo.sex,
    },
    {
      label: '誕生日',
      value: formatDate(volunteerInfo.dateOfBirth, 'yyyy/MM/dd'),
    },
    {
      label: '居住地',
      value: [volunteerInfo.countryName, volunteerInfo.prefName].filter((x) => x).join(' '),
    },
    {
      label: 'メールアドレス',
      value: volunteerInfo.mailaddress,
    },
    {
      label: '電話番号',
      value: volunteerInfo.telephoneNumber,
    },
    {
      label: '服のサイズ',
      value: volunteerInfo.clothesSize,
    },
  ];

  return (
    <main>
      {/* スマホの場合は表示 */}
      <div className='block md:hidden'>
        <h2 className='text-2xl font-bold'>ボランティアプロフィール</h2>
      </div>

      <h2 className='text-2xl font-bold my-4'>{volunteerInfo.volunteerName}</h2>

      <div className='flex flex-col gap-1'>
        {infoList.map((info, index) => (
          <Info
            key={index}
            label={info.label}
            labelClassName='font-normal text-gray-300'
            value={info.value}
          />
        ))}
      </div>

      <h3 className='my-4'>補助が可能な障碍タイプ</h3>
      <div className='flex gap-2'>
        {volunteerInfo.disType.map((dis) => (
          <RoundedBadge
            key={dis.disTypeName}
            label={dis.disTypeName}
            isValid={Boolean(dis.isEnable)}
          />
        ))}
      </div>

      <h3 className='my-4'>ボランティア資格</h3>
      <div className='flex gap-2'>
        {!!volunteerInfo.qualHold.length ? (
          volunteerInfo.qualHold.map((qual) => (
            <RoundedBadge key={qual.qualId} label={qual.qualName} isValid />
          ))
        ) : (
          <EmptyScreen message='登録なし' />
        )}
      </div>

      <h3 className='my-4'>言語レベル</h3>
      <div className='flex gap-2'>
        {!!volunteerInfo.languageProficiency.length ? (
          volunteerInfo.languageProficiency.map((lang) => (
            <Info
              key={lang.langId}
              label={lang.langName}
              value={lang.langProName}
              labelClassName='font-normal text-gray-300'
            />
          ))
        ) : (
          <EmptyScreen message='登録なし' />
        )}
      </div>

      <h3 className='my-4'>参加しやすい曜日</h3>
      <div className='flex flex-wrap gap-2'>
        {volunteerInfo.dayOfWeek.map((day) => (
          <RoundedBadge
            key={day.dayOfWeekName}
            label={day.dayOfWeekName}
            isValid={Boolean(day.isEnable)}
          />
        ))}
      </div>

      <h3 className='my-4'>参加可能時間帯</h3>
      <div className='flex flex-wrap gap-2'>
        {volunteerInfo.timeZone.map((time) => (
          <RoundedBadge
            key={time.timeZoneName}
            label={time.timeZoneName}
            isValid={Boolean(time.isEnable)}
          />
        ))}
      </div>

      {/* FIXME: メールアドレスを変更する。 */}
      <p className='my-8'>※登録内容の変更を希望する場合は***@**.jpまでご連絡ください。</p>
    </main>
  );
}
