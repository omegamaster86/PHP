// 大会結果登録（参照・削除）画面
'use client';
// ライブラリのインポート
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
// 共通コンポーネントのインポート
import {
  CustomTitle,
  CustomButton,
  ErrorBox,
  Label,
  CustomTable,
  CustomThead,
  CustomTr,
  CustomTh,
  CustomTbody,
  OriginalCheckbox,
  CustomTd,
} from '@/app/components';
import { Race, RaceResultRecordsResponse } from '@/app/types';
import axios from '@/app/lib/axios';

// 大会結果登録（参照・削除）画面のメインコンポーネント
export default function TournamentResultRef() {
  // フック
  const router = useRouter();

  // ステート変数
  const [errorText, setErrorText] = useState([] as string[]);

  // 遷移元画面からのパラメータ取得
  const param = useSearchParams();
  // 遷移元画面の情報を取得
  const mode = param.get('mode');
  const [raceId, setRaceId] = useState<string | null>(param.get('raceId')); // レースID

  // レース基本情報のモデル
  const [raceInfo, setRaceInfo] = useState<Race>({} as Race);

  // 出漕結果記録テーブルのモデル
  const [raceResultRecords, setRaceResultRecords] = useState<RaceResultRecordsResponse[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        // レース情報の取得
        // const raceResponse = await axios.get('http://localhost:3100/raceInfo');
        const sendData = {
          race_id: raceId,
        };
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        const raceResponse = await axios.post('/getRaceDataRaceId', sendData);
        //console.log(raceResponse);

        setRaceInfo(raceResponse.data.race_result[0]);

        // 出漕結果記録情報の取得
        // const raceResultRecords = await axios.get('http://localhost:3100/raceResultRecords');
        //console.log(raceResponse.data.record_result);
        setRaceResultRecords(raceResponse.data.record_result);
      } catch (error: any) {
        setErrorText([error.message]);
      }
    };
    fetch();
  }, []);

  // レンダリング
  return (
    <div className='flex flex-col gap-[20px] w-full h-full p-[20px]'>
      {/* 画面名 */}
      <CustomTitle>レース結果{mode === 'delete' ? '削除' : '参照'}</CustomTitle>
      <ErrorBox errorText={errorText} />
      {/* レース基本情報 */}
      <div className='flex flex-col gap-[20px] border p-[20px]'>
        <Label label='レース基本情報' />
        <div className='flex flex-col gap-[8px]'>
          <div className='flex flex-row justify-left gap-[100px]'>
            <div className='flex flex-col gap-[8px]'>
              {/* レースID */}
              <div className='flex flex-col gap-[8px]'>
                <Label label='レースID' textSize='small' isBold />
                {<p className='h-12 text-secondaryText py-3 disable'>{raceInfo.race_id || ''}</p>}
              </div>
              {/* レース名 */}
              <div className='flex flex-col gap-[8px]'>
                <Label label='レース名' textSize='small' isBold />
                {<p className='h-12 text-secondaryText py-3 disable'>{raceInfo.race_name || ''}</p>}
              </div>
              {/* レースNo */}
              <div className='flex flex-col gap-[8px]'>
                <Label label='レースNo' textSize='small' isBold />
                {
                  <p className='h-12 text-secondaryText py-3 disable'>
                    {raceInfo.race_number || ''}
                  </p>
                }
              </div>
              {/* 種目 */}
              <div className='flex flex-col gap-[8px]'>
                <Label label='種目' textSize='small' isBold />
                {
                  <p className='h-12 text-secondaryText py-3 disable'>
                    {raceInfo.event_name || ''}
                  </p>
                }
              </div>
            </div>
            <div className='flex flex-col gap-[8px]'>
              {/* レース区分 */}
              <div className='flex flex-col gap-[8px]'>
                <Label label='レース区分' textSize='small' isBold />
                <p className='h-12 text-secondaryText py-3 disable'>
                  {raceInfo.race_class_name || ''}
                </p>
              </div>
              {/* 組別 */}
              <div className='flex flex-col gap-[8px]'>
                <Label label='組別' textSize='small' isBold />
                {<p className='h-12 text-secondaryText py-3 disable'>{raceInfo.by_group || ''}</p>}
              </div>
              {/* 距離 */}
              <div className='flex flex-col gap-[8px]'>
                <Label label='距離' textSize='small' isBold />
                <p className='h-12 text-secondaryText py-3 disable'>
                  {raceInfo.range ? raceInfo.range + 'm' : ''}
                </p>
              </div>
              {/* 発艇予定日時 */}
              <div className='flex flex-col gap-[8px]'>
                <Label label='発艇予定日時' textSize='small' isBold />
                <p className='h-12 text-secondaryText py-3 disable'>
                  {raceInfo.start_date_time?.substring(0, 16) || ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-[20px] border border-solid p-[20px]'>
        {/* 出漕時点情報 */}
        <Label label='出漕時点情報' />
        <div className='flex flex-col justify-between gap-[8px]'>
          {/* 発艇日時 */}
          <div className='flex flex-col gap-[8px]'>
            <Label label='発艇日時' textSize='small' isBold />
            <p className='h-12 text-secondaryText py-3 disable'>
              {raceResultRecords[0]?.startDateTime.substring(0, 16) || ''}
            </p>
          </div>
          {/* 天気 */}
          <div className='flex flex-col gap-[8px]'>
            <Label label='天気' textSize='small' isBold />
            <p className='h-12 text-secondaryText py-3 disable'>
              {raceResultRecords[0]?.weatherName || ''}
            </p>
          </div>
          <div className='flex flex-row justify-left gap-[80px] item-center'>
            {/* 1000m地点風向 */}
            <div className='flex flex-col gap-[8px]'>
              <Label label='1000m地点風向' textSize='small' isBold />
              <p className='h-12 text-secondaryText py-3 disable'>
                {raceResultRecords[0]?.tenHundredmWindDirectionName || ''}
              </p>
            </div>
            {/* 単位はm/秒 */}
            {/* 1000m地点風速 */}
            <div className='flex flex-col gap-[8px]'>
              <Label label='1000m地点風速' textSize='small' isBold />
              <p className='h-12 text-secondaryText py-3 disable'>
                {raceResultRecords[0]?.wind_speed_1000m_point
                  ? raceResultRecords[0]?.wind_speed_1000m_point + 'm/秒'
                  : ''}
              </p>
            </div>
          </div>
          <div className='flex flex-row justify-left gap-[80px] item-center'>
            <div className='flex flex-col gap-[8px]'>
              <Label label='2000m地点風向' textSize='small' isBold />
              <p className='h-12 text-secondaryText py-3 disable'>
                {raceResultRecords[0]?.twentyHundredmWindDirectionName || ''}
              </p>
            </div>
            <div className='flex flex-col gap-[8px]'>
              <Label label='2000m地点風速' textSize='small' isBold />
              <p className='h-12 text-secondaryText py-3 disable'>
                {raceResultRecords[0]?.wind_speed_2000m_point
                  ? raceResultRecords[0]?.wind_speed_2000m_point + 'm/秒'
                  : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
      {raceResultRecords?.map((item, index) => (
        // eslint-disable-next-line react/jsx-key
        <div
          className={`flex flex-col gap-[20px] border border-solid p-[20px] ${
            raceInfo.checked ? 'bg-gray-500' : ''
          }`}
        >
          {/* レース結果情報 */}
          <Label label={`レース結果情報${raceResultRecords.length - index}`} />
          <div className='flex flex-col justify-between gap-[16px]'>
            <div className='flex flex-col gap-[8px]'>
              <div className='leading-loose text-primary-500 flex flex-row gap-[8px] items-center cursor-pointer'>
                <OriginalCheckbox
                  id={'raceResultDeleted'}
                  value={'raceResultDeleted'}
                  checked={raceInfo.checked}
                  readonly
                  onChange={() => {}}
                />
                <p className='text-systemErrorText'>このレース結果情報を削除する</p>
              </div>
            </div>
            <div className='flex flex-col gap-[20px] border border-solid border-gray-300 p-[20px]'>
              <div className='flex flex-row justify-between gap-[80px] w-[800px]'>
                <div className='flex flex-col justify-between gap-[1px]'>
                  <div className='flex flex-row justify-left gap-[80px] item-center'>
                    <div className='flex flex-col gap-[8px]'>
                      <Label label='所属団体' textSize='small' isBold />
                      <p className='h-12 text-secondaryText py-3 disable'>{item?.org_name || ''}</p>
                    </div>
                    <div className='flex flex-col gap-[8px]'>
                      <Label label='クルー名' textSize='small' isBold />
                      <p className='h-12 text-secondaryText py-3 disable'>
                        {item?.crew_name || ''}
                      </p>
                    </div>
                    <div className='flex flex-col gap-[8px]'>
                      <Label label='出漕レーンNo' textSize='small' isBold />
                      <p className='h-12 text-secondaryText py-3 disable'>
                        {item?.lane_number || ''}
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-row justify-left gap-[80px] item-center'>
                    <div className='flex flex-col gap-[8px]'>
                      <Label label='順位' textSize='small' isBold />
                      <p className='h-12 text-secondaryText py-3 disable'>{item?.rank || ''}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex flex-col'>
                <div className='border-t border-r border-l border-solid border-gray-300 bg-secondary-50 p-[8px]'>
                  <Label label='ラップタイム' />
                </div>
                <div className='flex flex-col gap-[20px] border border-solid border-gray-300 p-[20px]'>
                  <div>
                    <div className='flex flex-row justify-between gap-[80px] w-[800px]'>
                      <div className='flex flex-col justify-between gap-[1px]'>
                        <div className='flex flex-row justify-left item-center gap-[60px]'>
                          <div className='flex flex-col gap-[8px]'>
                            <Label label='500m' textSize='small' isBold />
                            <p className='h-12 text-secondaryText py-3 disable'>
                              {item?.laptime_500m || ''}
                            </p>
                          </div>
                          <div className='flex flex-col gap-[8px]'>
                            <Label label='1000m' textSize='small' isBold />
                            <p className='h-12 text-secondaryText py-3 disable'>
                              {item?.laptime_1000m || ''}
                            </p>
                          </div>
                          <div className='flex flex-col gap-[8px]'>
                            <Label label='1500m' textSize='small' isBold />
                            <p className='h-12 text-secondaryText py-3 disable'>
                              {item?.laptime_1500m || ''}
                            </p>
                          </div>
                          <div className='flex flex-col gap-[8px]'>
                            <Label label='2000m' textSize='small' isBold />
                            <p className='h-12 text-secondaryText py-3 disable'>
                              {item?.laptime_2000m || ''}
                            </p>
                          </div>
                          <div className='flex flex-col gap-[8px]'>
                            <Label label='最終' textSize='small' isBold />
                            <p className='h-12 text-secondaryText py-3 disable'>
                              {item?.final_time || ''}
                            </p>
                          </div>
                          <div className='flex flex-col gap-[8px]'>
                            <Label label='備考' textSize='small' isBold />
                            <p className='h-12 text-secondaryText py-3 disable'>
                              {item?.race_result_notes || ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex flex-col'>
                <div className='border-t border-r border-l border-solid border-gray-300 bg-primary-50 p-[8px]'>
                  <Label label='ストロークレート' />
                </div>
                <div className='flex flex-col gap-[20px] border border-solid border-gray-300 p-[20px]'>
                  <div>
                    <div className='flex flex-row justify-between gap-[80px] w-[800px]'>
                      <div className='flex flex-col justify-between gap-[1px]'>
                        <div className='flex flex-row justify-left item-center gap-[80px]'>
                          <div className='flex flex-col gap-[8px]'>
                            <Label label='500m' textSize='small' isBold />
                            <p className='h-12 text-secondaryText py-3 disable'>
                              {item?.stroke_rat_500m ? item?.stroke_rat_500m + '回/分' : ''}
                            </p>
                          </div>
                          <div className='flex flex-col gap-[8px]'>
                            <Label label='1000m' textSize='small' isBold />
                            <p className='h-12 text-secondaryText py-3 disable'>
                              {item?.stroke_rat_1000m ? item?.stroke_rat_1000m + '回/分' : ''}
                            </p>
                          </div>
                          <div className='flex flex-col gap-[8px]'>
                            <Label label='1500m' textSize='small' isBold />
                            <p className='h-12 text-secondaryText py-3 disable'>
                              {item?.stroke_rat_1500m ? item?.stroke_rat_1500m + '回/分' : ''}
                            </p>
                          </div>
                          <div className='flex flex-col gap-[8px]'>
                            <Label label='2000m' textSize='small' isBold />
                            <p className='h-12 text-secondaryText py-3 disable'>
                              {item?.stroke_rat_2000m ? item?.stroke_rat_2000m + '回/分' : ''}
                            </p>
                          </div>
                          <div className='flex flex-col gap-[8px]'>
                            <Label label='平均' textSize='small' isBold />
                            <p className='h-12 text-secondaryText py-3 disable'>
                              {item?.stroke_rate_avg ? item?.stroke_rate_avg + '回/分' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* 選手情報 */}
              <div>
                <div className='w-full bg-primary-500 h-[40px] flex justify-center items-center font-bold relative'>
                  <div className='font-bold text-white'>選手情報</div>
                </div>
                <CustomTable>
                  <CustomThead>
                    <CustomTr>
                      <CustomTh rowSpan={2}>
                        <p>削除</p>
                      </CustomTh>
                      <CustomTh rowSpan={2}>
                        <p>選手ID</p>
                      </CustomTh>
                      <CustomTh rowSpan={2}>
                        <p>選手名</p>
                      </CustomTh>
                      <CustomTh rowSpan={2}>
                        <p>性別</p>
                      </CustomTh>
                      <CustomTh rowSpan={2}>
                        <p>身長</p>
                      </CustomTh>
                      <CustomTh rowSpan={2}>
                        <p>体重</p>
                      </CustomTh>
                      <CustomTh rowSpan={2}>
                        <p>シート番号</p>
                      </CustomTh>
                      <CustomTh rowSpan={1} colSpan={5}>
                        <p>心拍数(回/分)</p>
                      </CustomTh>
                      <CustomTh rowSpan={1}>
                        <p>エルゴ</p>
                      </CustomTh>
                    </CustomTr>
                    <CustomTr>
                      <CustomTh>
                        <p>500m</p>
                      </CustomTh>
                      <CustomTh>
                        <p>1000m</p>
                      </CustomTh>
                      <CustomTh>
                        <p>1500m</p>
                      </CustomTh>
                      <CustomTh>
                        <p>2000m</p>
                      </CustomTh>
                      <CustomTh>
                        <p>平均</p>
                      </CustomTh>
                      <CustomTh>
                        <p>
                          立ち会い
                          <br />
                          有無
                        </p>
                      </CustomTh>
                    </CustomTr>
                  </CustomThead>
                  <CustomTbody>
                    {item.crewPlayer.map((item, index) => (
                      <CustomTr key={index}>
                        <CustomTd>
                          <div className='flex justify-center'>
                            <OriginalCheckbox
                              id={''}
                              value={''}
                              readonly
                              checked={false}
                              onChange={() => {}}
                            />
                          </div>
                        </CustomTd>
                        <CustomTd>{item.playerId}</CustomTd>
                        <CustomTd>{item.playerName}</CustomTd>
                        <CustomTd>{item.sex}</CustomTd>
                        <CustomTd>{item.height}</CustomTd>
                        <CustomTd>{item.weight}</CustomTd>
                        <CustomTd>{item.sheetName}</CustomTd>
                        <CustomTd>{item.fiveHundredmHeartRate}</CustomTd>
                        <CustomTd>{item.tenHundredmHeartRate}</CustomTd>
                        <CustomTd>{item.fifteenHundredmHeartRate}</CustomTd>
                        <CustomTd>{item.twentyHundredmHeartRate}</CustomTd>
                        <CustomTd>{item.heartRateAvg}</CustomTd>
                        <CustomTd>
                          <div className='flex justify-center'>
                            <OriginalCheckbox
                              id={'ergo' + index}
                              value='ergo'
                              checked={item.attendance ? true : false}
                              onChange={(e: any) => {}}
                              readonly
                            />
                          </div>
                        </CustomTd>
                      </CustomTr>
                    ))}
                  </CustomTbody>
                </CustomTable>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className='flex flex-row justify-center gap-[80px] mt-[20px]'>
        <CustomButton
          buttonType='secondary'
          onClick={() => {
            router.push('/tournamentResultManagement'); //大会結果管理（大会レース結果管理）画面に戻す 20240516
          }}
          className='w-[170px]'
        >
          戻る
        </CustomButton>
        {mode === 'delete' ? (
          <CustomButton
            buttonType='primary'
            onClick={async () => {
              try {
                if (!window.confirm('削除しますか？')) {
                  return; //キャンセルを押下された場合、何もしない 20240520
                }

                const deleteSendData = {
                  raceInfo: raceInfo,
                  raceResultRecords: raceResultRecords,
                };
                //console.log(deleteSendData);
                const csrf = () => axios.get('/sanctum/csrf-cookie');
                await csrf();
                const response = await axios.post('/deleteRaceResultRecordData', deleteSendData); //削除処理 20240520
                //console.log(response);
                if (response.data?.errMessage) {
                  setErrorText([response.data?.errMessage]);
                  window.scrollTo(0, 0);
                } else {
                  window.alert('削除が完了しました。'); //完了メッセージ 20240520

                  // TODO 削除モードのチェック処理を実装
                  // TODO 選手レース結果管理画面が実装されたら、遷移先を変更する
                  router.push('/tournamentResultManagement');
                }
              } catch (error: any) {
                setErrorText([error.message]);
              }
            }}
            className='w-[170px]'
          >
            削除
          </CustomButton>
        ) : (
          <CustomButton
            buttonType='primary'
            onClick={() => {
              router.push('/tournamentResult?mode=update&raceId=' + raceInfo.race_id);
            }}
            className='w-[170px]'
          >
            レース情報を更新
          </CustomButton>
        )}
      </div>
    </div>
  );
}
