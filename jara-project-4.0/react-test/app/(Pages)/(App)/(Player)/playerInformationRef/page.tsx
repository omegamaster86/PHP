// 機能名: 選手情報参照画面・選手情報削除画面
'use client';

// Reactおよび関連モジュールのインポート
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/app/lib/axios';
// コンポーネントのインポート
import {
  CustomButton,
  CustomTable,
  CustomThead,
  CustomTbody,
  CustomTr,
  CustomTh,
  CustomTd,
  Tab,
  Label,
  ErrorBox,
} from '@/app/components';
import AddIcon from '@mui/icons-material/Add';
import { RaceResultRecordsResponse, PlayerInformationResponse } from '@/app/types';

// 選手情報参照画面
export default function PlayerInformationRef() {
  // Next.jsのRouterを利用
  const router = useRouter();
  // クエリパラメータを取得する
  const searchParams = useSearchParams();
  // modeの値を取得 delete
  const mode = searchParams.get('mode');
  switch (mode) {
    case 'delete':
      break;
    default:
      break;
  }

  // 選手IDを取得
  const playerId = searchParams.get('playerId')?.toString() || searchParams.get('player_id')?.toString() || '';
  switch (playerId) {
    case '':
      break;
    default:
      break;
  }
  const [player_id, setPlayerId] = useState<any>({
    player_id: playerId,
  });


  // タブ切り替え用のステート
  const [activeTab, setActiveTab] = useState<number>(0);
  const handleTabChange = (tabNumber: number) => {
    setActiveTab(tabNumber);
  };

  // エラーハンドリング用のステート
  const [error, setError] = useState({ isError: false, errorMessage: '' });

  // レース結果情報のデータステート
  const [raceResultRecordsData, setResultRecordsData] = useState([] as RaceResultRecordsResponse[]);

  // 選手情報のデータステート
  const [playerInformation, setplayerInformation] = useState({} as PlayerInformationResponse);

  // 削除ボタンの表示制御用のステート
  const [displayFlg, setDisplayFlg] = useState<boolean>(true);

  //削除対象のデータをまとめて送信する 20240202
  const [deleteData, setDeleteDatas] = useState({
    playerInformation: playerInformation, //選手情報
    raceResultRecordsData: raceResultRecordsData //選手の出漕結果情報
  });

  //選手情報削除関数 20240201
  const dataDelete = async () => {
    deleteData.playerInformation = playerInformation;
    deleteData.raceResultRecordsData = raceResultRecordsData;
    const csrf = () => axios.get('/sanctum/csrf-cookie')
    await csrf()
    await axios.post('/deletePlayerData', deleteData)
      .then((res) => {
        console.log(res.data);
        //router.push('/myPage');
      }).catch(error => {
        console.log(error);
      });
  }

  // データ取得用のEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 仮のURL（繋ぎ込み時に変更すること）
        // const playerInf = await axios.get<PlayerInformationResponse>('http://localhost:3100/player',);
        const csrf = () => axios.get('/sanctum/csrf-cookie')
        await csrf()
        const playerInf = await axios.post('/getPlayerInfoData', player_id);
        console.log(playerInf.data.result);
        //サイド情報のデータ変換
        const sideList = playerInf.data.result.side_info.split('');
        for (let i = 0; i < 4; i++) {
          if (sideList[i] == "1") {
            sideList[i] = true;
          } else {
            sideList[i] = false;
          }
        }
        setplayerInformation({
          player_id: playerInf.data.result.player_id,
          jara_player_id: playerInf.data.result.jara_player_id,
          player_name: playerInf.data.result.player_name,
          date_of_birth: playerInf.data.result.date_of_birth,
          sexName: playerInf.data.result.sex_name,
          sex_id: playerInf.data.result.sex,
          height: playerInf.data.result.height,
          weight: playerInf.data.result.weight,
          side_info: sideList,
          birthCountryName: playerInf.data.result.birthCountryName,
          birth_country: playerInf.data.result.birth_country,
          birthPrefectureName: playerInf.data.result.birthPrefectureName,
          birth_prefecture: playerInf.data.result.birth_prefecture,
          residenceCountryName: playerInf.data.result.residenceCountryName,
          residence_country: playerInf.data.result.residence_country,
          residencePrefectureName: playerInf.data.result.residencePrefectureName,
          residence_prefecture: playerInf.data.result.residence_prefecture,
          photo: playerInf.data.result.photo,
        });
        // const response = await axios.get<RaceResultRecordsResponse[]>('http://localhost:3100/raceResultRecords',);
        const response = await axios.post('/getRaceResultRecordsData', player_id);
        console.log(response.data.result);
        setResultRecordsData(response.data.result);
      } catch (error: any) {
        setError({ isError: true, errorMessage: 'API取得エラー:' + error.message });
      }
    };
    fetchData();
  }, []);

  const headerArray = [
    '大会名',
    '公式／非公式',
    '開催日',
    '団体所属',
    'レースNo.',
    '種目',
    'レース名',
    '組別',
    'クルー名',
    '順位',
    '500m',
    '1000m',
    '1500m',
    '2000m',
    '最終タイム',
    'ストロークレート（平均）',
    '500mlapストロークレート',
    '1000mlapストロークレート',
    '1500mlapストロークレート',
    '2000mlapストロークレート',
    '心拍数/分（平均）',
    '500mlap心拍数/分',
    '1000mlap心拍数/分',
    '1500mlap心拍数/分',
    '2000mlap心拍数/分',
    '立ち合い有無',
    'エルゴ体重',
    '選手身長（出漕時点）',
    '選手体重（出漕時点）',
    'シート番号（出漕時点）',
    '出漕結果記録名',
    '発艇日時',
    '2000m地点風速',
    '2000m地点風向',
    '1000m地点風速',
    '1000m地点風向',
  ];

  return (
    <div>
      <main>
        <div className='flex flex-col pt-[40px] pb-[60px] gap-[50px] md:w-[1000px] sm: w-[600px]'>
          <ErrorBox errorText={error.isError ? [error.errorMessage] : []} />
          <div className='bg-gradient-to-r from-primary-900 via-primary-500 to-primary-900 p-4 '>
            <div className='flex flex-row gap-[40px]'>
              <div>
                {/* 写真 */}
                <img
                  src={playerInformation.photo}
                  width={200}
                  height={200}
                  alt='Random'
                  className='rounded-full'
                />
              </div>
              <div className='flex flex-col gap-[10px]'>
                <div className='flex flex-col gap-[10px]'>
                  {/* 選手名 */}
                  <Label
                    label={playerInformation.player_name}
                    textColor='white'
                    textSize='h3'
                  ></Label>
                  <div className='flex flex-row gap-[10px]'>
                    <div className='flex flex-row gap-[10px]'>
                      {/* 選手ID */}
                      <div className='text-gray-40 text-caption1'>選手ID</div>
                      <Label
                        label={playerInformation.player_id?.toString()}
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                    </div>
                    <div className='flex flex-row gap-[10px]'>
                      {/* 既存選手ID */}
                      <div className='text-gray-40 text-caption1'>エントリーシステムの選手ID</div>
                      <Label
                        label={playerInformation.jara_player_id ?? ''}
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col gap-[10px]'>
                  <Label
                    label='プロフィール'
                    textColor='white'
                    textSize='small'
                    isBold={true}
                  ></Label>
                  <div className='flex flex-col gap-[5px]'>
                    <div className='flex flex-row gap-[20px]'>
                      <div className='flex flex-col gap-[5px]'>
                        <div className='flex flex-row'>
                          {/* 性別 */}
                          <div className='text-gray-40 text-caption1'>性別　</div>
                          <Label
                            label={playerInformation.sexName}
                            textColor='white'
                            textSize='caption1'
                          ></Label>
                        </div>
                        <div className='flex flex-row'>
                          {/* 生年月日 */}
                          <div className='text-gray-40 text-caption1'>誕生　</div>
                          <Label
                            label={playerInformation.date_of_birth}
                            textColor='white'
                            textSize='caption1'
                          ></Label>
                        </div>
                      </div>
                      <div className='flex flex-col gap-[5px]'>
                        <div className='flex flex-row'>
                          {/* 身長 */}
                          <div className='text-gray-40 text-caption1'>身長　</div>
                          <Label
                            label={playerInformation.height?.toString()} // 身長は数値なのでtoString()で文字列に変換
                            textColor='white'
                            textSize='caption1'
                          ></Label>
                          <div className='text-gray-40 text-caption1'>　cm</div>
                        </div>
                        <div className='flex flex-row'>
                          {/* 体重 */}
                          <div className='text-gray-40 text-caption1'>体重　</div>
                          <Label
                            label={playerInformation.weight?.toString() + ' '} // 体重は数値なのでtoString()で文字列に変換
                            textColor='white'
                            textSize='caption1'
                          ></Label>
                          <div className='text-gray-40 text-caption1'>　kg</div>
                        </div>
                      </div>
                    </div>
                    <div className='flex flex-row'>
                      {/* 出身地（国） */}
                      <div className='text-gray-40 text-caption1'>出身　</div>
                      <Label
                        label={playerInformation.birthCountryName}
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                      {/* 出身地（都道府県） */}
                      <div
                        className={
                          !playerInformation.birthPrefectureName ||
                          playerInformation.birthPrefectureName === ''
                            ? 'hidden'
                            : ''
                        }
                      >
                        <Label
                          label={'　/　' + playerInformation.birthPrefectureName}
                          textColor='white'
                          textSize='caption1'
                        ></Label>
                      </div>
                    </div>
                    <div className='flex flex-row'>
                      <div className='text-gray-40 text-caption1'>居住　</div>
                      {/* 居住地（国） */}
                      <Label
                        label={playerInformation.residenceCountryName}
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                      {/* 居住地（都道府県） */}
                      <div
                        className={
                          !playerInformation.residencePrefectureName ||
                          playerInformation.residencePrefectureName === ''
                            ? 'hidden'
                            : ''
                        }
                      >
                        <Label
                          label={'　/　' + playerInformation.residencePrefectureName}
                          textColor='white'
                          textSize='caption1'
                        ></Label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col gap-[10px]'>
                  {/* サイド情報 */}
                  <Label
                    label='サイド情報'
                    textColor='white'
                    textSize='small'
                    isBold={true}
                  ></Label>
                  <div className='flex flex-row justify-start gap-[10px]'>
                    <div
                      className={`text-center px-[12px] py-[8px] rounded-full ${
                        playerInformation.side_info?.at(0)
                          ? 'border border-secondary-500 text-secondary-500'
                          : 'border border-gray-30 text-white'
                      }`}
                    >
                      S（ストロークサイド）
                    </div>
                    <div
                      className={`text-center px-[12px] py-[8px] rounded-full ${
                        playerInformation.side_info?.at(1)
                          ? 'border border-secondary-500 text-secondary-500'
                          : 'border border-gray-30 text-white'
                      }`}
                    >
                      B（バウサイド）
                    </div>
                  </div>
                  <div className='flex flex-row justify-start gap-[10px]'>
                    <div
                      className={`text-center px-[12px] py-[8px] rounded-full ${
                        playerInformation.side_info?.at(2)
                          ? 'border border-secondary-500 text-secondary-500'
                          : 'border border-gray-30 text-white'
                      }`}
                    >
                      X（スカル）
                    </div>
                    <div
                      className={`text-center px-[12px] py-[8px] rounded-full ${
                        playerInformation.side_info?.at(3)
                          ? 'border border-secondary-500 text-secondary-500'
                          : 'border border-gray-30 text-white'
                      }`}
                    >
                      C（コックス）
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* 選手情報表示 */}
          <div className='text-lg mb-4'>
            {/* 出漕結果情報一覧表示 */}
            <div className='mb-4'>
              <div className='flex justify-between items-center'>
                <div className='mb-1 font-bold'>出漕結果情報一覧</div>
                {/* 個人記録の追加・編集<ボタン */}
                {mode === 'edit' && (
                  <CustomButton
                    buttonType='primary-outlined'
                    onClick={() => {
                      router.push('/playerRaceResultRegister');
                    }}
                    className='flex flex-row justify-center gap-[4px] w-full'
                  >
                    <AddIcon />
                    <div> 個人記録の追加・編集</div>
                  </CustomButton>
                )}
              </div>
              {/* タブ切り替え */}
              <div className='container mx-auto mt-8'>
                <div className='flex'>
                  <Tab
                    number={0}
                    isActive={activeTab === 0}
                    onClick={handleTabChange}
                    rounded='rounded-l'
                  >
                    全て
                  </Tab>
                  <Tab
                    number={2}
                    isActive={activeTab === 2}
                    onClick={handleTabChange}
                    rounded='rounded-none'
                  >
                    公式
                  </Tab>
                  <Tab
                    number={1}
                    isActive={activeTab === 1}
                    onClick={handleTabChange}
                    rounded='rounded-r'
                  >
                    非公式
                  </Tab>
                </div>
              </div>
            </div>
            <div className='overflow-auto h-[467px]'>
              {/* 出漕結果情報一覧テーブル表示 */}
              <CustomTable>
                {/* テーブルヘッダー */}
                <CustomThead>
                  <CustomTr>
                    {headerArray.map((header, index) => (
                      <CustomTh align='left' key={index}>
                        {header}
                      </CustomTh>
                    ))}
                  </CustomTr>
                </CustomThead>
                {/* テーブルボディー */}
                <CustomTbody>
                  {raceResultRecordsData.map((row, index) => (
                    <CustomTr
                      key={index}
                      isHidden={!(row.official + 1 === activeTab || activeTab === 0)}
                    >
                      {/* 大会名 */}
                      <CustomTd transitionDest={`/tournamentRef?tournId=${row.tourn_id}`}>
                        {row.tourn_name}
                      </CustomTd>
                      {/* 公式／非公式 */}
                      <CustomTd>{row.official === 0 ? '非公式' : '公式'}</CustomTd>
                      {/* 開催日 */}
                      <CustomTd>{row.eventStartDate}</CustomTd>
                      {/* 団体所属 */}
                      <CustomTd>{row.org_name}</CustomTd>
                      {/* レースNo. */}
                      <CustomTd>{row.race_number}</CustomTd>
                      {/* 種目 */}
                      <CustomTd>{row.event_name}</CustomTd>
                      {/* レース名 */}
                      <CustomTd>{row.race_name}</CustomTd>
                      {/* 組別 */}
                      <CustomTd>{row.by_group}</CustomTd>
                      {/* クルー名 */}
                      <CustomTd>{row.crew_name}</CustomTd>
                      {/* 順位 */}
                      <CustomTd>{row.rank}</CustomTd>
                      {/* 500mラップタイム */}
                      <CustomTd>{row.laptime_500m}</CustomTd>
                      {/* 1000mラップタイム */}
                      <CustomTd>{row.laptime_1000m}</CustomTd>
                      {/* 1500mラップタイム */}
                      <CustomTd>{row.laptime_1500m}</CustomTd>
                      {/* 2000mラップタイム */}
                      <CustomTd>{row.laptime_2000m}</CustomTd>
                      {/* 最終タイム */}
                      <CustomTd>{row.final_time}</CustomTd>
                      {/* ストロークレート（平均） */}
                      <CustomTd>{row.stroke_rate_avg}</CustomTd>
                      {/* 500mlapストロークレート */}
                      <CustomTd>{row.stroke_rat_500m}</CustomTd>
                      {/* 1000mlapストロークレート */}
                      <CustomTd>{row.stroke_rat_1000m}</CustomTd>
                      {/* 1500mlapストロークレート */}
                      <CustomTd>{row.stroke_rat_1500m}</CustomTd>
                      {/* 2000mlapストロークレート */}
                      <CustomTd>{row.stroke_rat_2000m}</CustomTd>
                      {/* 心拍数/分（平均） */}
                      <CustomTd>{row.heart_rate_avg}</CustomTd>
                      {/* 500mlap心拍数/分 */}
                      <CustomTd>{row.heart_rate_500m}</CustomTd>
                      {/* 1000mlap心拍数/分 */}
                      <CustomTd>{row.heart_rate_1000m}</CustomTd>
                      {/* 1500mlap心拍数/分 */}
                      <CustomTd>{row.heart_rate_1500m}</CustomTd>
                      {/* 2000mlap心拍数/分 */}
                      <CustomTd>{row.heart_rate_2000m}</CustomTd>
                      {/* 立ち合い有無 */}
                      <CustomTd>{row.attendance}</CustomTd>
                      {/* エルゴ体重 */}
                      <CustomTd>{row.ergo_weight}</CustomTd>
                      {/* 選手身長（出漕時点） */}
                      <CustomTd>{row.player_height}</CustomTd>
                      {/* 選手体重（出漕時点） */}
                      <CustomTd>{row.player_weight}</CustomTd>
                      {/* シート番号（出漕時点） */}
                      <CustomTd>{row.seat_name}</CustomTd>
                      {/* 出漕結果記録名 */}
                      <CustomTd>{row.race_result_record_name}</CustomTd>
                      {/* 登録日時 */}
                      <CustomTd>{row.registered_time}</CustomTd>
                      {/* 2000m地点風速 */}
                      <CustomTd>{row.wind_speed_2000m_point}</CustomTd>
                      {/* 2000m地点風向 */}
                      <CustomTd>{row.wind_direction_2000m_point}</CustomTd>
                      {/* 1000m地点風速 */}
                      <CustomTd>{row.wind_speed_1000m_point}</CustomTd>
                      {/* 1000m地点風向 */}
                      <CustomTd>{row.wind_direction_1000m_point}</CustomTd>
                    </CustomTr>
                  ))}
                </CustomTbody>
              </CustomTable>
            </div>
          </div>
          <div className='flex flex-row justify-center gap-[16px] my-[30px]'>
            {/* 戻るボタン */}
            <CustomButton
              buttonType='primary-outlined'
              className='w-[280px] m-auto'
              onClick={() => {
                router.back();
              }}
            >
              戻る
            </CustomButton>
            {/* 削除ボタン */}
            {mode === 'delete' && (
              <CustomButton
                buttonType='primary'
                className={`w-[280px] m-auto ${displayFlg ? '' : 'hidden'}`}
                onClick={() => {
                  setDisplayFlg(false);
                  window.confirm('選手情報を削除します。よろしいですか？') ? ( //okを押したら下の三項演算子に遷移 キャンセルを押したらflagをtrueにしてそのまま
                    window.confirm('選手情報の削除が完了しました。') ?
                      //router.push('/myPage') : setDisplayFlg(true)
                      dataDelete() : setDisplayFlg(true) //okを押したら削除データをpostしてマイページに遷移する キャンセルを押したらflagをtrueにしてそのまま
                  ) : setDisplayFlg(true);
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
