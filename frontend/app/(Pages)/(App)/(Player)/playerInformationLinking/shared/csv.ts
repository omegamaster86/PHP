// CSVデータの型定義
export interface CsvData {
  link: string; // 連携
  playerId: string; // 選手ID
  playerIdError: string | false; // 選手IDエラー
  oldPlayerId: string; // JARA選手コード
  oldPlayerIdError: string | false; // JARA選手コードエラー
  playerName: string; // 選手名
  playerNameError: string | false; // 選手名エラー
  mailaddress: string; // メールアドレス
  mailaddressError: string | false; // メールアドレスエラー
  message: string; // メッセージ
}

// CSVテーブルの各行のデータ型
export interface CsvTableRow extends CsvData {
  id: number; // ID
  checked: boolean; // 選択
}

// CSVアップロードのプロパティの型定義
export interface CsvUploadProps {
  label: string; // ラベル
  readonly: boolean; // 読み取り専用かどうか
  csvUpload: (newCsvData: { content: Array<Array<string>>; isSet: boolean }) => void; // CSVアップロード時のコールバック
  resetActivationFlg: () => void; // アクティベーションフラグのリセット
  setActivationFlg: (flg: boolean) => void; // アクティベーションフラグのセット
}
// CSVダウンロードのプロパティの型定義
export interface CsvDownloadProps {
  data: any[];
  header: any[];
  filename: string;
  label: string;
}

// ファイル関連のアクションを扱うためのインターフェース
export interface FileHandler {
  clearFile(): void;
}
