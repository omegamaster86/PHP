export const canRegisterText = '登録可能データ';

export type MasterData = {
  id: number;
  name: string;
};

// CSVデータの型定義
type CsvData = {
  userId: {
    value: string;
    error: string | false;
  }; // ユーザーID
  volunteerName: {
    value: string;
    error: string | false;
  }; // 氏名
  dateOfBirth: {
    value: string;
    error: string | false;
  }; // 生年月日
  sexId: {
    key: string;
    value: string;
    error: string | false;
  }; // 性別
  residenceCountryId: {
    key: string;
    value: string;
    error: string | false;
  }; // 居住国
  residencePrefectureId: {
    key: string;
    value: string;
    error: string | false;
  }; // 居住都道府県
  mailaddress: {
    value: string;
    error: string | false;
  }; // メールアドレス
  telephoneNumber: {
    value: string;
    error: string | false;
  }; // 電話番号
  clothesSizeId: {
    key: string;
    value: string;
    error: string | false;
  }; // 服サイズ
  disTypeId1: {
    key: string;
    value: string;
    error: string | false;
  }; // PR1
  disTypeId2: {
    key: string;
    value: string;
    error: string | false;
  }; // PR2
  disTypeId3: {
    key: string;
    value: string;
    error: string | false;
  }; // PR3
  qualId1: {
    key: string;
    value: string;
    error: string | false;
  }; // 保有資格1
  qualId2: {
    key: string;
    value: string;
    error: string | false;
  }; // 保有資格2
  qualId3: {
    key: string;
    value: string;
    error: string | false;
  }; // 保有資格3
  qualId4: {
    key: string;
    value: string;
    error: string | false;
  }; // 保有資格4
  qualId5: {
    key: string;
    value: string;
    error: string | false;
  }; // 保有資格5
  langId1: {
    key: string;
    value: string;
    error: string | false;
  }; // 使用言語1
  langProId1: {
    key: string;
    value: string;
    error: string | false;
  }; // 言語レベル1
  langId2: {
    key: string;
    value: string;
    error: string | false;
  }; // 使用言語2
  langProId2: {
    key: string;
    value: string;
    error: string | false;
  }; // 言語レベル2
  langId3: {
    key: string;
    value: string;
    error: string | false;
  }; // 使用言語3
  langProId3: {
    key: string;
    value: string;
    error: string | false;
  }; // 言語レベル3
  dayOfWeek1: {
    value: string;
    error: string | false;
  }; // 日曜日
  dayOfWeek2: {
    value: string;
    error: string | false;
  }; // 月曜日
  dayOfWeek3: {
    value: string;
    error: string | false;
  }; // 火曜日
  dayOfWeek4: {
    value: string;
    error: string | false;
  }; // 水曜日
  dayOfWeek5: {
    value: string;
    error: string | false;
  }; // 木曜日
  dayOfWeek6: {
    value: string;
    error: string | false;
  }; // 金曜日
  dayOfWeek7: {
    value: string;
    error: string | false;
  }; // 土曜日
  timeZone1: {
    value: string;
    error: string | false;
  }; // 早朝
  timeZone2: {
    value: string;
    error: string | false;
  }; // 午前
  timeZone3: {
    value: string;
    error: string | false;
  }; // 午後
  timeZone4: {
    value: string;
    error: string | false;
  }; // 夜
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
  csvUpload: (newCsvData: { content: Array<Array<string>>; isSet: boolean }) => void; // CSVアップロード時のコールバック
  resetActivationFlg: () => void; // アクティベーションフラグのリセット
};
// CSVダウンロードのプロパティの型定義
export type CsvDownloadProps = {
  data: any[];
  header: any[];
  filename: string;
  label: string;
};
// Handlerの型定義
export type FileHandler = {
  clearFile(): void;
};
