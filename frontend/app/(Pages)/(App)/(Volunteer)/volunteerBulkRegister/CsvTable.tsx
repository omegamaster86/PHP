import {
  canRegisterText,
  CsvTableRow,
} from '@/app/(Pages)/(App)/(Volunteer)/volunteerBulkRegister/shared/csv';
import CustomButton from '@/app/components/CustomButton';
import CustomTable from '@/app/components/CustomTable/Table';
import CustomTbody from '@/app/components/CustomTable/Tbody';
import CustomTd from '@/app/components/CustomTable/Td';
import CustomTh from '@/app/components/CustomTable/Th';
import CustomThead from '@/app/components/CustomTable/Thead';
import CustomTr from '@/app/components/CustomTable/Tr';
import CustomCheckbox from '@/app/components/OriginalCheckbox';

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
    return result !== canRegisterText;
  };

  // エラーの有無を確認して背景色を変更
  const checkError = (error: string | boolean) => {
    return error !== false ? 'bg-systemWarningBg' : '';
  };

  const getErrorMessages = (row: CsvTableRow) => {
    const errorMessages = [
      row.userId.error,
      row.volunteerName.error,
      row.dateOfBirth.error,
      row.sexId.error,
      row.residenceCountryId.error,
      row.residencePrefectureId.error,
      row.mailaddress.error,
      row.telephoneNumber.error,
      row.clothesSizeId.error,
      row.disTypeId1.error,
      row.disTypeId2.error,
      row.disTypeId3.error,
      row.qualId1.error,
      row.qualId2.error,
      row.qualId3.error,
      row.qualId4.error,
      row.qualId5.error,
      row.langId1.error,
      row.langProId1.error,
      row.langId2.error,
      row.langProId2.error,
      row.langId3.error,
      row.langProId3.error,
      row.dayOfWeek1.error,
      row.dayOfWeek2.error,
      row.dayOfWeek3.error,
      row.dayOfWeek4.error,
      row.dayOfWeek5.error,
      row.dayOfWeek6.error,
      row.dayOfWeek7.error,
      row.timeZone1.error,
      row.timeZone2.error,
      row.timeZone3.error,
      row.timeZone4.error,
    ].filter((x) => typeof x === 'string' && !!x);

    return errorMessages.join('\n');
  };

  if (!visibilityFlg) {
    return null;
  }

  return (
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
            {content.map((row, rowIndex) => {
              const textType = isResultError(row.result) ? 'error' : 'secondary';
              const errorMessages = getErrorMessages(row) || row.result;

              return (
                <CustomTr key={rowIndex}>
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
                        let data = content.map((row) => row.checked.toString());
                        data[rowIndex] = e.target.checked.toString();
                        data.includes('true') ? displayLinkButton(true) : displayLinkButton(false);
                      }}
                    />
                  </CustomTd>
                  <CustomTd textType={textType} className='whitespace-pre-wrap'>
                    {errorMessages}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.userId.error)}>
                    {row.userId.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.volunteerName.error)}>
                    {row.volunteerName.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.dateOfBirth.error)}>
                    {row.dateOfBirth.value}
                  </CustomTd>
                  <CustomTd
                    textType={textType}
                    className={
                      checkError(row.residenceCountryId.error) ||
                      checkError(row.residencePrefectureId.error)
                    }
                  >
                    {/* 日本の場合のみ都道府県を表示 */}
                    {row.residenceCountryId.value}
                    {/* 不具合修正の一環で都道府県も一律表示するように変更 20240412 */}
                    {row.residencePrefectureId.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.sexId.error)}>
                    {row.sexId.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.clothesSizeId.error)}>
                    {row.clothesSizeId.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.mailaddress.error)}>
                    {row.mailaddress.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.telephoneNumber.error)}>
                    {row.telephoneNumber.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.disTypeId1.error)}>
                    {row.disTypeId1.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.disTypeId2.error)}>
                    {row.disTypeId2.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.disTypeId3.error)}>
                    {row.disTypeId3.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.qualId1.error)}>
                    {row.qualId1.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.qualId2.error)}>
                    {row.qualId2.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.qualId3.error)}>
                    {row.qualId3.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.qualId4.error)}>
                    {row.qualId4.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.qualId5.error)}>
                    {row.qualId5.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.langId1.error)}>
                    {row.langId1.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.langProId1.error)}>
                    {row.langProId1.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.langId2.error)}>
                    {row.langId2.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.langProId2.error)}>
                    {row.langProId2.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.langId3.error)}>
                    {row.langId3.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.langProId3.error)}>
                    {row.langProId3.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.dayOfWeek1.error)}>
                    {row.dayOfWeek1.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.dayOfWeek2.error)}>
                    {row.dayOfWeek2.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.dayOfWeek3.error)}>
                    {row.dayOfWeek3.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.dayOfWeek4.error)}>
                    {row.dayOfWeek4.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.dayOfWeek5.error)}>
                    {row.dayOfWeek5.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.dayOfWeek6.error)}>
                    {row.dayOfWeek6.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.dayOfWeek7.error)}>
                    {row.dayOfWeek7.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.timeZone1.error)}>
                    {row.timeZone1.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.timeZone2.error)}>
                    {row.timeZone2.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.timeZone3.error)}>
                    {row.timeZone3.value}
                  </CustomTd>
                  <CustomTd textType={textType} className={checkError(row.timeZone4.error)}>
                    {row.timeZone4.value}
                  </CustomTd>
                </CustomTr>
              );
            })}
          </CustomTbody>
        </CustomTable>
      </div>
    </div>
  );
};

export default CsvTable;
