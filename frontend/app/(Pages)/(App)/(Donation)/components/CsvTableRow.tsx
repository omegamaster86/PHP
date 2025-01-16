import {
  canRegisterText,
  type CsvTableRow as Row,
} from '@/app/(Pages)/(App)/(Donation)/shared/csv';
import CustomTd from '@/app/components/CustomTable/Td';
import CustomTr from '@/app/components/CustomTable/Tr';
import CustomCheckbox from '@/app/components/OriginalCheckbox';

type Props = {
  rowIndex: number;
  row: Row;
  activationFlg: boolean;
  onChangeCheckbox: (params: { rowId: number; currentChecked: boolean }) => void;
};

export const CsvTableRow: React.FC<Props> = (props) => {
  const { rowIndex, row, activationFlg, onChangeCheckbox } = props;

  const isResultError = row.result !== canRegisterText;
  const textType = isResultError ? 'error' : 'secondary';

  const items: {
    key: keyof Row;
    value: string;
  }[] = [
    { key: 'result', value: row.result },
    { key: 'mailaddress', value: row.mailaddress },
    { key: 'donatorName', value: row.donatorName },
    { key: 'donatedDate', value: row.donatedDate },
    { key: 'donationAmount', value: row.donationAmount },
    { key: 'donationTarget', value: row.donationTarget },
  ];

  return (
    <CustomTr index={rowIndex}>
      <CustomTd align='center'>
        <CustomCheckbox
          id={`delete-${rowIndex}`}
          value={`delete-${rowIndex}`}
          checked={row.checked}
          readonly={isResultError || activationFlg}
          onChange={(e) => {
            // チェックボックスの変更時の処理
            const rowId = row.id;
            const currentChecked = e.target.checked;
            onChangeCheckbox({
              rowId,
              currentChecked,
            });
          }}
        />
      </CustomTd>
      {items.map((x) => {
        return (
          <CustomTd
            key={`${rowIndex}-${x.key}`}
            textType={textType}
            className='whitespace-pre-wrap'
          >
            {x.value}
          </CustomTd>
        );
      })}
    </CustomTr>
  );
};
