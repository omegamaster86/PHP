import { CsvTableRow } from '@/app/(Pages)/(App)/(Donation)/components/CsvTableRow';
import {
  canRegisterText,
  type CsvTableRow as Row,
} from '@/app/(Pages)/(App)/(Donation)/shared/csv';
import CustomButton from '@/app/components/CustomButton';
import CustomTable from '@/app/components/CustomTable/Table';
import CustomTbody from '@/app/components/CustomTable/Tbody';
import CustomTh from '@/app/components/CustomTable/Th';
import CustomThead from '@/app/components/CustomTable/Thead';
import CustomTr from '@/app/components/CustomTable/Tr';

type Props = {
  content: Row[];
  header: string[];
  handleInputChange: (rowId: number, name: string, value: string | boolean) => void;
};

export const CsvTable: React.FC<Props> = (props) => {
  const {
    content, // CSVテーブルの各行のデータ
    header, // CSVテーブルのヘッダー
    handleInputChange, // チェックボックスの変更時の処理
  } = props;

  const activationFlg = false; // 各種ボタンの表示を切り替える関数

  const selectAll = () => {
    content?.forEach((data) => {
      // 「登録可能」でない場合はスキップ
      if (data.result !== canRegisterText) {
        return;
      }

      handleInputChange(data.id, 'checked', true);
    });
  };

  const unselectAll = () => {
    content?.forEach((data) => handleInputChange(data.id, 'checked', false));
  };

  const handleChangeCheckbox = (params: { rowId: number; currentChecked: boolean }) => {
    const { rowId, currentChecked } = params;
    handleInputChange(rowId, 'checked', currentChecked);
  };

  return (
    <div className='overflow-auto h-80'>
      <CustomTable>
        <CustomThead>
          <CustomTr>
            <CustomTh colSpan={header.length}>
              <div className='grid grid-cols-3 items-center text-primary-500 py-2 px-4 h-[60px] font-bold'>
                <div className='flex justify-start gap-2'>
                  <CustomButton
                    buttonType='primary'
                    disabled={activationFlg}
                    className='w-[100px] h-9 text-small'
                    onClick={selectAll}
                  >
                    全選択
                  </CustomButton>
                  <CustomButton
                    buttonType='primary'
                    disabled={activationFlg}
                    className='w-[120px] h-9 text-small'
                    onClick={unselectAll}
                  >
                    全選択解除
                  </CustomButton>
                </div>

                <span className='col-span-1'>読み込み結果</span>
              </div>
            </CustomTh>
          </CustomTr>
          <CustomTr>
            {header.map((h, index) => (
              <CustomTh key={index}>{h}</CustomTh>
            ))}
          </CustomTr>
        </CustomThead>
        <CustomTbody>
          {content.map((row, rowIndex) => (
            <CsvTableRow
              key={rowIndex}
              rowIndex={rowIndex}
              row={row}
              activationFlg={activationFlg}
              onChangeCheckbox={handleChangeCheckbox}
            />
          ))}
        </CustomTbody>
      </CustomTable>
    </div>
  );
};

export default CsvTable;
