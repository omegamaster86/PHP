import CustomButton from '@/app/components/CustomButton';
import CustomTable from '@/app/components/CustomTable/Table';
import CustomTbody from '@/app/components/CustomTable/Tbody';
import CustomTd from '@/app/components/CustomTable/Td';
import CustomTh from '@/app/components/CustomTable/Th';
import CustomThead from '@/app/components/CustomTable/Thead';
import CustomTr from '@/app/components/CustomTable/Tr';
import CustomCheckbox from '@/app/components/OriginalCheckbox';
import { CsvData } from './CsvDataInterface';

// CSVテーブルコンポーネント
const CsvTable = ({
  content, // CSVテーブルの各行のデータ
  header, // CSVテーブルのヘッダー
  handleInputChange, // チェックボックスの変更時の処理
  displayRegisterButton, // 連携ボタンの表示を切り替える関数
  activationFlg, // 各種ボタンの表示を切り替える関数
  visibilityFlg, //CSVテーブルの表示切替フラグ 20240508
}: {
  content: CsvData[];
  header: string[];
  handleInputChange: (rowId: number, name: string, value: string | boolean) => void;
  displayRegisterButton: (flg: boolean) => void;
  activationFlg: boolean;
  visibilityFlg: boolean; //データが0件の場合でもヘッダーは表示させるためのフラグ 20240508
}) => {
  // 読み込み結果がエラーかどうかを確認
  const checkLoadingResult = (row: CsvData) => {
    return row.loadingResult === '登録不可データ' || row.loadingResult === '無効データ';
  };

  // エラーの有無を確認して背景色を変更
  const checkError = (error: string | boolean) => {
    return error !== false ? 'bg-yellow' : '';
  };

  const getErrorMessages = (row: CsvData) => {
    const errorMessages = [
      row.tournIdError,
      row.entrysystemTournIdError,
      row.tournNameError,
      row.userIdError,
      row.jaraPlayerIdError,
      row.playerNameError,
      row.raceIdError,
      row.entrysystemRaceIdError,
      row.raceNumberError,
      row.raceNameError,
      row.raceTypeIdError,
      row.raceTypeNameError,
      row.orgIdError,
      row.entrysystemOrgIdError,
      row.orgNameError,
      row.crewNameError,
      row.byGroupError,
      row.eventIdError,
      row.eventNameError,
      row.rangeError,
      row.rankError,
      row.fiveHundredmLaptimeError,
      row.tenHundredmLaptimeError,
      row.fifteenHundredmLaptimeError,
      row.twentyHundredmLaptimeError,
      row.finalTimeError,
      row.strokeRateAvgError,
      row.fiveHundredmStrokeRatError,
      row.tenHundredmStrokeRatError,
      row.fifteenHundredmStrokeRatError,
      row.twentyHundredmStrokeRatError,
      row.heartRateAvgError,
      row.fiveHundredmHeartRateError,
      row.tenHundredmHeartRateError,
      row.fifteenHundredmHeartRateError,
      row.twentyHundredmHeartRateError,
      row.officialError,
      row.attendanceError,
      row.playerHeightError,
      row.playerWeightError,
      row.mSheetNumberError,
      row.sheetNameError,
      row.raceResultRecordNameError,
      row.startDatetimeError,
      row.weatherError,
      row.windSpeedTwentyHundredmPointError,
      row.windDirectionTwentyHundredmPointError,
      row.windSpeedTenHundredmPointError,
      row.windDirectionTenHundredmPointError,
      row.remarkError,
    ].filter((x) => !!x);

    return errorMessages.join('\n');
  };

  if (!visibilityFlg) {
    return null;
  }

  return (
    <div className='overflow-auto h-[331px] w-[800px]'>
      <CustomTable>
        <CustomThead>
          <CustomTr>
            <CustomTh>
              <CustomButton
                buttonType='primary'
                className='w-[100px]'
                onClick={() => {
                  content?.map((data) =>
                    checkLoadingResult(data) ? null : handleInputChange(data.id, 'checked', true),
                  );
                  content?.some((row) => !checkLoadingResult(row)) && displayRegisterButton(true);
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
          <CustomTr>
            <CustomTh key={0}>選択</CustomTh>
            {header.map((header, index) => (
              <CustomTh key={index}>{header}</CustomTh>
            ))}
          </CustomTr>
        </CustomThead>
        <CustomTbody>
          {content?.map((row, rowIndex) => {
            const textType = checkLoadingResult(row) ? 'error' : 'secondary';
            const errorMessages = getErrorMessages(row) || row.loadingResult;

            return (
              <CustomTr index={rowIndex} key={rowIndex}>
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

                      const data = content.map((row) => row.checked.toString());
                      data[rowIndex] = e.target.checked.toString();
                      data.includes('true')
                        ? displayRegisterButton(true)
                        : displayRegisterButton(false);
                    }}
                  />
                </CustomTd>
                {/* 読み込み結果 */}
                <CustomTd textType={textType} className='whitespace-pre-wrap'>
                  {errorMessages}
                </CustomTd>
                {/* 以下、各列のデータ */}
                <CustomTd textType={textType} className={checkError(row.tournIdError)}>
                  {row.tournId}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.entrysystemTournIdError)}>
                  {row.entrysystemTournId}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.tournNameError)}>
                  {row.tournName}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.userIdError)}>
                  {row.userId}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.jaraPlayerIdError)}>
                  {row.jaraPlayerId}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.playerNameError)}>
                  {row.playerName}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.raceIdError)}>
                  {row.raceId}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.entrysystemRaceIdError)}>
                  {row.entrysystemRaceId}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.raceNumberError)}>
                  {row.raceNumber}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.raceNameError)}>
                  {row.raceName}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.raceTypeIdError)}>
                  {row.raceTypeId}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.raceTypeNameError)}>
                  {row.raceTypeName}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.orgIdError)}>
                  {row.orgId}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.entrysystemOrgIdError)}>
                  {row.entrysystemOrgId}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.orgNameError)}>
                  {row.orgName}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.crewNameError)}>
                  {row.crewName}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.byGroupError)}>
                  {row.byGroup}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.eventIdError)}>
                  {row.eventId}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.eventNameError)}>
                  {row.eventName}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.rangeError)}>
                  {row.range}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.rankError)}>
                  {row.rank}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.fiveHundredmLaptimeError)}>
                  {row.fiveHundredmLaptime}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.tenHundredmLaptimeError)}>
                  {row.tenHundredmLaptime}
                </CustomTd>
                <CustomTd
                  textType={textType}
                  className={checkError(row.fifteenHundredmLaptimeError)}
                >
                  {row.fifteenHundredmLaptime}
                </CustomTd>
                <CustomTd
                  textType={textType}
                  className={checkError(row.twentyHundredmLaptimeError)}
                >
                  {row.twentyHundredmLaptime}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.finalTimeError)}>
                  {row.finalTime}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.strokeRateAvgError)}>
                  {row.strokeRateAvg}
                </CustomTd>
                <CustomTd
                  textType={textType}
                  className={checkError(row.fiveHundredmStrokeRatError)}
                >
                  {row.fiveHundredmStrokeRat}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.tenHundredmStrokeRatError)}>
                  {row.tenHundredmStrokeRat}
                </CustomTd>
                <CustomTd
                  textType={textType}
                  className={checkError(row.fifteenHundredmStrokeRatError)}
                >
                  {row.fifteenHundredmStrokeRat}
                </CustomTd>
                <CustomTd
                  textType={textType}
                  className={checkError(row.twentyHundredmStrokeRatError)}
                >
                  {row.twentyHundredmStrokeRat}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.heartRateAvgError)}>
                  {row.heartRateAvg}
                </CustomTd>
                <CustomTd
                  textType={textType}
                  className={checkError(row.fiveHundredmHeartRateError)}
                >
                  {row.fiveHundredmHeartRate}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.tenHundredmHeartRateError)}>
                  {row.tenHundredmHeartRate}
                </CustomTd>
                <CustomTd
                  textType={textType}
                  className={checkError(row.fifteenHundredmHeartRateError)}
                >
                  {row.fifteenHundredmHeartRate}
                </CustomTd>
                <CustomTd
                  textType={textType}
                  className={checkError(row.twentyHundredmHeartRateError)}
                >
                  {row.twentyHundredmHeartRate}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.officialError)}>
                  {row.official}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.attendanceError)}>
                  {row.attendance}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.playerHeightError)}>
                  {row.playerHeight}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.playerWeightError)}>
                  {row.playerWeight}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.mSheetNumberError)}>
                  {row.mSheetNumber}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.sheetNameError)}>
                  {row.sheetName}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.raceResultRecordNameError)}>
                  {row.raceResultRecordName}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.startDatetimeError)}>
                  {row.startDatetime}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.weatherError)}>
                  {row.weather}
                </CustomTd>
                <CustomTd
                  textType={textType}
                  className={checkError(row.windSpeedTwentyHundredmPointError)}
                >
                  {row.windSpeedTwentyHundredmPoint}
                </CustomTd>
                <CustomTd
                  textType={textType}
                  className={checkError(row.windDirectionTwentyHundredmPointError)}
                >
                  {row.windDirectionTwentyHundredmPoint}
                </CustomTd>
                <CustomTd
                  textType={textType}
                  className={checkError(row.windSpeedTenHundredmPointError)}
                >
                  {row.windSpeedTenHundredmPoint}
                </CustomTd>
                <CustomTd
                  textType={textType}
                  className={checkError(row.windDirectionTenHundredmPointError)}
                >
                  {row.windDirectionTenHundredmPoint}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.remarkError)}>
                  {row.remark}
                </CustomTd>
              </CustomTr>
            );
          })}
        </CustomTbody>
      </CustomTable>
    </div>
  );
};

export default CsvTable;
