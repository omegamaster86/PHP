// 定数を定義
const consts: { [key: string]: string } = {
  APP_NAME: 'JARA APP',
  VERSION: '1.0.0',
};

// 定数を取得する関数を定義
export const getConst = (name: string) => {
  const constValue = consts[name];
  if (constValue === undefined) {
    throw new Error(`Const ${name} is not defined`);
  }
  return constValue;
};
