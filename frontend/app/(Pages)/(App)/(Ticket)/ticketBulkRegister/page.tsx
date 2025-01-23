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
import { CustomButton, CustomDropdown, CustomTitle, ErrorBox } from '@/app/components';
import { fetcher } from '@/app/lib/swr';
import { TeketSalesHistoryRequest, TournamentOption } from '@/app/types';
import { TEMPLATE_URL } from '@/app/utils/imageUrl';
import Validator from '@/app/utils/validator';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import useSWRMutation from 'swr/mutation';

const sendMutateRequest = (
  url: string,
  trigger: {
    arg: {
      reqData: TeketSalesHistoryRequest;
    };
  },
) => {
  return fetcher({
    url,
    method: 'POST',
    data: {
      fileName: trigger.arg.reqData.fileName,
      tournId: trigger.arg.reqData.tournId,
      csvData: trigger.arg.reqData.csvData,
    },
  });
};

export default function TicketBulkRegister() {
  const router = useRouter();
  const fileUploaderRef = useRef<FileHandler>(null);
  const [tournId, setTournId] = useState(0);
  const [csvFileData, setCsvFileData] = useState<CsvFileData>({
    content: [],
    fileName: '',
    isSet: false,
  });
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [csvValidateResults, setCsvValidateResults] = useState<CsvTableRow[]>([]);

  const { data } = useSWRImmutable({ url: 'api/getTournaments' }, fetcher<TournamentOption[]>, {
    revalidateOnMount: true,
  });
  const mutation = useSWRMutation('api/insertTeketSalesHistoryCsvUpload', sendMutateRequest);
  const resultHeader = ['選択', '読み込み結果', ...csvHeaders];

  const tournamentOptions =
    data?.result.map((x) => ({
      key: x.tournId,
      value: x.tournName,
    })) ?? [];

  const reset = () => {
    setCsvFileData({ content: [], fileName: '', isSet: false });
    fileUploaderRef?.current?.clearFile();
    setTournId(0);
    setCsvValidateResults([]);
    setErrorMessages([]);
  };

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

  const rowToCsvData = (row: string[]): CsvData => {
    const [
      orderNumber,
      purchasedTime,
      purchaserName,
      mailaddress,
      eventDate,
      ticketName,
      ticketNumber,
      subTicketName,
      ticketCount,
      ticketAmount,
      admissionCount,
      questionnaireMailaddress,
    ] = row;

    return {
      orderNumber,
      purchasedTime,
      purchaserName,
      mailaddress,
      eventDate,
      ticketName,
      ticketNumber,
      subTicketName,
      ticketCount,
      ticketAmount,
      admissionCount,
      questionnaireMailaddress,
    };
  };

  const handleValidate = (csvData: CsvData) => {
    const validateErrors: string[] = [];

    if (!csvData.purchasedTime) {
      validateErrors.push('購入日時が未入力です');
    }
    if (!csvData.purchaserName) {
      validateErrors.push('購入者が未入力です');
    }
    if (!csvData.ticketCount) {
      validateErrors.push('枚数が未入力です');
    }
    if (!csvData.ticketAmount) {
      validateErrors.push('金額が未入力です');
    }
    if (!csvData.admissionCount) {
      validateErrors.push('入場済数が未入力です');
    }
    const emailValidationMessage = Validator.validateEmailFormat2(csvData.questionnaireMailaddress);
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
        orderNumber: '',
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
      const csvData = rowToCsvData(row);
      const errors = handleValidate(csvData);
      const hasErrors = !!errors.length;

      return {
        id: index,
        checked: !hasErrors,
        result: hasErrors ? errors.join('\n') : canRegisterText,
        orderNumber: csvData.orderNumber,
        purchasedTime: csvData.purchasedTime,
        purchaserName: csvData.purchaserName,
        mailaddress: csvData.mailaddress,
        eventDate: csvData.eventDate,
        ticketName: csvData.ticketName,
        ticketNumber: csvData.ticketNumber,
        subTicketName: csvData.subTicketName,
        ticketCount: csvData.ticketCount,
        ticketAmount: csvData.ticketAmount,
        admissionCount: csvData.admissionCount,
        questionnaireMailaddress: csvData.questionnaireMailaddress,
      };
    }
  };

  const register = async () => {
    if (!tournId) {
      window.alert('大会名を選択してください。');
      return;
    }

    if (!csvValidateResults.length) {
      window.alert('データが読み込まれていません。');
      return;
    }

    const reqCsvData = csvValidateResults.reduce<TeketSalesHistoryRequest['csvData']>(
      (acc, row) => {
        if (row.checked) {
          acc.push({
            rowNumber: row.id + 1,
            orderNumber: row.orderNumber,
            purchasedTime: row.purchasedTime,
            purchaserName: row.purchaserName,
            mailaddress: row.mailaddress,
            eventDate: row.eventDate,
            ticketName: row.ticketName,
            ticketNumber: row.ticketNumber,
            subTicketName: row.subTicketName,
            ticketCount: row.ticketCount,
            ticketAmount: row.ticketAmount,
            admissionCount: row.admissionCount,
            questionnaireMailaddress: row.questionnaireMailaddress,
          });
        }

        return acc;
      },
      [],
    );

    if (!reqCsvData.length) {
      window.alert('1つ以上のデータを選択してください。');
      return;
    }

    const ok = window.confirm('登録を実施しますか？');
    if (!ok) {
      return;
    }

    const reqData: TeketSalesHistoryRequest = {
      fileName: csvFileData.fileName,
      tournId,
      csvData: reqCsvData,
    };
    const sendData = {
      reqData,
    };

    await mutation.trigger(sendData, {
      onSuccess: () => {
        reset();
        window.alert('登録を完了しました。');
      },
      onError: (error) => {
        const errorMessage = error?.response?.data?.message || '登録に失敗しました。';
        setErrorMessages([errorMessage]);
      },
    });
  };

  const handleLoadCsv = () => {
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
    fileUrl: `${TEMPLATE_URL}チケット購入履歴一括登録用CSV作成ツール.xlsm`,
    label: 'Excelフォーマット出力',
  };

  return (
    <>
      <CustomTitle displayBack>チケット購入履歴一括登録</CustomTitle>
      <ErrorBox errorText={errorMessages} />

      <div className='flex flex-col gap-[10px] w-[300px]'>
        <CustomDropdown<number>
          id='tourn'
          label='大会名'
          displayHelp
          value={tournId}
          options={tournamentOptions}
          onChange={(v) => setTournId(v)}
          className='w-[300px]'
        />
      </div>

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
