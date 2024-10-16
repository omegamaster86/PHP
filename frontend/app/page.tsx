'use client';
import Link from 'next/link';
import CsvUploader from './(Pages)/(App)/(Player)/playerInformationLinking/CsvHandler';
import Header from './components/Header';

export default function Home() {
  return (
    <>
      <Header />
      <main className='flex min-h-screen flex-col items-center justify-between p-24'></main>
    </>
  );
}
