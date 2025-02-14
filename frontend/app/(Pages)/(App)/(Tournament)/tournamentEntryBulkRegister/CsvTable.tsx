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
    return (
      row.loadingResult === '未入力項目あり' ||
      row.loadingResult === '入力値不正項目あり' ||
      row.loadingResult === '無効データ' ||
      row.loadingResult === '登録情報と不一致あり' ||
      row.loadingResult === '記録情報あり' ||
      row.loadingResult === '登録エラー（記録情報あり）'
    );
  };

  // エラーの有無を確認して背景色を変更
  const checkError = (error: string | boolean) => {
    return error !== false ? 'bg-yellow' : '';
  };

  const getErrorMessages = (row: CsvData) => {
    const errorMessages = [
      row.tournIdError,
      row.eventIdError,
      row.raceTypeIdError,
      row.raceIdError,
      row.byGroupError,
      row.raceNumberError,
      row.orgIdError,
      row.orgNameError,
      row.crewNameError,
      row.mSeatNumberError,
      row.seatNameError,
      row.userIdError,
      row.playerNameError,
    ].filter((x) => typeof x === 'string' && !!x);

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
                    !checkLoadingResult(data) ? handleInputChange(data.id, 'checked', true) : null,
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
                      // チェックボックスの変更により連携ボタンの表示を切り替える
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
                <CustomTd textType={textType}>{row.tournName}</CustomTd>
                <CustomTd textType={textType} className={checkError(row.eventIdError)}>
                  {row.eventId}
                </CustomTd>
                <CustomTd textType={textType}>{row.eventName}</CustomTd>
                <CustomTd textType={textType} className={checkError(row.raceTypeIdError)}>
                  {row.raceTypeId}
                </CustomTd>
                <CustomTd textType={textType}>{row.raceTypeName}</CustomTd>
                <CustomTd textType={textType} className={checkError(row.raceIdError)}>
                  {row.raceId}
                </CustomTd>
                <CustomTd textType={textType}>{row.raceName}</CustomTd>
                <CustomTd textType={textType} className={checkError(row.byGroupError)}>
                  {row.byGroup}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.raceNumberError)}>
                  {row.raceNumber}
                </CustomTd>
                <CustomTd textType={textType}>{row.startDatetime}</CustomTd>
                <CustomTd textType={textType} className={checkError(row.orgIdError)}>
                  {row.orgId}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.orgNameError)}>
                  {row.orgName}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.crewNameError)}>
                  {row.crewName}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.mSeatNumberError)}>
                  {row.mSeatNumber}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.seatNameError)}>
                  {row.seatName}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.userIdError)}>
                  {row.userId}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.playerNameError)}>
                  {row.playerName}
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
