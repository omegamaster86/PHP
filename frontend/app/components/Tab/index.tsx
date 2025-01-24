// Reactのインポート
import { FC } from 'react';

// タブコンポーネントのプロパティ型定義
interface TabProps {
  number: number; // タブの番号
  isActive: boolean; // タブがアクティブかどうか
  onClick: (tabNumber: number) => void; // タブがクリックされた時のコールバック関数
  rounded: string; // タブの角の丸みを指定するクラス
  children: string; // タブに表示されるテキスト
}

// タブコンポーネントの関数コンポーネント
const Tab: FC<TabProps> = ({ number, isActive, onClick, rounded, children }) => {
  return (
    <div
      className={`flex w-[80px] h-[38px] items-center justify-center cursor-pointer text-caption1 ${
        // アクティブなタブかどうかによってスタイルを変更
        isActive
          ? 'bg-primary-500 text-white' // アクティブなら背景色を青に、文字色を白
          : 'border border-primary-500' // 非アクティブならボーダーを青
      }
      +
      ${rounded}  // 角の丸みのクラスを適用
      `}
      // クリック時の処理を設定
      onClick={() => onClick(number)}
    >
      {/* タブに表示されるテキスト */}
      {children}
    </div>
  );
};

export default Tab;
