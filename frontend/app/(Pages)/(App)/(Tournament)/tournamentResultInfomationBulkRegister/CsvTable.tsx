import { useState } from 'react';
import CustomButton from '@/app/components/CustomButton';
import CustomCheckbox from '@/app/components/OriginalCheckbox';
import CustomTable from '@/app/components/CustomTable/Table';
import CustomThead from '@/app/components/CustomTable/Thead';
import CustomTbody from '@/app/components/CustomTable/Tbody';
import CustomTr from '@/app/components/CustomTable/Tr';
import CustomTh from '@/app/components/CustomTable/Th';
import CustomTd from '@/app/components/CustomTable/Td';
import { CsvData } from './CsvDataInterface';

// CSVテーブルコンポーネント
const CsvTable = ({
  content, // CSVテーブルの各行のデータ
  header, // CSVテーブルのヘッダー
  handleInputChange, // チェックボックスの変更時の処理
  displayRegisterButton, // 連携ボタンの表示を切り替える関数
  activationFlg, // 各種ボタンの表示を切り替える関数
}: {
  content: CsvData[];
  header: string[];
  handleInputChange: (rowId: number, name: string, value: string | boolean) => void;
  displayRegisterButton: (flg: boolean) => void;
  activationFlg: boolean;
}) => {
  if (content.length === 0) {
    return <div className='text-primaryText'>CSVファイルをアップロードしてください。</div>;
  }

  // 読み込み結果がエラーかどうかを確認
  const checkLoadingResult = (row: CsvData) => {
    return row.loadingResult === '登録不可データ' || row.loadingResult === '無効データ';
  };

  // エラーの有無を確認して背景色を変更
  const checkError = (error: boolean) => {
    return error ? 'bg-yellow' : '';
  };

  return (
    <div className='overflow-auto h-[331px] w-[800px]'>
      <CustomTable>
        <CustomThead>
          {/* contentがundefinedまたは空の配列でないことを確認 */}
          {!content || content.length === 0 || activationFlg ? (
            <CustomTr>
              <CustomTh align='center' colSpan={header.length + 1}>
                レース結果
              </CustomTh>
            </CustomTr>
          ) : (
            <CustomTr>
              <CustomTh>
                <CustomButton
                  buttonType='primary'
                  className='w-[100px]'
                  onClick={() => {
                    content?.map((data) =>
                      !checkLoadingResult(data)
                        ? handleInputChange(data.id, 'checked', true)
                        : null,
                    );
                    content?.some((row) => checkLoadingResult(row)) && displayRegisterButton(true);
                  }}
                >
                  全選択
                </CustomButton>
              </CustomTh>
              <CustomTh>
                <CustomButton
                  buttonType='primary'
                  className='w-[110px]'
                  onClick={() => {
                    content.length > 0 &&
                      content.map((data) => handleInputChange(data.id, 'checked', false));
                    displayRegisterButton(false);
                  }}
                >
                  全選択解除
                </CustomButton>
              </CustomTh>
              <CustomTh colSpan={header.length - 1}>読み込み結果</CustomTh>
            </CustomTr>
          )}
          <CustomTr>
            <CustomTh key={0}>選択</CustomTh>
            {header.map((header: any, index: any) => (
              <CustomTh key={index}>{header}</CustomTh>
            ))}
          </CustomTr>
        </CustomThead>
        <CustomTbody>
          {content.map((row, rowIndex) => (
            <CustomTr index={rowIndex} key={0}>
              {/* 選択 */}
              <CustomTd align='center'>
                <CustomCheckbox
                  id={`delete-${rowIndex}`}
                  label={''}
                  value={`delete-${rowIndex}`}
                  checked={row.checked}
                  readonly={checkLoadingResult(row)}
                  onChange={(e) => {
                    handleInputChange(row.id, 'checked', e.target.checked);
                    e.target.checked ? displayRegisterButton(true) : null;
                  }}
                ></CustomCheckbox>
              </CustomTd>
              {/* 読み込み結果 */}
              <CustomTd textType={checkLoadingResult(row) ? 'error' : ''}>
                {row.loadingResult}
              </CustomTd>
              {/* 以下、各列のデータ */}
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.tournIdError)}
              >
                {row.tournIdError}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.tournNameError)}
              >
                {row.tournName}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.userIdError)}
              >
                {row.userId}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.jaraPlayerIdError)}
              >
                {row.jaraPlayerId}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.playerNameError)}
              >
                {row.playerName}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.raceIdError)}
              >
                {row.raceId}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.entrysystemRaceIdError)}
              >
                {row.entrysystemRaceId}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.raceNumberError)}
              >
                {row.raceNumber}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.raceNameError)}
              >
                {row.raceName}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.raceTypeIdError)}
              >
                {row.raceTypeId}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.raceTypeNameError)}
              >
                {row.raceTypeName}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.tournIdError)}
              >
                {row.orgId}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.orgIdError)}
              >
                {row.entrysystemOrgId}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.orgNameError)}
              >
                {row.orgName}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.crewNameError)}
              >
                {row.crewName}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.byGroupError)}
              >
                {row.byGroup}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.eventIdError)}
              >
                {row.eventId}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.eventNameError)}
              >
                {row.eventName}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.rangeError)}
              >
                {row.range}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.rankError)}
              >
                {row.rank}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.fiveHundredmLaptimeError)}
              >
                {row.fiveHundredmLaptime}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.tenHundredmLaptimeError)}
              >
                {row.tenHundredmLaptime}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.fifteenHundredmLaptimeError)}
              >
                {row.fifteenHundredmLaptime}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.twentyHundredmLaptimeError)}
              >
                {row.twentyHundredmLaptime}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.finalTimeError)}
              >
                {row.finalTime}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.strokeRateAvgError)}
              >
                {row.strokeRateAvg}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.fiveHundredmStrokeRatError)}
              >
                {row.fiveHundredmStrokeRat}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.tenHundredmStrokeRatError)}
              >
                {row.tenHundredmStrokeRat}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.fifteenHundredmStrokeRatError)}
              >
                {row.fifteenHundredmStrokeRat}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.twentyHundredmStrokeRatError)}
              >
                {row.twentyHundredmStrokeRat}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.heartRateAvgError)}
              >
                {row.heartRateAvg}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.fiveHundredmHeartRateError)}
              >
                {row.fiveHundredmHeartRate}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.tenHundredmHeartRateError)}
              >
                {row.tenHundredmHeartRate}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.fifteenHundredmHeartRateError)}
              >
                {row.fifteenHundredmHeartRate}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.twentyHundredmHeartRateError)}
              >
                {row.twentyHundredmHeartRate}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.officialError)}
              >
                {row.official}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.attendanceError)}
              >
                {row.attendance}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.ergoWeightError)}
              >
                {row.ergoWeight}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.playerHeightError)}
              >
                {row.playerHeight}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.playerWeightError)}
              >
                {row.playerWeight}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.mSheetNumberError)}
              >
                {row.mSheetNumber}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.sheetNameError)}
              >
                {row.sheetName}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.raceResultRecordNameError)}
              >
                {row.raceResultRecordName}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.startDatetimeError)}
              >
                {row.startDatetime}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.weatherError)}
              >
                {row.weather}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.windSpeedTwentyHundredmPointError)}
              >
                {row.windSpeedTwentyHundredmPoint}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.windDirectionTwentyHundredmPointError)}
              >
                {row.windDirectionTwentyHundredmPoint}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.windSpeedTenHundredmPointError)}
              >
                {row.windSpeedTenHundredmPoint}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.windDirectionTenHundredmPointError)}
              >
                {row.windDirectionTenHundredmPoint}
              </CustomTd>
              <CustomTd
                textType={checkLoadingResult(row) ? 'error' : ''}
                className={checkError(row.remarkError)}
              >
                {row.remark}
              </CustomTd>
            </CustomTr>
          ))}
        </CustomTbody>
      </CustomTable>
    </div>
  );
};

export default CsvTable;
