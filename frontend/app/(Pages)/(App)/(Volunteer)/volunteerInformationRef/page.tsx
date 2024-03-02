// 機能名: ボランティア情報参照画面・ボランティア情報削除画面
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ErrorBox,
  CustomTitle,
  InputLabel,
  CustomButton,
  CustomTextField,
  OriginalCheckbox,
  Tab,
  CustomTable,
  CustomThead,
  CustomTh,
  CustomTr,
  CustomTbody,
  CustomTd,
} from '@/app/components';
import axios from '@/app/lib/axios';
import Link from 'next/link';
import EditIcon from '@mui/icons-material/EditOutlined';
import { VolunteerResponse, VolunteerHistoriesResponse } from '@/app/types';

export default function VolunteerInformationRef() {
  const [volunteerdata, setVolunteerdata] = useState({} as VolunteerResponse);
  const [volunteerHistoriesdata, setVolunteerHistoriesdata] = useState(
    [] as VolunteerHistoriesResponse[],
  );
  const [errorMessage, setErrorMessage] = useState([] as string[]);
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
  switch (volunteerId) {
    case '':
      break;
    default:
      break;
  }
  const [volunteer_id, setVolunteerId] = useState<any>({
    volunteer_id: volunteerId,
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: 仮のURL（繋ぎ込み時に変更すること）
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        // const volunteerResponse = await axios.get<VolunteerResponse>('/volunteer',);
        const volunteerResponse = await axios.post('/getVolunteerData', volunteer_id); //ボランティア情報の取得 20240213
        // console.log(volunteerResponse.data.result);
        setVolunteerdata({
          volunteer_id: volunteerResponse.data.result.volunteer_id, // ボランティアID
          volunteer_name: volunteerResponse.data.result.volunteer_name, // 氏名
          residence_country: volunteerResponse.data.result.residence_country, // 居住地（国）
          residence_prefecture: volunteerResponse.data.result.residence_prefecture, // 居住地（都道府県）
          sex: volunteerResponse.data.result.sex, // 性別　#置き換え作業未対応
          date_of_birth: volunteerResponse.data.result.date_of_birth, // 生年月日
          telephone_number: volunteerResponse.data.result.telephone_number, // 電話番号
          mailaddress: volunteerResponse.data.result.mailaddress, // メールアドレス
          clothes_size: volunteerResponse.data.result.clothes_size, // 服のサイズ
          personality: volunteerResponse.data.result.personality, // 性格　#置き換え作業未対応
          dis_type_id: [''], // 障碍タイプ
          qualHold: [''], // 保有資格　#置き換え作業未対応
          language: [''], // 言語　#置き換え作業未対応
          language_proficiency: '', //残件対応項目
          day_of_week: volunteerResponse.data.result.day_of_week, // 曜日
          time_zone: volunteerResponse.data.result.time_zone, // 時間帯
          photo: volunteerResponse.data.result.photo, // 写真　#置き換え作業未対応
        });
        // const volunteerHistoriesResponse = await axios.get<VolunteerHistoriesResponse[]>(
        //   '/volunteerHistories',
        // );
        // console.log(volunteerResponse.data.volHistData)
        setVolunteerHistoriesdata(volunteerResponse.data.volHistData);
      } catch (error) {
        // TODO: エラーハンドリングを実装
        setErrorMessage([
          ...(errorMessage as string[]),
          'API取得エラー:' + (error as Error).message,
        ]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => { }, []);
  const [activeTab, setActiveTab] = useState<number>(0);

  const handleTabChange = (tabNumber: number) => {
    setActiveTab(tabNumber);
  };
  return (
    <div>
      <main className='flex flex-col justify-start gap-[20px] my-[80px] flex-nowrap'>
        <div className='w-9/12 m-3 flex flex-row items-center justify-between gap-[20px]'>
          <CustomTitle isCenter={false} displayBack={true}>
            ボランティア情報{mode === 'delete' && '削除'}
            {mode !== 'delete' && '参照'}
          </CustomTitle>
          {mode !== 'delete' && (
            // TODO: ボランティア情報変更画面に遷移
            // ボランティア情報を変更ボタン
            <Link
              href={{
                pathname: '/volunteerInformation',
                query: { id: volunteerdata.volunteer_id, mode: 'update' },
              }}
              className='text-primary-500 hover:text-primary-700 underline text-small md:text-normal'
            >
              <EditIcon className='cursor-pointer m-1 text-small md:text-h3' />
              ボランティア情報を変更
            </Link>
          )}
        </div>
        <ErrorBox errorText={errorMessage} />
        <div className='flex flex-row gap-[20px] justify-between'>
          <div className='flex flex-col gap-[20px]'>
            {/* 写真 */}
            <InputLabel label='写真' required={false} />
            <img
              src={volunteerdata.photo}
              className='w-[200px] h-[200px] rounded-[10px] object-cover'
            />
          </div>
        </div>

        <div className='flex flex-wrap justify-between gap-[20px]'>
          <div className='flex flex-col gap-[20px] max-w-[400px]'>
            {/* ボランティアID */}
            <CustomTextField
              label='ボランティアID'
              value={volunteerdata.volunteer_id}
              readonly
              displayHelp={false}
              onChange={(e) => { }}
            />
            {/* 氏名 */}
            <CustomTextField
              label='氏名'
              value={volunteerdata.volunteer_name}
              readonly
              displayHelp={false}
              onChange={(e) => { }}
            />
            {/* 生年月日 */}
            <CustomTextField
              label='生年月日'
              value={volunteerdata.date_of_birth}
              readonly
              displayHelp={false}
              onChange={(e) => { }}
            />
            {/* 性別 */}
            <CustomTextField
              label='性別'
              value={volunteerdata.sex}
              readonly
              displayHelp={false}
              onChange={(e) => { }}
            />
            {/* 居住地（国） */}
            <div className='flex flex-row gap-[16px]'>
              <CustomTextField
                label='居住地'
                value={volunteerdata.residence_country}
                readonly
                displayHelp={false}
                onChange={(e) => { }}
              />
              {/* 居住地（都道府県） */}
              <CustomTextField
                label='都道府県'
                value={volunteerdata.residence_prefecture}
                readonly
                displayHelp={false}
                onChange={(e) => { }}
              />
            </div>
            {/* 電話番号 */}
            <CustomTextField
              label='電話番号'
              value={volunteerdata.telephone_number}
              readonly
              displayHelp={false}
              onChange={(e) => { }}
            />
            {/* メールアドレス */}
            <CustomTextField
              label='メールアドレス'
              value={volunteerdata.mailaddress}
              readonly
              displayHelp={false}
              onChange={(e) => { }}
            />
          </div>
          <div className='flex flex-col gap-[20px] max-w-[400px]'>
            {/* 服のサイズ */}
            <CustomTextField
              label='服のサイズ'
              value={volunteerdata.clothes_size}
              readonly
              displayHelp={false}
              onChange={(e) => { }}
            />
            {/* 障碍タイプ */}
            <label htmlFor='disType'>補助が可能な障碍タイプ</label>
            <div className='flex flex-row gap-[16px] justify-start'>
              {volunteerdata.dis_type_id?.map((dis_type_id) => (
                <OriginalCheckbox
                  id='disType'
                  key={dis_type_id}
                  label={dis_type_id}
                  value={dis_type_id}
                  checked={dis_type_id.length > 0}
                  readonly
                  onChange={(e) => { }}
                />
              ))}
            </div>
            {/* 資格情報 */}
            <label htmlFor='qualHold'>資格情報</label>
            <div className='flex flex-row gap-[16px] justify-start'>
              {volunteerdata.qualHold?.map((qualHold) => (
                <div id='qualHold' key={qualHold}>
                  <p className='text-secondaryText'>{qualHold}</p>
                </div>
              ))}
            </div>
            <label htmlFor='language'>言語</label>
            {volunteerdata.language?.map((language: any) => (
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
          <div className='flex flex-row gap-[16px] flex-wrap'>
            曜日指定
            <OriginalCheckbox
              id='anyday'
              label='祝日は可'
              value=''
              checked={getDayOfWeekBool(volunteerdata.day_of_week, 7) || false}
              readonly
              onChange={(e) => { }}
            />
            <OriginalCheckbox
              id='sunday'
              label='日曜日'
              value=''
              checked={getDayOfWeekBool(volunteerdata.day_of_week, 0) || false}
              readonly
              onChange={(e) => { }}
            />
            <OriginalCheckbox
              id='monday'
              label='月曜日'
              value=''
              checked={getDayOfWeekBool(volunteerdata.day_of_week, 1) || false}
              readonly
              onChange={(e) => { }}
            />
            <OriginalCheckbox
              id='tuesday'
              label='火曜日'
              value=''
              checked={getDayOfWeekBool(volunteerdata.day_of_week, 2) || false}
              readonly
              onChange={(e) => { }}
            />
            <OriginalCheckbox
              id='wednesday'
              label='水曜日'
              value=''
              checked={getDayOfWeekBool(volunteerdata.day_of_week, 3) || false}
              readonly
              onChange={(e) => { }}
            />
            <OriginalCheckbox
              id='thursday'
              label='木曜日'
              value=''
              checked={getDayOfWeekBool(volunteerdata.day_of_week, 4) || false}
              readonly
              onChange={(e) => { }}
            />
            <OriginalCheckbox
              id='friday'
              label='金曜日'
              value=''
              checked={getDayOfWeekBool(volunteerdata.day_of_week, 5) || false}
              readonly
              onChange={(e) => { }}
            />
            <OriginalCheckbox
              id='saturday'
              label='土曜日'
              value=''
              checked={getDayOfWeekBool(volunteerdata.day_of_week, 6) || false}
              readonly
              onChange={(e) => { }}
            />
            <OriginalCheckbox
              id='any'
              label='相談可能'
              value=''
              checked={getDayOfWeekBool(volunteerdata.day_of_week, 8) || false}
              readonly
              onChange={(e) => { }}
            />
          </div>
          {/* 参加可能時間帯 */}
          <div className='text-h3 font-bold my-2'>参加しやすい時間帯</div>
          <div className='flex flex-col gap-[16px]'>
            時間帯指定
            <OriginalCheckbox
              id='anytime'
              label='相談可能'
              value=''
              checked={getTimeZoneBool(volunteerdata.time_zone, 7) || false}
              readonly
              onChange={(e) => { }}
            />
            <OriginalCheckbox
              id='earlymorning'
              label='早朝　 06:00〜08:00'
              value=''
              checked={getTimeZoneBool(volunteerdata.time_zone, 0) || false}
              readonly
              onChange={(e) => { }}
            />
            <OriginalCheckbox
              id='morning'
              label='午前　 08:00〜12:00'
              value=''
              checked={getTimeZoneBool(volunteerdata.time_zone, 1) || false}
              readonly
              onChange={(e) => { }}
            />
            <OriginalCheckbox
              id='afternoon'
              label='午後　 12:00〜16:00'
              value=''
              checked={getTimeZoneBool(volunteerdata.time_zone, 2) || false}
              readonly
              onChange={(e) => { }}
            />
            <OriginalCheckbox
              id='night'
              label='夜　　 16:00〜20:00'
              value=''
              checked={getTimeZoneBool(volunteerdata.time_zone, 3) || false}
              readonly
              onChange={(e) => { }}
            />
          </div>
        </div>
        <div className='mx-auto mt-[40px] flex flex-col gap-[8px]'>
          <div className='flex flex-row justify-between items-center'>
            <div className='flex'>
              {/* すべてトグルボタン */}
              <Tab
                number={0}
                isActive={activeTab === 0}
                onClick={handleTabChange}
                rounded='rounded-l'
              >
                全て
              </Tab>
              {/* 公式大会トグルボタン */}
              <Tab
                number={1}
                isActive={activeTab === 1}
                onClick={handleTabChange}
                rounded='rounded-none'
              >
                公式
              </Tab>
              {/* 非公式大会トグルボタン */}
              <Tab
                number={2}
                isActive={activeTab === 2}
                onClick={handleTabChange}
                rounded='rounded-r'
              >
                非公式
              </Tab>
            </div>
            {mode !== 'delete' && (
              <Link
                className='text-primary-500 hover:text-primary-700 underline text-small md:text-normal'
                href={{
                  // TODO: ボランティア履歴情報登録画面の正規URLに変更
                  pathname: '/volunteerHistoriesInformationDelete',
                  query: { id: volunteerdata.volunteer_id },
                }}
              >
                履歴の削除
              </Link>
            )}
          </div>
          <div className='w-screen flex justify-between items-center'>
            <CustomTable>
              <CustomThead>
                <CustomTr>
                  <CustomTh colSpan={17} rowSpan={1}>
                    ボランティア参加履歴
                  </CustomTh>
                </CustomTr>
                <CustomTr>
                  <CustomTh colSpan={1} rowSpan={2}>
                    大会名/イベント名
                  </CustomTh>
                  <CustomTh colSpan={2}>開催期間</CustomTh>
                  <CustomTh colSpan={1} rowSpan={2}>
                    役割
                  </CustomTh>
                  <CustomTh colSpan={1} rowSpan={2}>
                    AD
                  </CustomTh>
                  <CustomTh colSpan={8} rowSpan={1}>
                    参加日
                  </CustomTh>
                </CustomTr>
                <CustomTr>
                  <CustomTh>開始日</CustomTh>
                  <CustomTh>終了日</CustomTh>
                  <CustomTh>祝日</CustomTh>
                  <CustomTh>日曜</CustomTh>
                  <CustomTh>月曜</CustomTh>
                  <CustomTh>火曜</CustomTh>
                  <CustomTh>水曜</CustomTh>
                  <CustomTh>木曜</CustomTh>
                  <CustomTh>金曜</CustomTh>
                  <CustomTh>土曜</CustomTh>
                </CustomTr>
              </CustomThead>
              {/* ボランティア参加履歴一覧テーブル明細表示 */}
              <CustomTbody>
                {volunteerHistoriesdata.map(
                  (volunteerHistoriesdata) =>
                    (volunteerHistoriesdata.tourn_type == activeTab || activeTab == 0) && (
                      <CustomTr key={volunteerHistoriesdata.tourn_name}>
                        {/* 大会名/イベント名 */}
                        <CustomTd align='center'>
                          <Link
                            className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                            href={{
                              pathname: '/tournamentRef',
                              query: { tournId: volunteerHistoriesdata.tourn_id },
                            }}
                            rel='noopener noreferrer'
                            target='_blank'
                          >
                            {volunteerHistoriesdata.tourn_name}
                          </Link>
                        </CustomTd>
                        {/* 開催開始日 */}
                        <CustomTd align='center'>{volunteerHistoriesdata.event_start_date}</CustomTd>
                        {/* 開催終了日 */}
                        <CustomTd align='center'>{volunteerHistoriesdata.event_end_date}</CustomTd>
                        {/* 役割 */}
                        <CustomTd align='center'>{volunteerHistoriesdata.role}</CustomTd>
                        {/* AD */}
                        <CustomTd align='center'>{volunteerHistoriesdata.ad}</CustomTd>
                        {/* 祝日 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 7) && (
                            <p className='text-small'>可</p>
                          )}
                        </CustomTd>
                        {/* 日曜 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 0) && (
                            <p className='text-small'>◯</p>
                          )}
                        </CustomTd>
                        {/* 月曜 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 1) && (
                            <p className='text-small'>◯</p>
                          )}
                        </CustomTd>
                        {/* 火曜 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 2) && (
                            <p className='text-small'>◯</p>
                          )}
                        </CustomTd>
                        {/* 水曜 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 3) && (
                            <p className='text-small'>◯</p>
                          )}
                        </CustomTd>
                        {/* 木曜 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 4) && (
                            <p className='text-small'>◯</p>
                          )}
                        </CustomTd>
                        {/* 金曜 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 5) && (
                            <p className='text-small'>◯</p>
                          )}
                        </CustomTd>
                        {/* 土曜 */}
                        <CustomTd align='center'>
                          {getDayOfWeekBool(volunteerHistoriesdata.day_of_week, 6) && (
                            <p className='text-small'>◯</p>
                          )}
                        </CustomTd>
                      </CustomTr>
                    ),
                )}
              </CustomTbody>
            </CustomTable>
          </div>
        </div>
        <div className='flex flex-row mb-1 gap-[16px] justify-center'>
          {/* 戻るボタン */}
          <CustomButton
            buttonType='white-outlined'
            className='text-normal h-12 w-72 mb-6'
            onClick={() => {
              router.back();
              // ボランティア情報参照画面に遷移
            }}
          >
            戻る
          </CustomButton>
          {/* 削除ボタン */}
          {mode === 'delete' && (
            <CustomButton
              buttonType='primary'
              className='text-secondaryText text-normal h-12 w-72 mr-1 mb-6'
              onClick={() => {
                // TODO: 削除処理
                /**
                 * 以下のテーブルに登録されている当該ボランティアのデータの「削除フラグ」に"1"を設定する。
                 * 「ボランティアテーブル」
                 * 「ボランティア履歴テーブル」
                 * 「ボランティアアベイラブルテーブル」
                 * 「ボランティア保有資格情報テーブル」
                 * 「ボランティア言語レベルテーブル」
                 * 「ボランティア支援可能障碍タイプテーブル」
                 */
                // TODO: エラーハンドリングを実装
                // 削除に失敗した場合、
                // 以下のメッセージをシステムエラーとして赤文字で表示し、以降の処理は行わない。
                // setErrorMessage(['ユーザー情報の登録に失敗しました。ユーザーサポートにお問い合わせください。']);

                // 管理画面に遷移
                router.push('/tournamentSearch'); //大会検索画面に遷移する20240222
              }}
            >
              削除
            </CustomButton>
          )}
        </div>
      </main>
    </div>
  );
}
