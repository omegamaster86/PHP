import React from 'react';
import CustomButton from '@/app/components/CustomButton';
import CustomCheckbox from '@/app/components/OriginalCheckbox';
import CustomTable from '@/app/components/CustomTable/Table';
import CustomThead from '@/app/components/CustomTable/Thead';
import CustomTbody from '@/app/components/CustomTable/Tbody';
import CustomTr from '@/app/components/CustomTable/Tr';
import CustomTh from '@/app/components/CustomTable/Th';
import CustomTd from '@/app/components/CustomTable/Td';

// CSVテーブルの各行のデータ型
interface CsvTableRow {
  id: number; // ID
  checked: boolean; // 選択
  link: string; // 連携
  playerId: string; // 選手ID
  oldPlayerId: string; // 既存選手ID
  playerName: string; // 選手名
  mailaddress: string; // メールアドレス
  message: string; // メッセージ
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
  return content.length === 0 ? (
    <div className='text-primaryText'></div>
  ) : (
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
          {content.map((row, rowIndex) => (
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
                    e.target.checked ? displayLinkButton(true) : null;
                  }}
                ></CustomCheckbox>
              </CustomTd>
              <CustomTd textType={row.link === '連携不可' ? 'error' : 'secondary'}>
                {row.link}
              </CustomTd>
              <CustomTd textType={row.link === '連携不可' ? 'error' : 'secondary'}>
                {row.playerId}
              </CustomTd>
              <CustomTd textType={row.link === '連携不可' ? 'error' : 'secondary'}>
                {row.oldPlayerId}
              </CustomTd>
              <CustomTd textType={row.link === '連携不可' ? 'error' : 'secondary'} newLine={true}>
                {row.playerName}
              </CustomTd>
              <CustomTd textType={row.link === '連携不可' ? 'error' : 'secondary'} newLine={true}>
                {row.mailaddress}
              </CustomTd>
              <CustomTd textType={row.link === '連携不可' ? 'error' : 'secondary'}>
                {row.message}
              </CustomTd>
            </CustomTr>
          ))}
        </CustomTbody>
      </CustomTable>
    </div>
  );
};

export default CsvTable;