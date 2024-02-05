// 機能名: 大会情報参照画面・大会情報削除画面
'use client';

// Reactおよび関連モジュールのインポート
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
// コンポーネントのインポート
import {
  ErrorBox,
  CustomButton,
  Label,
  CustomTable,
  CustomThead,
  CustomTr,
  CustomTh,
  CustomTd,
  CustomTitle,
  CustomTbody,
} from '@/app/components';
import { Tournament, Race, UserResponse } from '@/app/types';
import Link from 'next/link';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { ROLE } from '@/app/utils/consts';

// 選手情報参照画面
export default function PlayerInformationRef() {
  // フック
  const router = useRouter();

  // TODO: ユーザーの権限を取得する処理をuseEffectに記述すること
  const [userType, setUserType] = useState('');

  // ページ全体のエラーハンドリング用のステート
  let isError = false;

  // クエリパラメータを取得する
  const searchParams = useSearchParams();
  // modeの値を取得
  const mode = searchParams.get('mode');
  switch (mode) {
    case 'delete':
      break;
    default:
      break;
  }

  const tournId = searchParams.get('tournId')?.toString() || '';
  // tournIdの値を取得
  switch (tournId) {
    case '':
      isError = true;
      break;
    default:
      break;
  }

  // フォームデータを管理する状態
  const [tableData, setTableData] = useState<Race[]>([]);

  // 大会情報を管理する状態
  const [tournamentFormData, setTournamentFormData] = useState<Tournament>({
    tournId: '',
    entrysystemRaceId: '',
    tournName: '',
    tournType: '',
    tournTypeName: '',
    sponsorOrgId: '',
    sponsorOrgName: '',
    eventStartDate: '',
    eventEndDate: '',
    venueId: '',
    venueIdName: '',
    venueName: '',
    tournUrl: '',
    tournInfoFailePath: '',
  });

  // APIの呼び出し実績の有無を管理する状態
  const isApiFetched = useRef(false);

  // エラーハンドリング用のステート
  const [error, setError] = useState({ isError: false, errorMessage: '' });

  // データ取得
  useEffect(() => {
    // StrictModeの制約回避のため、APIの呼び出し実績の有無をuseEffectの中に記述
    if (!isApiFetched.current) {
      const fetchData = async () => {
        const userResponse = await axios.get<UserResponse>('http://localhost:3100/user');
        setUserType(userResponse.data.userType);
        // TODO: tournIdを元に大会情報を取得する処理の置き換え
        const tournamentResponse = await axios.get<Tournament>('http://localhost:3100/tournament');
        setTournamentFormData(tournamentResponse.data);
        // TODO: tournIdを元にレース情報を取得する処理の置き換え
        const raceResponse = await axios.get<Race[]>('http://localhost:3100/race');
        raceResponse.data.map((data) => {
          setTableData((prevData) => [...prevData, { ...data }]);
        });
      };
      fetchData();
      isApiFetched.current = true;
    }
  }, []);

  // エラーがある場合はエラーメッセージを表示
  if (isError) {
    return <div>404エラー</div>;
  }
  return (
    <div>
      <main>
        <div className='flex flex-col pt-[40px] pb-[60px] gap-[50px] md:w-[1000px] sm: w-[600px]'>
          <ErrorBox errorText={error.isError ? [error.errorMessage] : []} />
          <div className='flex flex-row justify-between items-center '>
            {/* 画面名 */}
            <CustomTitle isCenter={false} displayBack>
              {mode === 'delete' && '大会情報削除'}
              {mode !== 'delete' && '大会情報'}
            </CustomTitle>
          </div>
          <div className='bg-gradient-to-r from-primary-900 via-primary-500 to-primary-900 p-4 '>
            <div className='flex flex-col gap-[10px]'>
              <div className='flex flex-col gap-[30px]'>
                <div className='flex flex-row justify-between'>
                  <Label
                    label={tournamentFormData.tournName}
                    textColor='white'
                    textSize='h2'
                  ></Label>
                  {/* 大会要項ダウンロードボタン */}
                  <CustomButton
                    buttonType='white-outlined'
                    className='w-[220px] text-normal text-white hover:text-primary-100 hover:bg-transparent hover:border-primary-100'
                    onClick={() => {
                      // TODO: 大会要項のPDFをダウンロードする処理
                    }}
                  >
                    <FileDownloadOutlinedIcon className='text-[16px] mr-1 hover:text-primary-100 '></FileDownloadOutlinedIcon>
                    大会要項ダウンロード
                  </CustomButton>
                </div>
                <div className='flex flex-row'>
                  {/* 大会個別URL */}
                  <div className='text-gray-40 text-caption1 w-[100px]'>大会URL</div>
                  <Link
                    href={tournamentFormData.tournUrl}
                    rel='noopener noreferrer'
                    target='_blank'
                    className='text-white text-caption1 underline hover:text-primary-100'
                  >
                    {tournamentFormData.tournUrl}
                  </Link>
                </div>
                <div className='flex flex-col gap-[12px]'>
                  <Label label='開催情報' textColor='white' textSize='small' isBold={true}></Label>
                  <div className='flex flex-col gap-[5px]'>
                    <div className='flex flex-row gap-[20px]'>
                      <div className='flex flex-col gap-[5px]'>
                        <div className='flex flex-row'>
                          {/* 開催開始年月日 */}
                          <div className='text-gray-40 text-caption1 w-[100px]'>開催開始年月日</div>
                          <Label
                            label={tournamentFormData.eventStartDate}
                            textColor='white'
                            textSize='caption1'
                          ></Label>
                        </div>
                        <div className='flex flex-row'>
                          {/* 開催終了年月日 */}
                          <div className='text-gray-40 text-caption1 w-[100px]'>開催終了年月日</div>
                          <Label
                            label={tournamentFormData.eventEndDate}
                            textColor='white'
                            textSize='caption1'
                          ></Label>
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-row'>
                      {/* 開催場所 */}
                      <div className='text-gray-40 text-caption1 w-[100px]'>開催場所</div>
                      <Label
                        label={tournamentFormData.venueIdName}
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col gap-[10px]'>
                  <Label label='主催団体' textColor='white' textSize='small' isBold={true}></Label>
                  <div className='flex flex-col gap-[5px]'>
                    <div className='flex flex-row'>
                      {/* 主催団体名 */}
                      <div className='text-gray-40 text-caption1 w-[100px]'>名前</div>
                      <Label
                        label={tournamentFormData.sponsorOrgName}
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                    </div>
                  </div>
                  <div className='flex flex-row'>
                    {/* 主催団体ID */}
                    <div className='text-gray-40 text-caption1 w-[100px]'>ID</div>
                    <Label
                      label={tournamentFormData.sponsorOrgId}
                      textColor='white'
                      textSize='caption1'
                    ></Label>
                  </div>
                </div>
                <div className='flex flex-row gap-[20px]'>
                  <div className='flex flex-row gap-[10px]'>
                    {/* 大会ID */}
                    <div className='text-gray-40 text-caption1'>大会ID：</div>
                    <Label
                      label={tournamentFormData.tournId?.toString() as string}
                      textColor='white'
                      textSize='caption1'
                    ></Label>
                  </div>
                  {(userType === ROLE.SYSTEM_ADMIN ||
                    userType === ROLE.GROUP_MANAGER ||
                    userType === ROLE.JARA ||
                    userType === ROLE.PREFECTURE) && (
                    <div className='flex flex-row gap-[10px]'>
                      {/* エントリーシステムの大会ID */}
                      <div className='text-gray-40 text-caption1'>エントリーシステムの大会ID：</div>
                      <Label
                        label={tournamentFormData.entrysystemRaceId}
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* TODO: DPTに仕様を確認すること。 */}
          <div className='text-lg mb-4'>
            <div className='mb-4'>
              <div className='flex justify-between items-center'>
                <div className='font-bold'>開催レース</div>
              </div>
            </div>
            {/* レース一覧テーブル表示 */}
            <CustomTable>
              <CustomThead>
                <CustomTr>
                  <CustomTh align='left'>レースID</CustomTh>
                  <CustomTh align='left'>レース名</CustomTh>
                  <CustomTh align='left'>レースNo.</CustomTh>
                  <CustomTh align='left'>種目</CustomTh>
                  <CustomTh align='left'>組別</CustomTh>
                  <CustomTh align='left'>距離</CustomTh>
                  <CustomTh align='left'>発艇日時</CustomTh>
                </CustomTr>
              </CustomThead>
              <CustomTbody>
                {/* レースID */}
                {tableData.map((row, index) => (
                  <CustomTr key={index}>
                    {/* 「出漕結果記録テーブル」に「レーステーブル」.「レースID」と紐づくデータが存在する場合、リンクボタンを表示するかどうかを制御するためにhasHistoryを利用 */}
                    {row.hasHistory && (
                      // TODO: 遷移先のURLは仮置き。置き換えること。
                      <CustomTd
                        transitionDest={'/tournamentRaceResultRef&raceId=' + row.raceId?.toString()}
                      >
                        {row.raceId}
                      </CustomTd>
                    )}
                    {!row.hasHistory && <CustomTd>{row.raceId}</CustomTd>}
                    {row.hasHistory && (
                      // TODO: 遷移先のURLは仮置き。置き換えること。
                      <CustomTd
                        transitionDest={'/tournamentRaceResultRef&raceId=' + row.raceId?.toString()}
                      >
                        {row.raceName}
                      </CustomTd>
                    )}
                    {/* レース名 */}
                    {!row.hasHistory && <CustomTd>{row.raceName}</CustomTd>}
                    {/* レースNo. */}
                    <CustomTd>{row.raceNumber}</CustomTd>
                    {/* 種目 */}
                    <CustomTd>{row.raceTypeName}</CustomTd>
                    {/* 組別 */}
                    <CustomTd>{row.byGroup}</CustomTd>
                    {/* 距離 */}
                    <CustomTd>{row.range}</CustomTd>
                    {/* 発艇日時 */}
                    <CustomTd>{row.startDateTime}</CustomTd>
                  </CustomTr>
                ))}
              </CustomTbody>
            </CustomTable>
          </div>
          <div className='flex flex-row justify-center gap-[40px] m-auto'>
            {/* 戻るボタン */}
            <CustomButton
              buttonType='primary-outlined'
              className='w-[280px]'
              onClick={() => {
                router.back();
              }}
            >
              戻る
            </CustomButton>
            {/* 参照モードかつ、権限がシステム管理者、大会団体管理者の時は表示 */}
            {mode === 'delete' &&
              (userType === ROLE.SYSTEM_ADMIN ||
                userType === ROLE.GROUP_MANAGER ||
                userType === ROLE.JARA ||
                userType === ROLE.PREFECTURE) && (
                // 削除ボタン
                <CustomButton
                  buttonType='primary'
                  className='w-[280px]'
                  onClick={() => {
                    // TODO: 削除ボタン押下イベントの実装
                    const isOk = window.confirm('大会情報を削除します。よろしいですか？');
                    if (!isOk) {
                      // TODO: 削除確認画面でOKボタンが押された場合、テーブルの当該項目に削除フラグを立てる処理の置き換え
                      axios
                        .delete('http://localhost:3100/tournament')
                        .then((response) => {
                          // TODO: 削除完了時の処理の置き換え
                        })
                        .catch((error) => {
                          // TODO: エラーハンドリングの実装の置き換え
                          setError({
                            isError: true,
                            errorMessage:
                              '大会情報の削除に失敗しました。ユーザーサポートにお問い合わせください。',
                          });
                          window.scrollTo(0, 0);
                          return;
                        });
                    }
                  }}
                >
                  削除
                </CustomButton>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}
