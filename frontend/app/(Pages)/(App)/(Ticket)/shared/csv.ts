export const csvHeaders = [
  '購入日時',
  '購入者',
  'メールアドレス',
  '公演日',
  'チケット',
  '番号',
  'サブチケット',
  '枚数',
  '金額',
  '入場済数',
  'メールアドレス（アンケート）',
];

export const canRegisterText = '登録可能';

// CSVデータの型定義
export type CsvData = {
  purchasedTime: string; // 購入日時
  purchaserName: string; // 購入者
  mailaddress: string; // メールアドレス
  eventDate: string; // 公演日
  ticketName: string; // チケット名
  ticketNumber: string; // チケット番号
  subTicketName: string; // サブチケット
  ticketCount: string; // 枚数
  ticketAmount: string; // 金額
  admissionCount: string; // 入場済数
  questionnaireMailaddress: string; // メールアドレス（アンケート）
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

// Excelダウンロードのプロパティの型定義
export type ExcelDownloadProps = {
  fileUrl: string;
  filename: string;
  label: string;
};

export type FileHandler = {
  clearFile(): void;
};
