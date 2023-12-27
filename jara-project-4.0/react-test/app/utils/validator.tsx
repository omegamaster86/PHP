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
 * returnErrorMessages(['', 'エラーメッセージ1', '', 'エラーメッセージ2']) // ['エラーメッセージ1', 'エラーメッセージ2']
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
 * メールアドレスの形式チェック
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
    errorMessage = 'メールアドレスの形式が正しくありません。';
    return errorMessage;
  }
  return errorMessage;
};

const validatePasswordFormat = (password: string) => {
  let errorMessage = '';
  const passwordRegex = new RegExp('^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[!-/:-@[-`{-~])[!-~]+$');
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
  const userNameRegex = new RegExp('^[a-zA-Z0-9-_ぁ-んァ-ン一-龠]+$');
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

const ValidateNotEqual = (elm1: any, elm2: any, elmName: string, elmName2: string) => {
  let errorMessage = '';
  if (elm1 === elm2) {
    errorMessage = elmName + 'と異なる' + elmName2 + 'を入力してください。';
    return errorMessage;
  }
  return errorMessage;
};

const Validator = {
  getErrorMessages,
  validateRequired,
  validateEmailFormat,
  validatePasswordFormat,
  validateUserNameFormat,
  validateLength,
  validateLengthMinAndMax,
  validateEqual,
  ValidateNotEqual,
};

export default Validator;
