// 機能名: ボランティア情報参照画面・ボランティア情報削除画面
'use client';

import { TitleSideButton } from '@/app/(Pages)/(App)/_components/TitleSideButton';
import {
  CustomButton,
  CustomTextField,
  CustomTitle,
  ErrorBox,
  InputLabel,
  OriginalCheckbox,
} from '@/app/components';
import { useUserType } from '@/app/hooks/useUserType';
import axios from '@/app/lib/axios';
import { UserIdType, VolunteerResponse } from '@/app/types';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatDate } from '@/app/utils/dateUtil';

const volunteerInitialState: VolunteerResponse = {
  volunteer_id: '',
  volunteer_name: '',
  residence_country: '',
  residence_country_code: '',
  residence_prefecture: '',
  residence_prefecture_code_jis: '',
  sex: '',
  date_of_birth: '',
  telephone_number: '',
  mailaddress: '',
  clothes_size: '',
  personality: '',
  dis_type_id: [],
  qualHold: [],
  language: [],
  language_proficiency: [],
  day_of_week: '',
  time_zone: '',
  photo: '',
};

export default function VolunteerInformationRef() {
  const [userIdType, setUserIdType] = useState({} as UserIdType); //ユーザIDに紐づいた情報 20241216
  const [volunteer, setVolunteer] = useState<VolunteerResponse>(volunteerInitialState);
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode'); // なし(参照), deleteの2モード
  switch (mode) {
    case 'delete':
      break;
    default:
      // デフォルトは参照モード
      break;
  }

  // ボランティアIDを取得
  const volunteerId = searchParams.get('volunteer_id')?.toString() || '';

  useUserType({
    onSuccess: (userType) => {
      const isMyVolunteerInfo =
        userType.volunteerId && volunteerId && userType.volunteerId === Number(volunteerId);
      const hasAuthority =
        userType.isAdministrator ||
        userType.isJara ||
        userType.isPrefBoatOfficer ||
        isMyVolunteerInfo;

      if (!hasAuthority) {
        router.replace('/mypage/top');
      }
    },
  });

  /**
   * @param binaryString
   * @param index
   * @returns
   * @description
   * 12桁の2進数文字列を受け取り、index番目の値をbool型で返す。
   * indexが12桁より大きい場合、undefinedを返す。
   * @example
   * getDayOfWeekBool('001110000000', 0) // false
   * getDayOfWeekBool('001110000000', 1) // false
   * getDayOfWeekBool('001110000000', 2) // false
   * getDayOfWeekBool('001110000000', 3) // true
   * getDayOfWeekBool('001110000000', 4) // true
   * getDayOfWeekBool('001110000000', 5) // true
   * getDayOfWeekBool('001110000000', 6) // false
   */
  const getDayOfWeekBool = (binaryString: string, index: number) => {
    if (binaryString == undefined) {
      return;
    }
    if (binaryString.length !== 12) {
      return;
    }
    if (binaryString[index] === '1') {
      return true;
    }
    return false;
  };

  const getTimeZoneBool = (binaryString: string, index: number) => {
    if (binaryString == undefined) {
      return;
    }
    if (binaryString.length !== 8) {
      return;
    }
    if (binaryString[index] === '1') {
      return true;
    }
    return false;
  };

  //ボランティア情報削除関数 20240315
  const dataDelete = async () => {
    await axios
      .post('api/deleteVolunteer', {
        volunteer_id: volunteerId,
      })
      .then((res) => {
        //console.log(res.data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userTypeInfo = await axios.get('api/getIDsAssociatedWithUser');
        setUserIdType(userTypeInfo.data.result[0]); //ユーザIDに紐づいた情報

        const volunteerResponse = await axios.post('api/getVolunteerData', {
          volunteer_id: volunteerId,
        }); //ボランティア情報の取得
        const volLangProDataList = volunteerResponse.data.volLangProData.map(
          ({ lang_pro_name, lang_name }: { lang_pro_name: number; lang_name: string }) => ({
            level: lang_pro_name,
            languageName: lang_name,
          }),
        );

        var day_of_week_List = volunteerResponse.data.volAvaData.day_of_week.split('');

        var tmpArray = Array(); //サイド情報のエンディアン入れ替え
        for (let index = day_of_week_List.length - 1; index >= 0; index--) {
          tmpArray.push(day_of_week_List[index]);
        }
        day_of_week_List = tmpArray;

        var time_zone_List = volunteerResponse.data.volAvaData.time_zone.split('');
        var time_tmpArray = Array(); //サイド情報のエンディアン入れ替え
        for (let index = time_zone_List.length - 1; index >= 0; index--) {
          time_tmpArray.push(time_zone_List[index]);
        }
        time_zone_List = time_tmpArray;

        setVolunteer({
          volunteer_id: volunteerResponse.data.result.volunteer_id, // ボランティアID
          volunteer_name: volunteerResponse.data.result.volunteer_name, // 氏名
          residence_country: volunteerResponse.data.result.country_name, // 居住地（国）
          residence_country_code: volunteerResponse.data.result.country_code, // 居住地（国コード）
          residence_prefecture: volunteerResponse.data.result.pref_name, // 居住地（都道府県）
          residence_prefecture_code_jis: volunteerResponse.data.result.pref_code_jis, // 居住地（都道府県コード）
          sex: volunteerResponse.data.result.master_sex_type, // 性別
          date_of_birth: volunteerResponse.data.result.date_of_birth, // 生年月日
          telephone_number: volunteerResponse.data.result.telephone_number, // 電話番号
          mailaddress: volunteerResponse.data.result.mailaddress, // メールアドレス
          clothes_size: volunteerResponse.data.result.master_clothes_size, // 服のサイズ
          personality: volunteerResponse.data.result.personality, // 性格
          dis_type_id: volunteerResponse.data.volSupDisData, // 障碍タイプ
          qualHold: volunteerResponse.data.volQualData, // 保有資格
          language: volLangProDataList, // 言語
          language_proficiency: '', //残件対応項目
          day_of_week: day_of_week_List, // 曜日
          time_zone: time_zone_List, // 時間帯
          photo: volunteerResponse.data.result.photo, // 写真　#置き換え作業未対応
        });
      } catch (error: any) {
        setErrorMessage([error.response?.data?.message || 'エラーが発生しました。']);
      }
    };

    fetchData();
  }, []);

  if (volunteerId === '') return null;

  if (volunteer.volunteer_id === '') {
    return <ErrorBox errorText={errorMessage} />;
  }

  return (
    <>
      <div className='flex flex-row justify-between items-center '>
        <CustomTitle displayBack={true}>
          ボランティア情報{mode === 'delete' && '削除'}
          {mode !== 'delete' && '参照'}
        </CustomTitle>
        {mode !== 'delete' &&
          (userIdType.is_administrator == 1 ||
            userIdType.volunteer_id?.toString() == volunteerId) && (
            <TitleSideButton
              href={{
                pathname: '/volunteerInformationRef',
                query: { mode: 'delete', volunteer_id: volunteerId },
              }}
              icon={DeleteOutlineIcon}
              text='ボランティア情報削除'
            />
          )}
      </div>
      <ErrorBox errorText={errorMessage} />
      <div className='flex flex-row gap-[20px] justify-between'>
        <div className='flex flex-col gap-[20px]'>
          {/* 写真 */}
          <InputLabel label='写真' required={false} />
          <img src={volunteer.photo} className='w-[200px] h-[200px] rounded-[10px] object-cover' />
        </div>
      </div>
      <div className='flex flex-wrap gap-[20px]'>
        <div className='flex flex-col gap-[20px] max-w-[400px]'>
          {/* ボランティアID */}
          <CustomTextField
            label='ボランティアID'
            value={'v' + volunteer.volunteer_id}
            readonly
            displayHelp={false}
            onChange={(e) => {}}
          />
          {/* 氏名 */}
          <CustomTextField
            label='氏名'
            value={volunteer.volunteer_name}
            readonly
            displayHelp={false}
            onChange={(e) => {}}
          />
          {/* 生年月日 */}
          <CustomTextField
            label='生年月日'
            value={formatDate(volunteer.date_of_birth, 'yyyy/MM/dd')}
            readonly
            displayHelp={false}
            onChange={(e) => {}}
          />
          {/* 性別 */}
          <CustomTextField
            label='性別'
            value={volunteer.sex}
            readonly
            displayHelp={false}
            onChange={(e) => {}}
          />
          {/* 居住地（国） */}
          <div className='flex flex-row gap-[16px]'>
            <CustomTextField
              label='居住地'
              value={volunteer.residence_country}
              readonly
              displayHelp={false}
              onChange={(e) => {}}
            />
            {/* 居住地（都道府県） */}
            <CustomTextField
              label='都道府県'
              value={volunteer.residence_prefecture}
              readonly
              displayHelp={false}
              onChange={(e) => {}}
            />
          </div>
          {/* 電話番号 */}
          <CustomTextField
            label='電話番号'
            value={volunteer.telephone_number}
            readonly
            displayHelp={false}
            onChange={(e) => {}}
          />
          {/* メールアドレス */}
          <CustomTextField
            label='メールアドレス'
            value={volunteer.mailaddress}
            readonly
            displayHelp={false}
            onChange={(e) => {}}
          />
        </div>
        <div className='flex flex-col gap-[20px] max-w-[400px]'>
          {/* 服のサイズ */}
          <CustomTextField
            label='服のサイズ'
            value={volunteer.clothes_size}
            readonly
            displayHelp={false}
            onChange={(e) => {}}
          />
          {/* 障碍タイプ */}
          <InputLabel
            label='補助が可能な障碍タイプ'
            displayHelp={true}
            toolTipText='PR1：<br>
              腕と肩は完全に動くが、脚の機能が失われている選手。脊椎損傷などが原因として考えられる。平衡機能が弱いため、体をボートに固定させる<br>
              PR2：<br>
              胴体と腕は十分に動くが、脚の機能が減少している選手。漕ぐ時はスライドするシートを使えない<br>
              PR3：<br>
              四肢と胴体に障害があるが、動かすことができる選手。視覚障害者もこのクラスに分類される'
          />
          <div className='flex flex-row gap-[16px] justify-start'>
            {volunteer.dis_type_id?.map((volSupDisData: any) => (
              <OriginalCheckbox
                id='disType'
                key={volSupDisData.dis_type_name as string}
                label={volSupDisData.dis_type_name}
                value={volSupDisData.dis_type_name}
                checked={volSupDisData.dis_type_name.length > 0}
                readonly
                onChange={(e) => {}}
              />
            ))}
          </div>
          {/* 資格情報 */}
          <InputLabel label='資格情報' />
          <div className='flex flex-row gap-[16px] justify-start'>
            {volunteer.qualHold?.map((qualHold: any) => (
              <div id='qualHold' key={qualHold.qual_name as string}>
                <p className='text-secondaryText'>
                  {qualHold.qual_id == 99
                    ? (qualHold.others_qual as string)
                    : (qualHold.qual_name as string)}
                </p>
              </div>
            ))}
          </div>
          <InputLabel
            label='言語'
            displayHelp={true}
            toolTipText='A1（初心者）：<br>
              自己紹介ができ、どこに住んでいるか、誰を知っているか、何を持っているかと言った個人的なことを聞き、こたえることができる。<br>
              A2（初級）：<br>
               慣れ親しんだ内容であれば単純で直接的な会話ができる。<br>
              B1（中級）：<br>
              仕事や学校、レジャーなど慣れ親しんだ環境の話題であれば、主な内容は理解・会話することができる。<br>
              B2（中級の上）：<br>
              ネイティブスピーカーと、ある程度流暢にストレスなく普通の会話をすることができる。<br>
              C1（上級）：<br>
              言葉や表現に悩まずに自身の考えを流暢によどみなく伝えることができる。<br>
              C2（ネイティブ）：<br>
              どんな複雑な状況下でも一貫して言葉のニュアンスの違いなどに気を配りながら流暢に正確に自己表現ができる。'
          />
          {volunteer.language?.map((language: any) => (
            <div
              id='language'
              key={language.languageName}
              className='flex flex-row gap-[6px] justify-start'
            >
              {/* 言語（種類） */}
              <p className='text-secondaryText'>{language.languageName}：</p>
              {/* 言語（レベル） */}
              <p className='text-secondaryText'>{language.level}</p>
            </div>
          ))}
        </div>
      </div>
      <div className='flex flex-col gap-[20px] '>
        {/* 参加可能曜日 */}
        <div className='text-h3 font-bold my-2'>参加しやすい曜日</div>
        <p>曜日指定</p>
        <div className='flex flex-row gap-[16px] flex-wrap'>
          <OriginalCheckbox
            id='anyday'
            label='祝日は可'
            value=''
            checked={getDayOfWeekBool(volunteer.day_of_week, 7) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='sunday'
            label='日曜日'
            value=''
            checked={getDayOfWeekBool(volunteer.day_of_week, 0) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='monday'
            label='月曜日'
            value=''
            checked={getDayOfWeekBool(volunteer.day_of_week, 1) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='tuesday'
            label='火曜日'
            value=''
            checked={getDayOfWeekBool(volunteer.day_of_week, 2) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='wednesday'
            label='水曜日'
            value=''
            checked={getDayOfWeekBool(volunteer.day_of_week, 3) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='thursday'
            label='木曜日'
            value=''
            checked={getDayOfWeekBool(volunteer.day_of_week, 4) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='friday'
            label='金曜日'
            value=''
            checked={getDayOfWeekBool(volunteer.day_of_week, 5) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='saturday'
            label='土曜日'
            value=''
            checked={getDayOfWeekBool(volunteer.day_of_week, 6) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='any'
            label='相談可能'
            value=''
            checked={getDayOfWeekBool(volunteer.day_of_week, 8) || false}
            readonly
            onChange={(e) => {}}
          />
        </div>
        {/* 参加可能時間帯 */}
        <div className='text-h3 font-bold my-2'>参加しやすい時間帯</div>
        <div className='flex flex-col gap-[16px]'>
          <p>時間帯指定</p>
          <OriginalCheckbox
            id='anytime'
            label='相談可能'
            value=''
            checked={getTimeZoneBool(volunteer.time_zone, 7) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='earlymorning'
            label='早朝　 06:00〜08:00'
            value=''
            checked={getTimeZoneBool(volunteer.time_zone, 0) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='morning'
            label='午前　 08:00〜12:00'
            value=''
            checked={getTimeZoneBool(volunteer.time_zone, 1) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='afternoon'
            label='午後　 12:00〜16:00'
            value=''
            checked={getTimeZoneBool(volunteer.time_zone, 2) || false}
            readonly
            onChange={(e) => {}}
          />
          <OriginalCheckbox
            id='night'
            label='夜　　 16:00〜20:00'
            value=''
            checked={getTimeZoneBool(volunteer.time_zone, 3) || false}
            readonly
            onChange={(e) => {}}
          />
        </div>
      </div>
      <div className='flex flex-row mb-1 gap-[16px] justify-center'>
        {/* 戻るボタン */}
        {window.history.length > 1 && (
          <CustomButton
            buttonType='white-outlined'
            className='text-normal h-12 mb-6'
            onClick={() => {
              router.back();
              // ボランティア情報参照画面に遷移
            }}
          >
            戻る
          </CustomButton>
        )}
        {/* 削除ボタン */}
        {mode === 'delete' && (
          <CustomButton
            buttonType='primary'
            className='text-secondaryText text-normal h-12 mr-1 mb-6'
            onClick={async () => {
              if (isSubmitting) {
                return;
              }
              setIsSubmitting(true);

              const ok = window.confirm('ボランティア情報を削除します。よろしいですか？');
              if (ok) {
                await dataDelete();
                window.alert('ボランティア情報の削除が完了しました。');
                router.push('/volunteerSearch'); //大会検索画面に遷移する
              }

              setIsSubmitting(false);
            }}
          >
            削除
          </CustomButton>
        )}
      </div>
    </>
  );
}
