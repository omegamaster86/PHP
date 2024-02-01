// 機能名: 団体情報更新画面
'use client';
import { useSearchParams } from 'next/navigation';

export default function TeamInfoUpdate() {
  const searchParams = useSearchParams();
  console.log(searchParams.get('teamId'));
  return <div>団体情報更新画面</div>;
}
