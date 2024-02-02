// 機能名: 選手情報参照画面・選手情報削除画面
'use client';

// Reactおよび関連モジュールのインポート
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
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
  if (mode == null) {
    console.log(mode, "aaaaaaaaaaa");
    router.push('/playerInformationRef');
  }
  console.log(mode);

  // タブ切り替え用のステート
  const [activeTab, setActiveTab] = useState<number>(0);
  const handleTabChange = (tabNumber: number) => {
    setActiveTab(tabNumber);
  };

  // エラーハンドリング用のステート
  const [error, setError] = useState({ isError: false, errorMessage: '' });

  // レース結果情報のデータステート
  const [raceResultRecordsData, setResultRecordsData] = useState([] as RaceResultRecordsResponse[]);
  const [raceResultRecordsDatas, setResultRecordsDatas] = useState({} as RaceResultRecordsResponse);

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
    await axios.post('http://localhost:8000/api/deletePlayerData', deleteData)
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
        const playerInf = await axios.get('http://localhost:8000/api/getPlayerInfoData');
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

        playerInformation.playerId = playerInf.data.result.player_id;
        playerInformation.jaraPlayerCode = playerInf.data.result.jara_player_id;
        playerInformation.existPlayerId = playerInf.data.result.player_id;
        playerInformation.playerName = playerInf.data.result.player_name;
        playerInformation.dateOfBirth = playerInf.data.result.date_of_birth;
        playerInformation.sexName = playerInf.data.result.sex_name;
        playerInformation.sexId = playerInf.data.result.sex;
        playerInformation.height = playerInf.data.result.height;
        playerInformation.weight = playerInf.data.result.weight;
        playerInformation.sideInfo = sideList;
        playerInformation.birthCountryName = playerInf.data.result.bir_country_name;
        playerInformation.birthCountryId = playerInf.data.result.birth_country;
        playerInformation.birthPrefectureName = playerInf.data.result.bir_pref_name;
        playerInformation.birthPrefectureId = playerInf.data.result.birth_prefecture;
        playerInformation.residenceCountryName = playerInf.data.result.res_country_name;
        playerInformation.residenceCountryId = playerInf.data.result.residence_country;
        playerInformation.residencePrefectureName = playerInf.data.result.res_pref_name;
        playerInformation.residencePrefectureId = playerInf.data.result.residence_prefecture;
        playerInformation.photo = playerInf.data.result.photo;
        // setplayerInformation(playerInf.data);
        // const response = await axios.get<RaceResultRecordsResponse[]>('http://localhost:3100/raceResultRecords',);
        const response = await axios.get('http://localhost:8000/api/getRaceResultRecordsData');
        console.log(response.data.result);
        for (var i = 0; i < response.data.result.length; i++) {
          console.log(i);
          console.log(response.data.result[i].race_result_record_id);
          raceResultRecordsDatas.raceResultRecordId = response.data.result[i].race_result_record_id as number;
          console.log(raceResultRecordsDatas.raceResultRecordId);
          raceResultRecordsDatas.tournId = response.data.result[i].tourn_id as number;
          raceResultRecordsDatas.tournName = response.data.result[i].tourn_name as string;
          raceResultRecordsDatas.official = response.data.result[i].official as number;
          raceResultRecordsDatas.eventStartDate = "";
          raceResultRecordsDatas.orgName = response.data.result[i].org_name as string;
          raceResultRecordsDatas.raceNumber = response.data.result[i].race_number as number;
          raceResultRecordsDatas.eventName = response.data.result[i].event_name as string;
          raceResultRecordsDatas.raceName = response.data.result[i].race_name as string;
          raceResultRecordsDatas.byGroup = response.data.result[i].by_group as string;
          raceResultRecordsDatas.crewName = response.data.result[i].crew_name as string;
          raceResultRecordsDatas.rank = response.data.result[i].rank as number;
          raceResultRecordsDatas.fiveHundredmLaptime = response.data.result[i].laptime_500m as number;
          raceResultRecordsDatas.tenHundredmLaptime = response.data.result[i].laptime_1000m as number;
          raceResultRecordsDatas.fifteenHundredmLaptime = response.data.result[i].laptime_1500m as number;
          raceResultRecordsDatas.twentyHundredmLaptime = response.data.result[i].laptime_2000m as number;
          raceResultRecordsDatas.finalTime = response.data.result[i].final_time as number;
          raceResultRecordsDatas.strokeRateAvg = response.data.result[i].final_time as number;
          raceResultRecordsDatas.fiveHundredmStrokeRat = response.data.result[i].stroke_rat_500m as number;
          raceResultRecordsDatas.tenHundredmStrokeRat = response.data.result[i].stroke_rat_1000m as number;
          raceResultRecordsDatas.fifteenHundredmStrokeRat = response.data.result[i].stroke_rat_1500m as number;
          raceResultRecordsDatas.twentyHundredmStrokeRat = response.data.result[i].stroke_rat_2000m as number;
          raceResultRecordsDatas.heartRateAvg = response.data.result[i].heart_rate_avg as number;
          raceResultRecordsDatas.fiveHundredmHeartRate = response.data.result[i].heart_rate_500m as number;
          raceResultRecordsDatas.tenHundredmHeartRate = response.data.result[i].heart_rate_1000m as number;
          raceResultRecordsDatas.fifteenHundredmHeartRate = response.data.result[i].heart_rate_1500m as number;
          raceResultRecordsDatas.twentyHundredmHeartRate = response.data.result[i].heart_rate_2000m as number;
          raceResultRecordsDatas.attendance = response.data.result[i].attendance as number;
          raceResultRecordsDatas.ergoWeight = response.data.result[i].ergo_weight as number;
          raceResultRecordsDatas.playerHeight = response.data.result[i].player_height as number;
          raceResultRecordsDatas.playerWeight = response.data.result[i].player_weight as number;
          raceResultRecordsDatas.sheetName = response.data.result[i].seat_name as string;
          raceResultRecordsDatas.raceResultRecordName = response.data.result[i].race_result_record_name as string;
          raceResultRecordsDatas.registeredTime = response.data.result[i].registered_time as string;
          raceResultRecordsDatas.twentyHundredmWindSpeed = response.data.result[i].wind_speed_2000m_point as number;
          raceResultRecordsDatas.twentyHundredmWindDirection = response.data.result[i].wind_direction_2000m_point as number;
          raceResultRecordsDatas.tenHundredmWindSpeed = response.data.result[i].wind_speed_1000m_point as number;
          raceResultRecordsDatas.tenHundredmWindDirection = response.data.result[i].wind_direction_1000m_point as number;
          console.log(raceResultRecordsDatas);
          raceResultRecordsData.push(raceResultRecordsDatas);
        }
        console.log("==============");
        console.log(raceResultRecordsData);
        setResultRecordsData(raceResultRecordsData);
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
          <div className='bg-primary-900 p-4'>
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
                    label={playerInformation.playerName}
                    textColor='white'
                    textSize='h3'
                  ></Label>
                  <div className='flex flex-row gap-[10px]'>
                    <div className='flex flex-row gap-[10px]'>
                      {/* 選手ID */}
                      <div className='text-gray-40 text-caption1'>選手ID</div>
                      <Label
                        label={playerInformation.playerId?.toString()}
                        textColor='white'
                        textSize='caption1'
                      ></Label>
                    </div>
                    <div className='flex flex-row gap-[10px]'>
                      {/* 既存選手ID */}
                      <div className='text-gray-40 text-caption1'>既存選手ID</div>
                      <Label
                        label={playerInformation.existPlayerId?.toString() ?? ''}
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
                            label={playerInformation.dateOfBirth}
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
                      className={`text-center px-[12px] py-[8px] rounded-full ${playerInformation.sideInfo?.at(0)
                        ? 'border border-secondary-500 text-secondary-500'
                        : 'border border-gray-30 text-white'
                        }`}
                    >
                      S（ストロークサイド）
                    </div>
                    <div
                      className={`text-center px-[12px] py-[8px] rounded-full ${playerInformation.sideInfo?.at(1)
                        ? 'border border-secondary-500 text-secondary-500'
                        : 'border border-gray-30 text-white'
                        }`}
                    >
                      B（バウサイド）
                    </div>
                  </div>
                  <div className='flex flex-row justify-start gap-[10px]'>
                    <div
                      className={`text-center px-[12px] py-[8px] rounded-full ${playerInformation.sideInfo?.at(2)
                        ? 'border border-secondary-500 text-secondary-500'
                        : 'border border-gray-30 text-white'
                        }`}
                    >
                      X（スカル）
                    </div>
                    <div
                      className={`text-center px-[12px] py-[8px] rounded-full ${playerInformation.sideInfo?.at(3)
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
                      <CustomTd transitionDest={`/tournamentRef?tournId=${row.tournId}`}>
                        {row.tournName}
                      </CustomTd>
                      {/* 公式／非公式 */}
                      <CustomTd>{row.official === 0 ? '非公式' : '公式'}</CustomTd>
                      {/* 開催日 */}
                      <CustomTd>{row.eventStartDate}</CustomTd>
                      {/* 団体所属 */}
                      <CustomTd>{row.orgName}</CustomTd>
                      {/* レースNo. */}
                      <CustomTd>{row.raceNumber}</CustomTd>
                      {/* 種目 */}
                      <CustomTd>{row.eventName}</CustomTd>
                      {/* レース名 */}
                      <CustomTd>{row.raceName}</CustomTd>
                      {/* 組別 */}
                      <CustomTd>{row.byGroup}</CustomTd>
                      {/* クルー名 */}
                      <CustomTd>{row.crewName}</CustomTd>
                      {/* 順位 */}
                      <CustomTd>{row.rank}</CustomTd>
                      {/* 500mラップタイム */}
                      <CustomTd>{row.fiveHundredmLaptime}</CustomTd>
                      {/* 1000mラップタイム */}
                      <CustomTd>{row.tenHundredmLaptime}</CustomTd>
                      {/* 1500mラップタイム */}
                      <CustomTd>{row.fifteenHundredmLaptime}</CustomTd>
                      {/* 2000mラップタイム */}
                      <CustomTd>{row.twentyHundredmLaptime}</CustomTd>
                      {/* 最終タイム */}
                      <CustomTd>{row.finalTime}</CustomTd>
                      {/* ストロークレート（平均） */}
                      <CustomTd>{row.strokeRateAvg}</CustomTd>
                      {/* 500mlapストロークレート */}
                      <CustomTd>{row.fiveHundredmStrokeRat}</CustomTd>
                      {/* 1000mlapストロークレート */}
                      <CustomTd>{row.tenHundredmStrokeRat}</CustomTd>
                      {/* 1500mlapストロークレート */}
                      <CustomTd>{row.fifteenHundredmStrokeRat}</CustomTd>
                      {/* 2000mlapストロークレート */}
                      <CustomTd>{row.twentyHundredmStrokeRat}</CustomTd>
                      {/* 心拍数/分（平均） */}
                      <CustomTd>{row.heartRateAvg}</CustomTd>
                      {/* 500mlap心拍数/分 */}
                      <CustomTd>{row.fiveHundredmHeartRate}</CustomTd>
                      {/* 1000mlap心拍数/分 */}
                      <CustomTd>{row.tenHundredmHeartRate}</CustomTd>
                      {/* 1500mlap心拍数/分 */}
                      <CustomTd>{row.fifteenHundredmHeartRate}</CustomTd>
                      {/* 2000mlap心拍数/分 */}
                      <CustomTd>{row.twentyHundredmHeartRate}</CustomTd>
                      {/* 立ち合い有無 */}
                      <CustomTd>{row.attendance}</CustomTd>
                      {/* エルゴ体重 */}
                      <CustomTd>{row.ergoWeight}</CustomTd>
                      {/* 選手身長（出漕時点） */}
                      <CustomTd>{row.playerHeight}</CustomTd>
                      {/* 選手体重（出漕時点） */}
                      <CustomTd>{row.playerWeight}</CustomTd>
                      {/* シート番号（出漕時点） */}
                      <CustomTd>{row.sheetName}</CustomTd>
                      {/* 出漕結果記録名 */}
                      <CustomTd>{row.raceResultRecordName}</CustomTd>
                      {/* 登録日時 */}
                      <CustomTd>{row.registeredTime}</CustomTd>
                      {/* 2000m地点風速 */}
                      <CustomTd>{row.twentyHundredmWindSpeed}</CustomTd>
                      {/* 2000m地点風向 */}
                      <CustomTd>{row.twentyHundredmWindDirection}</CustomTd>
                      {/* 1000m地点風速 */}
                      <CustomTd>{row.tenHundredmWindSpeed}</CustomTd>
                      {/* 1000m地点風向 */}
                      <CustomTd>{row.tenHundredmWindDirection}</CustomTd>
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
