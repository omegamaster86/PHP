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
  visibilityFlg, //CSVテーブルの表示切替フラグ 20240508
}: {
  content: CsvData[];
  header: string[];
  handleInputChange: (rowId: number, name: string, value: string | boolean) => void;
  displayRegisterButton: (flg: boolean) => void;
  activationFlg: boolean;
  visibilityFlg: boolean; //データが0件の場合でもヘッダーは表示させるためのフラグ 20240508
}) => {
  // if (content.length === 0) {
  //   return <div className='text-primaryText'>CSVファイルをアップロードしてください。</div>;
  // }

  // 読み込み結果がエラーかどうかを確認
  const checkLoadingResult = (row: CsvData) => {
    return (
      row.loadingResult === '未入力項目あり' ||
      row.loadingResult === '無効データ' ||
      row.loadingResult === '不一致情報あり' ||
      row.loadingResult === '記録情報あり' ||
      row.loadingResult === 'エントリー情報変更' ||
      row.loadingResult === '登録エラー（記録情報あり）'
    );
  };

  // エラーの有無を確認して背景色を変更
  const checkError = (error: boolean) => {
    return error ? 'bg-yellow' : '';
  };

  console.log('content');
  console.log(content);

  return (
    <div className='overflow-auto h-[331px] w-[800px]'>
      <CustomTable>
        <CustomThead>
          {/* contentがundefinedまたは空の配列でないことを確認 */}
          {visibilityFlg == false ? (
            <div></div>
          ) : (
            <CustomTr>
              <CustomTh align='center' colSpan={header.length + 1}>
                レース結果
              </CustomTh>
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
              <CustomTr>
                <CustomTh key={0}>選択</CustomTh>
                {header.map((header: any, index: any) => (
                  <CustomTh key={index}>{header}</CustomTh>
                ))}
              </CustomTr>
            </CustomTr>
          )}
        </CustomThead>
        <CustomTbody>
          {content?.map(
            (row, rowIndex) => (
              console.log(row),
              (
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
                    {row.tournId}
                  </CustomTd>
                  <CustomTd textType={checkLoadingResult(row) ? 'error' : ''}>
                    {row.tournName}
                  </CustomTd>
                  <CustomTd
                    textType={checkLoadingResult(row) ? 'error' : ''}
                    className={checkError(row.eventIdError)}
                  >
                    {row.eventId}
                  </CustomTd>
                  <CustomTd textType={checkLoadingResult(row) ? 'error' : ''}>
                    {row.eventName}
                  </CustomTd>
                  <CustomTd
                    textType={checkLoadingResult(row) ? 'error' : ''}
                    className={checkError(row.raceTypeIdError)}
                  >
                    {row.raceTypeId}
                  </CustomTd>
                  <CustomTd textType={checkLoadingResult(row) ? 'error' : ''}>
                    {row.raceTypeName}
                  </CustomTd>
                  <CustomTd
                    textType={checkLoadingResult(row) ? 'error' : ''}
                    className={checkError(row.raceIdError)}
                  >
                    {row.raceId}
                  </CustomTd>
                  <CustomTd textType={checkLoadingResult(row) ? 'error' : ''}>
                    {row.raceName}
                  </CustomTd>
                  <CustomTd
                    textType={checkLoadingResult(row) ? 'error' : ''}
                    className={checkError(row.byGroupError)}
                  >
                    {row.byGroup}
                  </CustomTd>
                  <CustomTd
                    textType={checkLoadingResult(row) ? 'error' : ''}
                    className={checkError(row.raceNumberError)}
                  >
                    {row.raceNumber}
                  </CustomTd>
                  <CustomTd textType={checkLoadingResult(row) ? 'error' : ''}>
                    {row.startDatetime}
                  </CustomTd>
                  <CustomTd
                    textType={checkLoadingResult(row) ? 'error' : ''}
                    className={checkError(row.orgIdError)}
                  >
                    {row.orgId}
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
                    className={checkError(row.userIdError)}
                  >
                    {row.userId}
                  </CustomTd>
                  <CustomTd
                    textType={checkLoadingResult(row) ? 'error' : ''}
                    className={checkError(row.playerNameError)}
                  >
                    {row.playerName}
                  </CustomTd>
                </CustomTr>
              )
            ),
          )}
        </CustomTbody>
      </CustomTable>
    </div>
  );
};

export default CsvTable;
