'use client';

import CsvHandler from '@/app/(Pages)/(App)/(Donation)/components/CsvHandler';
import CsvTable from '@/app/(Pages)/(App)/(Donation)/components/CsvTable';
import { HowToLoad } from '@/app/(Pages)/(App)/(Donation)/components/HowToLoad';
import { HowToRegister } from '@/app/(Pages)/(App)/(Donation)/components/HowToRegister';
import {
  canRegisterText,
  CsvData,
  CsvDownloadProps,
  CsvFileData,
  csvHeaders,
  CsvTableRow,
  CsvUploadProps,
  FileHandler,
} from '@/app/(Pages)/(App)/(Donation)/shared/csv';
import { CustomButton, CustomTitle, ErrorBox } from '@/app/components';
import { useUserType } from '@/app/hooks/useUserType';
import { fetcher } from '@/app/lib/swr';
import { DonationRequest } from '@/app/types';
import Validator from '@/app/utils/validator';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import useSWRMutation from 'swr/mutation';

const sendMutateRequest = (
  url: string,
  trigger: {
    arg: {
      csvData: CsvData[];
    };
  },
) => {
  return fetcher({
    url,
    method: 'POST',
    data: {
      csvData: trigger.arg.csvData,
    },
  });
};

export default function DonationBulkRegister() {
  const router = useRouter();
  const fileUploaderRef = useRef<FileHandler>(null);
  const mutation = useSWRMutation('api/insertDonationHistory', sendMutateRequest);
  useUserType({
    onSuccess: (userType) => {
      const hasAuthority =
        userType.isAdministrator || userType.isJara || userType.isPrefBoatOfficer;

      if (!hasAuthority) {
        router.replace('/mypage/top');
      }
    },
  });

  const [csvFileData, setCsvFileData] = useState<CsvFileData>({ content: [], isSet: false });
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [csvValidateResults, setCsvValidateResults] = useState<CsvTableRow[]>([]);

  const resultHeader = ['選択', '読み込み結果', ...csvHeaders];

  const reset = () => {
    setCsvFileData({ content: [], isSet: false });
    fileUploaderRef?.current?.clearFile();
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

  const handleValidate = (row: string[]) => {
    const validationMessages: string[] = [];

    const emailValidationMessage = Validator.validateEmailFormat2(row[0]);
    if (emailValidationMessage) {
      validationMessages.push(emailValidationMessage);
    }
    if (!row[2]) {
      validationMessages.push('寄付日が未入力です');
    }
    if (!row[3]) {
      validationMessages.push('寄付額が未入力です');
    }
    if (!row[4]) {
      validationMessages.push('寄付対象が未入力です');
    }

    return validationMessages;
  };

  const getJsonRow = (row: string[], index: number): CsvTableRow => {
    const expectedColumnCount = csvHeaders.length; // 期待する列数
    if (row.length !== expectedColumnCount) {
      return {
        id: index,
        checked: false,
        result: 'CSVのフォーマットが不正です',
        mailaddress: '',
        donatorName: '',
        donatedDate: '',
        donationAmount: '',
        donationTarget: '',
      };
    } else {
      const errors = handleValidate(row);
      const hasErrors = !!errors.length;

      return {
        id: index,
        checked: !hasErrors,
        result: hasErrors ? handleValidate(row).join('\n') : canRegisterText,
        mailaddress: row[0],
        donatorName: row[1],
        donatedDate: row[2],
        donationAmount: row[3],
        donationTarget: row[4],
      };
    }
  };

  const register = async () => {
    if (mutation.isMutating) {
      return;
    }

    if (!csvValidateResults.length) {
      window.alert('データが読み込まれていません。');
      return;
    }

    const reqCsvData = csvValidateResults.reduce<DonationRequest['csvData']>((acc, row) => {
      if (row.checked) {
        acc.push({
          rowNumber: row.id + 1,
          mailaddress: row.mailaddress,
          donatorName: row.donatorName,
          donatedDate: row.donatedDate,
          donationAmount: row.donationAmount,
          donationTarget: row.donationTarget,
        });
      }

      return acc;
    }, []);

    if (!reqCsvData.length) {
      window.alert('1つ以上のデータを選択してください。');
      return;
    }

    const ok = window.confirm('登録を実施しますか？');
    if (!ok) {
      return;
    }

    const sendData = {
      csvData: reqCsvData,
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

  // CSVダウンロードのプロパティ
  const csvDownloadProps: CsvDownloadProps = {
    header: csvHeaders,
    filename: '寄付履歴一括登録ファイル.csv',
    label: 'CSVフォーマット出力',
  };

  return (
    <>
      <CustomTitle displayBack>寄付履歴一括登録</CustomTitle>
      <ErrorBox errorText={errorMessages} />

      <div className='flex flex-row justify-start'>
        <CsvHandler
          csvUploadProps={csvUploadProps}
          csvDownloadProps={csvDownloadProps}
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

      <div className='flex flex-col items-center justify-center gap-[8px] md:flex-row'>
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
