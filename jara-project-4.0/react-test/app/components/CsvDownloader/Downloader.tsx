import React from 'react';

interface CsvDownloadButtonProps {
  data: any[];
  filename: string;
}

const CsvDownloader: React.FC<CsvDownloadButtonProps> = ({ data, filename }) => {
  const handleDownload = () => {
    try {
      // CSVダウンロードのロジック
      const csvContent = data; // ここでデータをCSVに変換するロジックを実装する

      // ダウンロード用のBlobを作成
      const csvString = csvContent.map((row) => Object.values(row).join(',')).join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });

      // BlobからURLを生成
      const url = window.URL.createObjectURL(blob);

      // ダウンロード用のリンクを作成してクリック
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      // ダウンロード後にURLを解放
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('CSV Download Error:', error);
      alert('Error occurred while downloading CSV. Please try again.');
    }
  };
  return (
    <button onClick={handleDownload} className='bg-primary-500 text-white text-base h-12 w-72 mb-1'>
      CSV出力
    </button>
  );
};

const App: React.FC = () => {
  const testCsvData = [
    { name: 'John Doe', age: 30, city: 'New York' },
    { name: 'Jane Smith', age: 25, city: 'San Francisco' },
    // Add more data as needed
  ];

  const csvHeaders = [
    { label: 'Name', key: 'name' },
    { label: 'Age', key: 'age' },
    { label: 'City', key: 'city' },
    // Add more headers as needed
  ];

  return (
    <div>
      <CsvDownloader data={testCsvData} filename='example.csv' />
    </div>
  );
};
export default CsvDownloader;
