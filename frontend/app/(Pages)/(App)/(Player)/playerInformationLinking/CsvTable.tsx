import { CsvTableRow } from '@/app/(Pages)/(App)/(Player)/playerInformationLinking/shared/csv';
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
  header, // CSVテーブルのヘッダー
  handleInputChange, // チェックボックスの変更時の処理
  displayLinkButton, // 連携ボタンの表示を切り替える関数
  activationFlg, // 各種ボタンの表示を切り替える関数
  visibilityFlg, //CSVテーブルの表示切替フラグ 20240412
}: {
  content: CsvTableRow[];
  header: string[];
  handleInputChange: (rowId: number, name: string, value: string | boolean) => void;
  displayLinkButton: (flg: boolean) => void;
  activationFlg: boolean;
  visibilityFlg: boolean; //データが0件の場合でもヘッダーは表示させるためのフラグ 20240412
}) => {
  // エラーの有無を確認して背景色を変更
  const checkError = (error: string | boolean) => {
    return error !== false ? 'bg-systemWarningBg' : '';
  };

  const getErrorMessages = (row: CsvTableRow) => {
    const errorMessages = [
      row.playerIdError,
      row.oldPlayerIdError,
      row.playerNameError,
      row.mailaddressError,
    ].filter((x) => typeof x === 'string' && !!x);

    return errorMessages.join('\n');
  };

  if (!visibilityFlg) {
    return <div className='text-primaryText'></div>;
  }

  return (
    <div className='overflow-auto h-[331px] w-[1000px]'>
      <CustomTable>
        <CustomThead>
          {/* contentがundefinedまたは空の配列でないことを確認 */}
          {!content || content.length === 0 || activationFlg ? (
            <CustomTr>
              <CustomTh align='center' colSpan={header.length + 1}>
                読み込み結果
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
                      data.link !== '連携不可' ? handleInputChange(data.id, 'checked', true) : null,
                    );
                    content?.some((row) => row.link !== '連携不可') && displayLinkButton(true);
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
                    displayLinkButton(false);
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
            {header.map((header: any, index: any) =>
              header === '選手名' || header === 'メールアドレス' ? (
                <CustomTh key={index} className='w-[160px]'>
                  {header}
                </CustomTh>
              ) : (
                <CustomTh key={index}>{header}</CustomTh>
              ),
            )}
          </CustomTr>
        </CustomThead>
        <CustomTbody>
          {content.map((row, rowIndex) => {
            const textType = row.link === '連携不可' ? 'error' : 'secondary';
            const message = row.message && row.message !== '無効なデータ' ? `${row.message}\n` : '';
            const errorMessages = `${message}${getErrorMessages(row)}`;
            return (
              <CustomTr index={rowIndex} key={rowIndex}>
                <CustomTd align='center'>
                  <CustomCheckbox
                    id={`delete-${rowIndex}`}
                    label={''}
                    value={`delete-${rowIndex}`}
                    checked={row.checked}
                    readonly={row.link === '連携不可'}
                    onChange={(e) => {
                      handleInputChange(row.id, 'checked', e.target.checked);
                      // チェックボックスの変更により連携ボタンの表示を切り替える 20240525
                      let data = content.map((row) => row.checked.toString());
                      data[rowIndex] = e.target.checked.toString();
                      data.includes('true') ? displayLinkButton(true) : displayLinkButton(false);
                    }}
                  />
                </CustomTd>
                <CustomTd textType={textType}>{row.link}</CustomTd>
                <CustomTd textType={textType} className={checkError(row.playerIdError)}>
                  {row.playerId}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.oldPlayerIdError)}>
                  {row.oldPlayerId}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.playerNameError)} newLine>
                  {row.playerName}
                </CustomTd>
                <CustomTd textType={textType} className={checkError(row.mailaddressError)} newLine>
                  {row.mailaddress}
                </CustomTd>
                <CustomTd textType={textType} className='whitespace-pre-wrap'>
                  {errorMessages}
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
