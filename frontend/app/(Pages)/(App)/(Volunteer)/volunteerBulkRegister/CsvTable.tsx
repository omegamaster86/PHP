import React from 'react';
import CustomButton from '@/app/components/CustomButton';
import CustomCheckbox from '@/app/components/OriginalCheckbox';
import CustomTable from '@/app/components/CustomTable/Table';
import CustomThead from '@/app/components/CustomTable/Thead';
import CustomTbody from '@/app/components/CustomTable/Tbody';
import CustomTr from '@/app/components/CustomTable/Tr';
import CustomTh from '@/app/components/CustomTable/Th';
import CustomTd from '@/app/components/CustomTable/Td';

interface CsvTableRow {
  id: number; // ID
  checked: boolean; // 選択
  result: string;
  userId: {
    value: string;
    isError: boolean;
  }; // ユーザーID
  volunteerName: {
    value: string;
    isError: boolean;
  }; // 氏名
  dateOfBirth: {
    value: string;
    isError: boolean;
  }; // 生年月日
  residenceCountryId: {
    value: string;
    isError: boolean;
  }; // 居住国
  residencePrefectureId: {
    value: string;
    isError: boolean;
  }; // 居住都道府県
  sexId: {
    value: string;
    isError: boolean;
  }; // 性別
  clothesSizeId: {
    value: string;
    isError: boolean;
  }; // 服サイズ
  mailaddress: {
    value: string;
    isError: boolean;
  }; // メールアドレス
  telephoneNumber: {
    value: string;
    isError: boolean;
  }; // 電話番号
  disTypeId1: {
    value: string;
    isError: boolean;
  }; // PR1
  disTypeId2: {
    value: string;
    isError: boolean;
  }; // PR2
  disTypeId3: {
    value: string;
    isError: boolean;
  }; // PR3
  qualId1: {
    value: string;
    isError: boolean;
  }; // 保有資格1
  qualId2: {
    value: string;
    isError: boolean;
  }; // 保有資格2
  qualId3: {
    value: string;
    isError: boolean;
  }; // 保有資格3
  qualId4: {
    value: string;
    isError: boolean;
  }; // 保有資格4
  qualId5: {
    value: string;
    isError: boolean;
  }; // 保有資格5
  langId1: {
    value: string;
    isError: boolean;
  }; // 使用言語1
  langId2: {
    value: string;
    isError: boolean;
  }; // 使用言語2
  langId3: {
    value: string;
    isError: boolean;
  }; // 使用言語3
  langProId1: {
    value: string;
    isError: boolean;
  }; // 言語レベル1
  langProId2: {
    value: string;
    isError: boolean;
  }; // 言語レベル2
  langProId3: {
    value: string;
    isError: boolean;
  }; // 言語レベル3
  dayOfWeek1: {
    value: string;
    isError: boolean;
  }; // 日曜日
  dayOfWeek2: {
    value: string;
    isError: boolean;
  }; // 月曜日
  dayOfWeek3: {
    value: string;
    isError: boolean;
  }; // 火曜日
  dayOfWeek4: {
    value: string;
    isError: boolean;
  }; // 水曜日
  dayOfWeek5: {
    value: string;
    isError: boolean;
  }; // 木曜日
  dayOfWeek6: {
    value: string;
    isError: boolean;
  }; // 金曜日
  dayOfWeek7: {
    value: string;
    isError: boolean;
  }; // 土曜日
  timeZone1: {
    value: string;
    isError: boolean;
  }; // 早朝
  timeZone2: {
    value: string;
    isError: boolean;
  }; // 午前
  timeZone3: {
    value: string;
    isError: boolean;
  }; // 午後
  timeZone4: {
    value: string;
    isError: boolean;
  }; // 夜
}

// CSVテーブルコンポーネント
const CsvTable = ({
  content, // CSVテーブルの各行のデータ
  handleInputChange, // チェックボックスの変更時の処理
  displayLinkButton, // 連携ボタンの表示を切り替える関数
  activationFlg, // 各種ボタンの表示を切り替える関数
  visibilityFlg, //CSVテーブルの表示切替フラグ 20240406
}: {
  content: CsvTableRow[];
  handleInputChange: (rowId: number, name: string, value: string | boolean) => void;
  displayLinkButton: (flg: boolean) => void;
  activationFlg: boolean;
  visibilityFlg: boolean; //データが0件の場合でもヘッダーは表示させるためのフラグ 20240406
}) => {
  const isResultError = (result: string) => {
    return result === '無効データ' || result === '重複データ' || result === '登録不可データ';
  };

  return visibilityFlg && (
    <div className='relative overflow-auto h-[331px] w-[800px]'>
      <div className='bg-primary-40 bg-opacity-30 text-primary-500 py-2 px-4 h-[60px] flex justify-center items-center font-bold relative'>
        読み込み結果
        <div className={`absolute left-[10px]`}>
          <CustomButton
            buttonType='primary'
            disabled={activationFlg}
            className='m-auto w-[100px] h-[36px] text-small p-[0px]'
            onClick={() => {
              content?.map((data) =>
                isResultError(data.result) ? null : handleInputChange(data.id, 'checked', true),
              );
              content?.some((row) => !isResultError(row.result)) && displayLinkButton(true);
            }}
          >
            全選択
          </CustomButton>
          <CustomButton
            buttonType='primary'
            disabled={activationFlg}
            className='m-auto w-[120px] h-[36px] text-small p-[0px]'
            onClick={() => {
              content.length > 0 &&
                content.map((data) => handleInputChange(data.id, 'checked', false));
              displayLinkButton(false);
            }}
          >
            全選択解除
          </CustomButton>
        </div>
      </div>
      <div className='relative overflow-auto'>
        <CustomTable>
          <CustomThead>
            <CustomTr>
              <CustomTh key={0} rowSpan={2}>
                選択
              </CustomTh>
              <CustomTh key={1} rowSpan={2}>
                読み込み結果
              </CustomTh>
              <CustomTh key={2} rowSpan={2}>
                ユーザーID
              </CustomTh>
              <CustomTh key={3} rowSpan={2}>
                氏名
              </CustomTh>
              <CustomTh key={4} rowSpan={2}>
                生年月日
              </CustomTh>
              <CustomTh key={5} rowSpan={2}>
                居住地
              </CustomTh>
              <CustomTh key={7} rowSpan={2}>
                性別
              </CustomTh>
              <CustomTh key={8} rowSpan={2}>
                服サイズ
              </CustomTh>
              <CustomTh key={9} rowSpan={2}>
                メールアドレス
              </CustomTh>
              <CustomTh key={10} rowSpan={2}>
                電話番号
              </CustomTh>
              <CustomTh key={11} rowSpan={1} colSpan={3}>
                補助が可能な障碍タイプ
              </CustomTh>
              <CustomTh key={12} rowSpan={1} colSpan={5}>
                保有資格情報
              </CustomTh>
              <CustomTh key={13} rowSpan={1} colSpan={6}>
                言語
              </CustomTh>
              <CustomTh key={14} rowSpan={1} colSpan={7}>
                参加しやすい曜日
              </CustomTh>
              <CustomTh key={15} rowSpan={1} colSpan={4}>
                参加しやすい時間帯
              </CustomTh>
            </CustomTr>
            <CustomTr>
              <CustomTh>PR1</CustomTh>
              <CustomTh>PR2</CustomTh>
              <CustomTh>PR3</CustomTh>
              <CustomTh>資格1</CustomTh>
              <CustomTh>資格2</CustomTh>
              <CustomTh>資格3</CustomTh>
              <CustomTh>資格4</CustomTh>
              <CustomTh>資格5</CustomTh>
              <CustomTh>言語1</CustomTh>
              <CustomTh>レベル</CustomTh>
              <CustomTh>言語2</CustomTh>
              <CustomTh>レベル</CustomTh>
              <CustomTh>言語3</CustomTh>
              <CustomTh>レベル</CustomTh>
              <CustomTh>日</CustomTh>
              <CustomTh>月</CustomTh>
              <CustomTh>火</CustomTh>
              <CustomTh>水</CustomTh>
              <CustomTh>木</CustomTh>
              <CustomTh>金</CustomTh>
              <CustomTh>土</CustomTh>
              <CustomTh>早朝</CustomTh>
              <CustomTh>午前</CustomTh>
              <CustomTh>午後</CustomTh>
              <CustomTh>夜</CustomTh>
            </CustomTr>
          </CustomThead>
          <CustomTbody>
            {content.map((row, rowIndex) => (
              <CustomTr index={rowIndex} key={rowIndex}>
                <CustomTd align='center'>
                  <CustomCheckbox
                    id={`delete-${rowIndex}`}
                    label={''}
                    value={`delete-${rowIndex}`}
                    checked={row.checked}
                    readonly={isResultError(row.result) || activationFlg}
                    onChange={(e) => {
                      // チェックボックスの変更時の処理
                      handleInputChange(row.id, 'checked', e.target.checked);
                      // チェックボックスの変更により連携ボタンの表示を切り替える
                      // e.target.checked ? displayLinkButton(true) : null;
                      var data = content.map((row) => row.checked.toString());
                      data[rowIndex] = e.target.checked.toString();
                      //console.log(data);
                      data.includes('true') ? displayLinkButton(true) : displayLinkButton(false);
                    }}
                  ></CustomCheckbox>
                </CustomTd>
                <CustomTd textType={isResultError(row.result) ? 'error' : 'secondary'}>
                  {row.result}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.userId.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.userId.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.volunteerName.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.volunteerName.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.dateOfBirth.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.dateOfBirth.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={
                    row.residenceCountryId.isError
                      ? `bg-systemWarningBg`
                      : row.residencePrefectureId.isError
                        ? 'bg-systemWarningBg'
                        : ''
                  }
                >
                  {/* 日本の場合のみ都道府県を表示 */}
                  {row.residenceCountryId.value}
                  {/* 不具合修正の一環で都道府県も一律表示するように変更 20240412 */}
                  {row.residencePrefectureId.value}
                  {/* {row.residenceCountryId.value === '日本国 （jpn）'
                    ? row.residencePrefectureId.value
                    : ''} */}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.sexId.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.sexId.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.clothesSizeId.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.clothesSizeId.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.mailaddress.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.mailaddress.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.telephoneNumber.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.telephoneNumber.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.disTypeId1.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.disTypeId1.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.disTypeId2.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.disTypeId2.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.disTypeId3.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.disTypeId3.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.qualId1.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.qualId1.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.qualId2.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.qualId2.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.qualId3.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.qualId3.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.qualId4.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.qualId4.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.qualId5.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.qualId5.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.langId1.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.langId1.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.langProId1.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.langProId1.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.langId2.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.langId2.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.langProId2.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.langProId2.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.langId3.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.langId3.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.langProId3.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.langProId3.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.dayOfWeek1.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.dayOfWeek1.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.dayOfWeek2.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.dayOfWeek2.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.dayOfWeek3.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.dayOfWeek3.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.dayOfWeek4.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.dayOfWeek4.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.dayOfWeek5.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.dayOfWeek5.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.dayOfWeek6.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.dayOfWeek6.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.dayOfWeek7.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.dayOfWeek7.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.timeZone1.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.timeZone1.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.timeZone2.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.timeZone2.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.timeZone3.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.timeZone3.value}
                </CustomTd>
                <CustomTd
                  textType={isResultError(row.result) ? 'error' : 'secondary'}
                  className={row.timeZone4.isError ? 'bg-systemWarningBg' : ''}
                >
                  {row.timeZone4.value}
                </CustomTd>
              </CustomTr>
            ))}
          </CustomTbody>
        </CustomTable>
      </div>
    </div>
  );
};

export default CsvTable;
