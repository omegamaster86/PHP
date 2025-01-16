export const csvHeaders = ['メールアドレス', '寄付者名', '寄付日', '寄付額', '寄付対象'] as const;

export const canRegisterText = '登録可能';

// CSVデータの型定義
export type CsvData = {
  mailaddress: string; // メールアドレス
  donatorName: string; // 寄付者名
  donatedDate: string; // 寄付日
  donationAmount: string; // 寄付額
  donationTarget: string; // 寄付対象
};

export type CsvFileData = {
  content: string[][];
  isSet: boolean;
};

// CSVテーブルの各行のデータ型
export type CsvTableRow = {
  // 読込結果とチェックボックスの状態
  id: number; // ID
  checked: boolean; // 選択
  result: string; // 読み込み結果
} & CsvData;

// CSVアップロードのプロパティの型定義
export type CsvUploadProps = {
  label: string; // ラベル
  readonly: boolean; // 読み取り専用かどうか
  csvUpload: (newCsvData: CsvFileData) => void; // CSVアップロード時のコールバック
};

// CSVダウンロードのプロパティの型定義
export type CsvDownloadProps = {
  header: typeof csvHeaders;
  filename: string;
  label: string;
};

export type FileHandler = {
  clearFile(): void;
};
