/**
 * バリデーションユーティリティ
 * 使用方法は以下の通り。
 *  const userNameError = Validator.getErrorMessages([
    Validator.validateRequired(userName, 'ユーザー名'),
    Validator.validateUserNameFormat(userName),
    Validator.validateLength(userName, 'ユーザー名', 32),
]);
 * setUserNameErrorMessages(userNameError as string[]);
 * 上記を利用してエラーメッセージ配列を得る。エラーがない場合、空の配列が返る。
 */

/**
 * エラーメッセージを返す
 * @param errorMessages エラーメッセージの配列
 * @returns {string[]}
 * @description
 * エラーメッセージの配列から、空文字以外のエラーメッセージのみを返す。
 * @example
 * getErrorMessages(['', 'エラーメッセージ1', '', 'エラーメッセージ2']) // ['エラーメッセージ1', 'エラーメッセージ2']
 */
const getErrorMessages = (errorMessages: string[]) => {
  let messages = [] as string[];
  errorMessages.forEach((errorMessage) => {
    if (errorMessage) {
      messages.push(errorMessage);
    }
  });
  return messages;
};

/**
 * 必須チェック
 * @param elm チェックする要素
 * @param elmName チェックする要素の名前
 * @returns {string}
 * @description
 * 必須チェックを行う。
 * 必須チェックでエラーの場合、エラーメッセージを返す。
 * 必須チェックでエラーでない場合、空文字を返す。
 */
const validateRequired = (elm: any, elmName: string) => {
  let errorMessage = '';
  if (!elm) {
    errorMessage = elmName + 'を入力してください。';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * 必須チェック
 * @param elm チェックする要素
 * @param elmName チェックする要素の名前
 * @returns {string}
 * @description
 * 必須チェックを行う。
 * 必須チェックでエラーの場合、エラーメッセージを返す。
 * 必須チェックでエラーでない場合、空文字を返す。
 * @example
 * validateRequired('sample', 'サンプル') // ''
 * validateRequired('', 'サンプル') // 'サンプルを入力してください。'
 * validateRequired(null, 'サンプル') // 'サンプルを入力してください。'
 */
const validateSelectRequired = (elm: any, elmName: string) => {
  let errorMessage = '';
  if (!elm) {
    errorMessage = elmName + 'を選択してください。';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * メールアドレスの形式チェック(ユーザー登録画面用)
 * @param email チェックするメールアドレス
 * @returns {string}
 * @description
 * メールアドレスの形式チェックを行う。
 * メールアドレスの形式でない場合、エラーメッセージを返す。
 * メールアドレスの形式である場合、空文字を返す。
 * @example
 * validateEmailFormat('sample@gmail.com') // ''
 * validateEmailFormat('sample@gmail') // 'メールアドレスの形式が正しくありません。'
 * validateEmailFormat('samplegmail.com') // 'メールアドレスの形式が正しくありません。'
 * validateEmailFormat('sample@gmail.') // 'メールアドレスの形式が正しくありません。'
 */
const validateEmailFormat = (email: string) => {
  if (email === '') {
    return '';
  }
  let errorMessage = '';
  const emailRegex = new RegExp('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$');
  if (!emailRegex.test(email)) {
    errorMessage = 'メールアドレスの書式が誤っています。メールアドレスを確認してください。';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * メールアドレスの形式チェック(ユーザー情報更新画面用)
 * @param email チェックするメールアドレス
 * @returns {string}
 * @description
 * メールアドレスの形式チェックを行う。
 * メールアドレスの形式でない場合、エラーメッセージを返す。
 * メールアドレスの形式である場合、空文字を返す。
 * @example
 * validateEmailFormat('sample@gmail.com') // ''
 * validateEmailFormat('sample@gmail') // 'メールアドレスの形式が正しくありません。'
 * validateEmailFormat('samplegmail.com') // 'メールアドレスの形式が正しくありません。'
 * validateEmailFormat('sample@gmail.') // 'メールアドレスの形式が正しくありません。'
 */
const validateEmailFormat2 = (email: string) => {
  if (email === '') {
    return '';
  }
  let errorMessage = '';
  const emailRegex = new RegExp('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$');
  if (!emailRegex.test(email)) {
    errorMessage =
      'メールアドレスに使用できる文字は以下になります。使用可能文字: 英字大文字(A-Z)、英字小文字(a-z)、数字(0-9)、ピリオド(.)、ハイフン(-)、アンダースコア(_)、プラス記号(+)';
    return errorMessage;
  }
  return errorMessage;
};

const validatePasswordFormat = (password: string) => {
  let errorMessage = '';
  // const passwordRegex = new RegExp('^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!-/:-@[-`{-~])[!-~]+$');
  const passwordRegex = new RegExp(
    '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!-/:-@[-`{-~])[!-~]+$',
  );
  if (!passwordRegex.test(password)) {
    errorMessage = '半角英数文字、記号を全て含むパスワードを入力してください。';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * ユーザー名の形式チェック
 * @param userName チェックするユーザー名
 * @returns {string}
 * @description
 * ユーザー名の形式チェックを行う。
 * ユーザー名の形式でない場合、エラーメッセージを返す。
 * ユーザー名の形式である場合、空文字を返す。
 */
const validateUserNameFormat = (userName: string) => {
  if (userName === '') {
    return '';
  }
  let errorMessage = '';
  // const userNameRegex = new RegExp('^[a-zA-Z0-9-_ぁ-んァ-ンー一-龠]+$');
  const userNameRegex = new RegExp('^[a-zA-Z0-9-_ぁ-んァ-ンー一-龠Ａ-Ｚａ-ｚ０-９－＿]+$'); //全角アルファベット,全角ハイフン,全角アンダーバー,全角数字も入力可能にする 20240528

  if (!userNameRegex.test(userName)) {
    errorMessage =
      'ユーザー名に使用できる文字は以下になります。使用可能文字: 日本語、英字大文字(A-Z)、英字小文字(a-z)、数字(0-9)、ハイフン(-)、アンダースコア(_)';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * 文字数チェック
 * @param elm チェックする要素
 * @param elmName チェックする要素の名前
 * @param length チェックする文字数
 * @returns {string}
 * @description
 * 文字数チェックを行う。
 * 文字数がlengthより大きい場合、エラーメッセージを返す。
 * 文字数がlength以下の場合、空文字を返す。
 */
const validateLength = (elm: any, elmName: string, length: number) => {
  let errorMessage = '';
  if (elm.length > length) {
    errorMessage = elmName + 'は' + length + '文字以内で入力してください。';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * 文字数チェック
 * @param elm チェックする要素
 * @param elmName チェックする要素の名前
 * @param length チェックする文字数
 * @returns {string}
 * @description
 * 文字数チェックを行う。
 * 文字数がlengthより大きい場合、エラーメッセージを返す。
 * 文字数がlength以下の場合、空文字を返す。
 */
const validateNumLength = (elm: string, elmName: string, length: number) => {
  let errorMessage = '';
  if (elm.length > length) {
    errorMessage = elmName + 'は' + length + '桁以内で入力してください。';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * 体重と身長の形式チェック（最大5桁で小数点第2位まで）
 * @param elm チェックする要素
 * @param elmName チェックする要素の名前
 * @returns {string}
 * @description
 * 体重と身長の形式チェックを行う。
 * 体重と身長の形式でない場合、エラーメッセージを返す。
 * 体重と身長の形式である場合、空文字を返す。
 * @example
 * validateWeightAndHeightFormat('sample') // '体重は半角数字で入力してください。'
 */
const validateWeightAndHeightFormat = (elm: number, elmName: string) => {
  if (elm === undefined || elm === null) {
    return '';
  }
  let errorMessage = '';
  // 正規表現は以下の通り。
  // 半角数字で1桁以上3桁以下の数字を許容する。
  // 小数点以下は2桁まで許容する。
  // 整数のみの場合、3桁まで許容する。
  const weightAndHeightRegex = new RegExp('^[0-9]{1,3}(?:\\.[0-9]{1,2})?$');
  if (!weightAndHeightRegex.test(elm.toString())) {
    errorMessage = elmName + 'は整数部分は3桁以内、小数点以下は2桁以内の数値で入力してください。';
    return errorMessage;
  }
  return errorMessage;
};

const validateBirthOfDateRange = (elm: Date, elmName: string, min: number, max: number) => {
  // 日付から年齢を計算
  const calcAgeFromDate = (date: Date) => {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
  const age = calcAgeFromDate(elm);
  let errorMessage = '';
  if (age < min || age > max) {
    errorMessage =
      elmName +
      'は' +
      min.toString() +
      '歳以上' +
      max.toString() +
      '歳以下となるように入力してください。';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * 文字数チェック
 * @param elm チェックする要素
 * @param elmName チェックする要素の名前
 * @param minLength チェックする文字数の最小値
 * @param maxLength チェックする文字数の最大値
 * @returns {string}
 * @description
 * 文字数チェックを行う。
 * 文字数がminLengthより小さい場合、エラーメッセージを返す。
 * 文字数がmaxLengthより大きい場合、エラーメッセージを返す。
 * 文字数がminLength以上maxLength以下の場合、空文字を返す。
 * @example
 * validateLengthMinAndMax('sample', 'サンプル', 3, 5) // ''
 * validateLengthMinAndMax('sample', 'サンプル', 3, 4) // 'サンプルは3文字以上4文字以内で入力してください。'
 * validateLengthMinAndMax('sample', 'サンプル', 6, 8) // 'サンプルは6文字以上8文字以内で入力してください。'
 */
const validateLengthMinAndMax = (
  elm: any,
  elmName: string,
  minLength: number,
  maxLength: number,
) => {
  let errorMessage = '';
  if (elm.length < minLength || elm.length > maxLength) {
    errorMessage =
      elmName + 'は' + minLength + '文字以上' + maxLength + '文字以内で入力してください。';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * 等値チェック
 * @param elm1 チェックする要素1
 * @param elm2 チェックする要素2
 * @param elmName チェックする要素の名前
 * @returns {string}
 * @description
 * 等値チェックを行う。
 * 要素1と要素2が等しくない場合、エラーメッセージを返す。
 * 要素1と要素2が等しい場合、空文字を返す。
 * @example
 * validateEqual('sample1', 'sample2', 'サンプル') // 'サンプルが一致しません。'
 * validateEqual('sample1', 'sample1', 'サンプル') // ''
 */
const validateEqual = (elm1: any, elm2: any, elmName: string) => {
  if (elm1 === '') {
    return '';
  }
  if (elm2 === '') {
    return '';
  }

  let errorMessage = '';
  if (elm1 !== elm2) {
    errorMessage = elmName + 'が一致しません。';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * 等値チェック
 * @param elm1 チェックする要素1
 * @param elm2 チェックする要素2
 * @param elmName チェックする要素の名前
 * @returns {string}
 */
const validateEqual2 = (elm1: any, elm2: any) => {
  if (elm1 === '') {
    return '';
  }
  if (elm2 === '') {
    return '';
  }

  let errorMessage = '';
  if (elm1 !== elm2) {
    errorMessage = '登録済みメールアドレスと一致しません。メールアドレスを確認してください。';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * 等値チェック
 * @param elm1 チェックする要素1
 * @param elm2 チェックする要素2
 * @param elmName チェックする要素の名前
 * @returns {string}
 * @description
 * 等値チェックを行う。
 * 要素1と要素2が等しくない場合、エラーメッセージを返す。
 * 要素1と要素2が等しい場合、空文字を返す。
 * @example
 * validateEqual('sample1', 'sample2', 'サンプル') // 'サンプルが一致しません。'
 * validateEqual('sample1', 'sample1', 'サンプル') // ''
 */
const ValidateNotEqual = (elm1: any, elm2: any, elmName: string, elmName2: string) => {
  let errorMessage = '';
  if (elm1 === elm2) {
    errorMessage = elmName + 'と異なる' + elmName2 + 'を入力してください。';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * 選手IDの形式チェック
 * @param playerId チェックする選手ID
 * @returns {string}
 * @description
 * 選手IDの形式チェックを行う。
 * 選手IDの形式でない場合、エラーメッセージを返す。
 * 選手IDの形式である場合、空文字を返す。
 * @example
 * validatePlayerIdFormat('1234567890') // ''
 * validatePlayerIdFormat('1234567890a') // '選手IDに使用できる文字は以下になります。使用可能文字: 数字(0-9)'
 * validatePlayerIdFormat('1234567890!') // '選手IDに使用できる文字は以下になります。使用可能文字: 数字(0-9)'
 * validatePlayerIdFormat('1234567890あ') // '選手IDに使用できる文字は以下になります。使用可能文字: 数字(0-9)'
 */
const validatePlayerIdFormat = (playerId: string) => {
  if (playerId === undefined || playerId === null) {
    return '';
  }
  let errorMessage = '';
  // 12桁の数字のみ許容する。
  const playerIdRegex = new RegExp('^[0-9]{1,12}$');
  if (!playerIdRegex.test(playerId)) {
    errorMessage = '既存選手IDに使用できる文字は以下になります。使用可能文字: 12桁以内の半角数字';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * JARA選手コードの形式チェック
 * @param jara_player_id チェックするJARA選手コード
 * @returns {string}
 * @description
 * 選手IDの形式チェックを行う。
 * 選手IDの形式でない場合、エラーメッセージを返す。
 * 選手IDの形式である場合、空文字を返す。
 * @example
 * validateJaraPlayerCodeFormat('1234567890') // ''
 * validateJaraPlayerCodeFormat('1234567890a') // 'JARA選手コードに使用できる文字は以下になります。使用可能文字: 数字(0-9)'
 */
const validateJaraPlayerCodeFormat = (jara_player_id: string) => {
  if (jara_player_id === '' || jara_player_id === undefined || jara_player_id === null) {
    return '';
  }
  let errorMessage = '';
  // 12桁の数字のみ許容する。
  const playerIdRegex = new RegExp('^[0-9]{12}$');
  if (!playerIdRegex.test(jara_player_id)) {
    errorMessage = 'JARA選手コードは12桁の半角数字を入力してください。';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * 選手名の形式チェック
 * @param playerName チェックする選手名
 * @returns {string}
 * @description
 * 選手名の形式チェックを行う。
 * 選手名の形式でない場合、エラーメッセージを返す。
 * 選手名の形式である場合、空文字を返す。
 * @example
 * validateJaraPlayerNameFormat('sample') // ''
 * validateJaraPlayerNameFormat('sample1') // ''
 * validateJaraPlayerNameFormat('sample!') // '選手名に使用できる文字は以下になります。使用可能文字: 全角半角英数字記号'
 */
const validatePlayerNameFormat = (playerName: string) => {
  if (playerName === '') {
    return '';
  }
  let errorMessage = '';
  // const playerNameRegex = new RegExp('^[a-zA-Z0-9-_ぁ-んァ-ヶー一-龠!-/:-@[-`{-~ ]+$');
  const playerNameRegex = new RegExp('^[a-zA-Z0-9-_ぁ-んァ-ンー一-龠Ａ-Ｚａ-ｚ０-９－＿]+$'); //全角アルファベット,全角ハイフン,全角アンダーバー,全角数字も入力可能にする 20240528
  if (!playerNameRegex.test(playerName)) {
    // return '選手名に使用できる文字は以下になります。使用可能文字: 全角半角文字記号';
    return '選手名に使用できる文字は以下になります。使用可能文字: 日本語 英大文字 英小文字 数字 記号：- _';
  }
  return errorMessage;
};

/**
 *
 * @param url チェックするURL
 * @returns {string}
 * @description
 * URLの形式チェックを行う。
 * URLの形式でない場合、booleanを返す。
 */
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * URLの形式チェック
 * @param url チェックするURL
 * @returns {string}
 * @description
 * URLの形式チェックを行う。
 * URLの形式でない場合、エラーメッセージを返す。
 * URLの形式である場合、空文字を返す。
 * @example
 * validateUrlFormat('https://sample.com') // ''
 * validateUrlFormat('sample.com') // 'URLが正しいことを確認してください'
 */
const validateUrlFormat = (url: string) => {
  if (url === '' || url === undefined || url === null) {
    return '';
  }
  let errorMessage = '';
  const urlRegex = new RegExp(/^https?:\/\/[\w!?/+\-_~;.,*&@#$%()'[\]]+$/);
  if (!urlRegex.test(url)) {
    return 'URL形式の文字列を入力してください';
  }
  return errorMessage;
};

const validateAlphabetNumber = (elm: string, elmName: string) => {
  let errorMessage = '';
  const urlRegex = new RegExp(/^[a-zA-Z0-9]+$/);
  if (!urlRegex.test(elm)) {
    return elmName + 'に使用できる文字は以下になります。使用可能文字: 半角英数字';
  }
  return errorMessage;
};

/**
 * サイド情報の必須チェック
 * @param sideInfo
 * @returns
 * @description
 * サイド情報の必須チェックを行う。
 * サイド情報がtrueがない場合、エラーメッセージを返す。
 */
const validateSideInfoIsInput = (sideInfo: boolean[]) => {
  if (
    // sideInfoにtrueがない場合エラー
    sideInfo.every((value) => value === false)
  ) {
    return 'サイド情報を1つ以上選択してください。';
  } else {
    return '';
  }
};

/**
 * 設立年の形式チェック
 * @param foundingYear
 * @returns
 * @description
 * 設立年の形式チェックを行う。
 * 1750年から現在までの範囲であるかチェックする。
 * 範囲外の場合、エラーメッセージを返す。
 */
const validateFoundingYear = (foundingYear: number | null) => {
  let errorMessage = '';
  if (foundingYear === null) {
    return '';
  }

  if (foundingYear < 1750 || foundingYear > new Date().getFullYear()) {
    errorMessage = '設立年は1750年から現在までの範囲で入力してください。';
    return errorMessage;
  }

  return errorMessage;
};

/**
 * 設立年の形式チェック
 * @param insertedDate
 * @returns
 * @description
 * 日付を現在あるかどうか確認
 */
const validateDateExists = (insertedDate: string) => {
  let errorMessage = '';

  if (new Date(insertedDate) > new Date()) {
    errorMessage = `入力された日付が誤っています。※${insertedDate}`;
    return errorMessage;
  }

  return errorMessage;
};

/**
 * 郵便番号の形式チェック
 * @param addressNumber
 * @returns
 * @description
 * 郵便番号の形式チェックを行う。
 * 000-0000の形式であるかチェックする。
 * 形式でない場合、エラーメッセージを返す。
 */
const validateAddressNumberFormat = (addressNumber: string) => {
  let errorMessage = '';
  if (addressNumber === '') {
    return '';
  }
  const addressNumberRegex = new RegExp('^[0-9]{3}-[0-9]{4}$');
  if (!addressNumberRegex.test(addressNumber)) {
    errorMessage = '不正な郵便番号です、適切な郵便番号を入力してください（数字３桁-数字４桁）';
    return errorMessage;
  }
  return errorMessage;
};

const validateAddressrResultFormat = () => {
  let errorMessage = '郵便番号が無効です';
  return errorMessage;
};

/**
 * 証跡のエラーチェック
 * @param trail
 * @param orgType
 * @param labelText
 * @returns
 * @description
 * 証跡のエラーチェックを行う。
 * 証跡を設定しない場合、団体種別が任意であるかチェックする。
 * 証跡を設定する場合、団体種別が正式であるかチェックする。
 */
const validateTrailError = (trail: string, orgType: number, labelText: string) => {
  let errorMessage = '';
  if (!trail && orgType != 0) {
    errorMessage =
      labelText + '証跡を設定しない場合、' + labelText + '団体種別は"任意"を選択してください。';
    return errorMessage;
  }
  if (trail && orgType != 1) {
    errorMessage =
      labelText + '証跡を設定する場合、' + labelText + '団体種別は"正規"を選択してください。';
    return errorMessage;
  }
  return errorMessage;
};

/**
 * 番号チェック
 * @param insertedNumber
 * @returns
 * @description
 * Positive number かどうか確認する
 */
const validatePositiveNumber = (insertedNumber: string) => {
  let errorMessage = '';
  if (insertedNumber === '') {
    return '';
  }

  if (Number(insertedNumber) < 1) {
    errorMessage = `不正な番号です、${insertedNumber}は1 以上数値を入力してください。`;
    return errorMessage;
  }

  return errorMessage;
};

/**
 * 番号チェック
 * @param insertedNumber
 * @returns
 * @description
 * Int number かどうか確認する
 */
// const validateIntegerRange = (insertedNumber: string) => {
//   if (insertedNumber == '' || insertedNumber == null || insertedNumber == undefined) {
//     return '';
//   }
//   else if (Number(insertedNumber) < 1 || Number(insertedNumber) > 2147483647) {
//     return '不正な番号です、${insertedNumber}は　1以上数値と　2147483647以下数値を入力してください。';
//   }
// };

/**
 * 日付比較
 * @param startDate
 * @param endDate
 * @returns
 * @description
 * 開始日から終了日大きいかどうか確認する
 */

const compareDates = (startDate: string, endDate: string) => {
  let errorMessage = '';
  if (startDate === '' || endDate === '') {
    return '';
  }

  let date1 = new Date(startDate).getTime();
  let date2 = new Date(endDate).getTime();

  if (date1 > date2) {
    errorMessage =
      '開催終了年月日の値が不正です。開催開始年月日より前の日付を選択することはできません。';
    return errorMessage;
  }
  return errorMessage;
};
const compareDatesVolunteer = (startDate: string, endDate: string) => {
  let errorMessage = '';
  if (startDate === '' || endDate === '') {
    return '';
  }

  let date1 = new Date(startDate).getTime();
  let date2 = new Date(endDate).getTime();

  if (date1 > date2) {
    errorMessage =
      '終了生年月日の値が不正です。開始生年月日より前の日付を選択することはできません。';
    return errorMessage;
  }
  return errorMessage;
};

const Validator = {
  getErrorMessages,
  isValidUrl,
  validateRequired,
  validateSelectRequired,
  validateEmailFormat,
  validateEmailFormat2,
  validateSideInfoIsInput,
  validatePasswordFormat,
  validateUserNameFormat,
  validateLength,
  validateNumLength,
  validateWeightAndHeightFormat,
  validateLengthMinAndMax,
  validateEqual,
  ValidateNotEqual,
  validatePlayerNameFormat,
  validatePlayerIdFormat,
  validateJaraPlayerCodeFormat,
  validateBirthOfDateRange,
  validateUrlFormat,
  validateAlphabetNumber,
  validateEqual2,
  validateFoundingYear,
  validateAddressNumberFormat,
  validateAddressrResultFormat,
  validateTrailError,
  validatePositiveNumber,
  compareDates,
  validateDateExists,
  compareDatesVolunteer,
  // validateIntegerRange,
};

export default Validator;
