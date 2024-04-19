import React from 'react';
import CustomButton from '@/app/components/CustomButton';
import CustomCheckbox from '@/app/components/OriginalCheckbox';
import CustomTable from '@/app/components/CustomTable/Table';
import CustomThead from '@/app/components/CustomTable/Thead';
import CustomTbody from '@/app/components/CustomTable/Tbody';
import CustomTr from '@/app/components/CustomTable/Tr';
import CustomTh from '@/app/components/CustomTable/Th';
import CustomTd from '@/app/components/CustomTable/Td';
import Link from 'next/link';

// CSVテーブルの各行のデータ型
interface CsvTableRow {
  id: number; // ID
  checked: boolean; // 選択
  result: string; // 読み込み結果
  userId: string; // ユーザーID
  playerId: string; // 選手ID
  jaraPlayerId: string; // JARA選手コード
  playerName: string; // 選手名
  mailaddress: string; // メールアドレス
  teamId: string; // 所属団体ID
  teamName: string; // 所属団体名
  birthPlace: string; // 出身地
  residence: string; // 居住地
}

// CSVテーブルコンポーネント
const CsvTable = ({
  content, // CSVテーブルの各行のデータ
  header, // CSVテーブルのヘッダー
  handleInputChange, // チェックボックスの変更時の処理
  displayLinkButton, // 連携ボタンの表示を切り替える関数
  activationFlg, // 各種ボタンの表示を切り替える関数
}: {
  content: CsvTableRow[];
  header: string[];
  handleInputChange: (rowId: number, name: string, value: string | boolean) => void;
  displayLinkButton: (flg: boolean) => void;
  activationFlg: boolean;
}) => {
  const isResultError = (result: string) => {
    return result.startsWith('無効データ');
  };

  const isResultWarning = (result: string) => {
    return (
      result.startsWith('選手未登録のため選手登録後、所属選手登録を実施') ||
      result.startsWith('ユーザー未登録')
    );
  };

  return content.length === 0 ? (
    <div className='text-primaryText'>CSVファイルをアップロードしてください。</div>
  ) : (
    <div className='overflow-auto h-[331px] w-[800px]'>
      <CustomTable>
        <CustomThead>
          <CustomTr>
            <CustomTh colSpan={header.length + 1}>
              <div className='text-primary-500 py-2 px-4 h-[60px] flex justify-center items-center font-bold relative'>
                <>読み込み結果</>
                <div className={`absolute left-[10px]`}>
                  <CustomButton
                    buttonType='primary'
                    disabled={activationFlg}
                    className='m-auto w-[100px] h-[36px] text-small p-[0px]'
                    onClick={() => {
                      content?.map((data) =>
                        data.result.startsWith('無効データ')
                          ? null
                          : handleInputChange(data.id, 'checked', true),
                      );
                      content?.some((row) => row.result !== '連携不可') && displayLinkButton(true);
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
            </CustomTh>
          </CustomTr>
          <CustomTr>
            <CustomTh key={0}>選択</CustomTh>
            {header.map((header: any, index: any) => (
              <CustomTh key={index}>{header}</CustomTh>
            ))}
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
                  readonly={row.result.startsWith('無効データ') || activationFlg}
                  onChange={(e) => {
                    // チェックボックスの変更時の処理
                    handleInputChange(row.id, 'checked', e.target.checked);
                    // チェックボックスの変更により連携ボタンの表示を切り替える
                    e.target.checked ? displayLinkButton(true) : null;
                  }}
                ></CustomCheckbox>
              </CustomTd>
              <CustomTd
                textType={
                  isResultError(row.result)
                    ? 'error'
                    : isResultWarning(row.result)
                      ? 'warning'
                      : 'secondary'
                }
              >
                {row.result}
              </CustomTd>
              <CustomTd textType={isResultError(row.result) ? 'error' : 'secondary'}>
                {row.userId}
              </CustomTd>
              <CustomTd textType={isResultError(row.result) ? 'error' : 'secondary'}>
                <Link
                  href={row.playerId ? `/playerInformationRef?player_id=${row.playerId}` : ``}
                  className='text-primary-500'
                  target='_blank'
                >
                  {row.playerId}
                </Link>
              </CustomTd>
              <CustomTd textType={isResultError(row.result) ? 'error' : 'secondary'}>
                <Link
                  href={row.playerId ? `/playerInformationRef?player_id=${row.playerId}` : ``}
                  className='text-primary-500'
                  target='_blank'
                >
                  {row.jaraPlayerId}
                </Link>
              </CustomTd>
              <CustomTd textType={isResultError(row.result) ? 'error' : 'secondary'}>
                {row.playerName}
              </CustomTd>
              <CustomTd textType={isResultError(row.result) ? 'error' : 'secondary'}>
                {row.mailaddress}
              </CustomTd>
              <CustomTd textType={isResultError(row.result) ? 'error' : 'secondary'}>
                {row.teamId}
              </CustomTd>
              <CustomTd textType={isResultError(row.result) ? 'error' : 'secondary'}>
                {row.teamName}
              </CustomTd>
              <CustomTd textType={isResultError(row.result) ? 'error' : 'secondary'}>
                {row.birthPlace}
              </CustomTd>
              <CustomTd textType={isResultError(row.result) ? 'error' : 'secondary'}>
                {row.residence}
              </CustomTd>
            </CustomTr>
          ))}
        </CustomTbody>
      </CustomTable>
    </div>
  );
};

export default CsvTable;
