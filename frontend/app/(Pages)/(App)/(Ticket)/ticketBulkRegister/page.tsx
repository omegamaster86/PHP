'use client';

import CsvHandler from '@/app/(Pages)/(App)/(Ticket)/components/CsvHandler';
import CsvTable from '@/app/(Pages)/(App)/(Ticket)/components/CsvTable';
import { HowToLoad } from '@/app/(Pages)/(App)/(Ticket)/components/HowToLoad';
import { HowToRegister } from '@/app/(Pages)/(App)/(Ticket)/components/HowToRegister';
import {
  canRegisterText,
  CsvData,
  CsvFileData,
  csvHeaders,
  CsvTableRow,
  CsvUploadProps,
  ExcelDownloadProps,
  FileHandler,
} from '@/app/(Pages)/(App)/(Ticket)/shared/csv';
import { CustomButton, CustomTitle, ErrorBox } from '@/app/components';
import { fetcher } from '@/app/lib/swr';
import Validator from '@/app/utils/validator';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import useSWRMutation from 'swr/mutation';

const sendMutateRequest = (
  url: string,
  trigger: {
    arg: {
      csvDataList: CsvData[];
    };
  },
) => {
  return fetcher({
    url,
    method: 'POST',
    data: {
      csvDataList: trigger.arg.csvDataList,
    },
  });
};

export default function TicketBulkRegister() {
  const router = useRouter();
  const fileUploaderRef = useRef<FileHandler>(null);
  const mutation = useSWRMutation('api/registerTicketCsvData', sendMutateRequest);

  const [csvFileData, setCsvFileData] = useState<CsvFileData>({ content: [], isSet: false });
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [csvValidateResults, setCsvValidateResults] = useState<CsvTableRow[]>([]);

  const resultHeader = ['選択', '読み込み結果', ...csvHeaders];

  // CSVファイルのアップロードを処理する関数
  const handleCsvUpload = (newCsvData: CsvFileData) => {
    setCsvFileData(newCsvData);
  };

  // CSVテーブル内の入力変更を処理する関数
  const handleInputChange = (rowId: number, name: string, value: string | boolean) => {
    setCsvValidateResults((prevRows) =>
      prevRows.map((row, index) => (index === rowId ? { ...row, [name]: value } : row)),
    );
  };

  const handleValidate = (row: string[]) => {
    const validateErrors: string[] = [];
    if (!row[0]) {
      validateErrors.push('購入日時が未入力です');
    }
    if (!row[1]) {
      validateErrors.push('購入者が未入力です');
    }
    if (!row[7]) {
      validateErrors.push('枚数が未入力です');
    }
    if (!row[8]) {
      validateErrors.push('金額が未入力です');
    }
    if (!row[9]) {
      validateErrors.push('入場済数が未入力です');
    }
    const emailValidationMessage = Validator.validateEmailFormat2(row[10]);
    if (emailValidationMessage) {
      validateErrors.push(emailValidationMessage);
    }

    return validateErrors;
  };

  const getJsonRow = (row: string[], index: number): CsvTableRow => {
    const expectedColumnCount = csvHeaders.length; // 期待する列数
    if (row.length !== expectedColumnCount) {
      return {
        id: index,
        checked: false,
        result: 'CSVのフォーマットが不正です',
        purchasedTime: '',
        purchaserName: '',
        mailaddress: '',
        eventDate: '',
        ticketName: '',
        ticketNumber: '',
        subTicketName: '',
        ticketCount: '',
        ticketAmount: '',
        admissionCount: '',
        questionnaireMailaddress: '',
      };
    } else {
      const errors = handleValidate(row);
      const hasErrors = !!errors.length;

      return {
        id: index,
        checked: !hasErrors,
        result: hasErrors ? handleValidate(row).join('\n') : canRegisterText,
        purchasedTime: row[0],
        purchaserName: row[1],
        mailaddress: row[2],
        eventDate: row[3],
        ticketName: row[4],
        ticketNumber: row[5],
        subTicketName: row[6],
        ticketCount: row[7],
        ticketAmount: row[8],
        admissionCount: row[9],
        questionnaireMailaddress: row[10],
      };
    }
  };

  const register = async () => {
    if (!csvValidateResults.length) {
      window.alert('データが読み込まれていません。');
      return;
    }

    const ok = window.confirm('登録を実施しますか？');
    if (ok) {
      const sendData = {
        csvDataList: csvValidateResults,
      };

      await mutation.trigger(sendData, {
        onSuccess: () => {
          setCsvFileData({ content: [], isSet: false });
          fileUploaderRef?.current?.clearFile();
          window.alert('登録を完了しました。');
        },
        onError: (error) => {
          //メール送信に失敗した場合、エラーメッセージを表示
          setErrorMessages([...error?.response?.data]);
        },
      });
    }
  };

  const handleLoadCsv = () => {
    // ファイルが読み込まれていない場合
    if (!csvFileData.isSet) {
      setErrorMessages(['ファイルを選択してください。']);
      return;
    }

    // csvValidateResultsが1つ以上の場合、確認メッセージを表示
    if (csvValidateResults.length > 0) {
      const ok = window.confirm(
        '読み込み結果に表示されているデータはクリアされます。よろしいですか？',
      );
      if (!ok) {
        return;
      }
    }

    const specifiedHeader = csvHeaders.join(','); // 指定のヘッダー文字列
    const header = csvFileData?.content?.[0]?.join(','); // 1行目を,で結合
    const isHeaderMatch = header === specifiedHeader; // ヘッダーが指定の文字列と一致するか確認

    // csvFileData.contentが空の場合 | ヘッダーのみの場合
    if (!csvFileData.content.length || (isHeaderMatch && csvFileData.content.length === 1)) {
      setErrorMessages(['読み込むデータがありません。']);
      setCsvValidateResults([]);
      return;
    }

    const results = csvFileData.content
      ?.filter(
        (x) =>
          // 1列以上のデータを抽出. 空行を除外するが、何らかの文字が入っている場合は抽出する
          x.length > 0 && x.some((y) => y.length > 0),
      )
      .slice(isHeaderMatch ? 1 : 0) // ヘッダー行が一致する場合は1行目をスキップ
      .map((row, index) => getJsonRow(row, index));

    setCsvValidateResults(results);
    setErrorMessages([]);
  };

  // CSVアップロードのプロパティ
  const csvUploadProps: CsvUploadProps = {
    label: '読み込みCSVファイル',
    readonly: false,
    csvUpload: handleCsvUpload,
  };

  // Excelダウンロードのプロパティ
  const excelDownloadProps: ExcelDownloadProps = {
    // TODO: サンプルファイルのURLを修正する
    fileUrl: '/example.xlsx',
    filename: 'チケット購入履歴一括登録ファイル.xlsx',
    label: 'Excelフォーマット出力',
  };

  return (
    <>
      <CustomTitle displayBack>チケット購入履歴一括登録</CustomTitle>
      <ErrorBox errorText={errorMessages} />

      <div className='flex flex-row justify-start'>
        <CsvHandler
          csvUploadProps={csvUploadProps}
          excelDownloadProps={excelDownloadProps}
          ref={fileUploaderRef}
        />
      </div>

      <div className='flex flex-col gap-[20px]'>
        {/* 読み込みボタンの表示 */}
        <div className='flex flex-col gap-[4px] items-center'>
          <p className='mb-1 text-systemErrorText'>
            <HowToLoad />
          </p>
          <CustomButton buttonType='primary' onClick={handleLoadCsv}>
            読み込む
          </CustomButton>
        </div>
      </div>

      {/* 読み込み結果の表示 */}
      <div className='flex flex-col items-center'>
        <p className='mb-1 text-systemErrorText'>
          <HowToRegister />
        </p>
      </div>
      {!!csvValidateResults.length && (
        <CsvTable
          content={csvValidateResults}
          header={resultHeader}
          handleInputChange={handleInputChange}
        />
      )}

      <div className='flex flex-row justify-center gap-[8px]'>
        <CustomButton buttonType='secondary' onClick={router.back}>
          戻る
        </CustomButton>

        <CustomButton buttonType='primary' onClick={register}>
          登録
        </CustomButton>
      </div>
    </>
  );
}
