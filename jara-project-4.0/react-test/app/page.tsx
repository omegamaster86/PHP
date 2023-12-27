'use client';
import Link from 'next/link';
import CsvUploader from './components/CsvUploader/Uploader';
import Header from './components/Header';

export default function Home() {
  return (
    <div>
      <Header />
      <main className='flex min-h-screen flex-col items-center justify-between p-24'></main>
    </div>
  );
}
