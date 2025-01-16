import {
  CsvDownloadProps,
  CsvUploadProps,
  FileHandler,
} from '@/app/(Pages)/(App)/(Donation)/shared/csv';
import { CustomButton } from '@/app/components';
import CustomInputLabel from '@/app/components/InputLabel';
import { downloadFile } from '@/app/utils/file';
import CustomTextField from '@mui/material/TextField';
import Papa from 'papaparse';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import type { FileRejection } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';

interface Props {
  csvUploadProps: CsvUploadProps;
  csvDownloadProps: CsvDownloadProps;
}

// FileUploaderコンポーネント
const CsvHandler = forwardRef<FileHandler, Props>((props, ref) => {
  const { csvUploadProps, csvDownloadProps } = props;
  const { readonly } = csvUploadProps;
  const [currentShowFile, setCurrentShowFile] = useState<{ file: File; isUploaded: boolean }>();
  useImperativeHandle(ref, () => {
    return {
      clearFile() {
        clearFile();
      },
    };
  });

  // ファイルアップロード時の処理
  const onUploadFile = async (file: File) => {
    try {
      // アップロード可能なファイルが存在する場合、アップロード中のスイッチを true にし、アップロードを開始する
      setCurrentShowFile({ file, isUploaded: true });
    } catch (error) {
      // エラーが発生した場合の処理
      console.error({
        message: 'アップロード中にエラーが発生しました。',
        error,
      });
    }
  };

  // ファイルのクリア処理
  const clearFile = () => {
    setCurrentShowFile(undefined);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // アップロード可能なファイルが存在する場合、アップロード中のスイッチを true にし、アップロードを開始する
      try {
        await Promise.all(acceptedFiles.map(onUploadFile));

        // すべてのファイルのアップロードが成功した後の処理
        setCurrentShowFile(
          acceptedFiles.map((file) => ({
            file,
            isUploaded: true,
            preview: URL.createObjectURL(file),
          }))[0],
        );

        Papa.parse(acceptedFiles[0], {
          complete: (results: Papa.ParseResult<string[]>) => {
            csvUploadProps.csvUpload({
              content: results.data,
              isSet: true,
            });
          },
        });
      } catch (error) {
        // エラーが発生した場合の処理
        console.error({
          message: 'アップロード中にエラーが発生しました。',
          error,
        });
      }
    },
    [props],
  );

  // ファイルが拒否された場合の処理
  const onDropRejected = useCallback((rejectedFiles: FileRejection[]) => {
    rejectedFiles.forEach(({ file, errors }) => {
      const errorMessages: Record<string, string> = {
        'file-too-large': `${file.name} のファイルサイズが大きすぎます。50MB以下のファイルをアップロードしてください。`,
        'file-invalid-type': 'このファイルはcsvではありません。',
      };
      errors.forEach(({ code }) => {
        const errorMessage = errorMessages[code] || 'エラーが発生しました。';
        alert(errorMessage);
      });
    });
  }, []);

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    onDropRejected,
    accept: { 'text/csv': [] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
  });

  // ダウンロード処理を行う関数
  const handleDownload = () => {
    try {
      const csvContent = csvDownloadProps.header.map((h) => h).join(',') + '\n';

      // ダウンロード用のBlobを作成（UTF-8指定）
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const blob = new Blob([bom, csvContent], { type: 'text/csv' });
      downloadFile(blob, csvDownloadProps.filename);
    } catch (error) {
      console.error('CSV Download Error:', error);
      alert('CSVのダウンロード中にエラーが発生しました。もう一度試してください。');
    }
  };

  return (
    <>
      <div className='flex flex-col gap-[10px] w-full'>
        <CustomInputLabel label={csvUploadProps.label} />

        <div className='flex flex-row gap-[4px]'>
          {readonly ? (
            <div>
              <p className='h-12 w-[300px] text-secondaryText p-3 disable'>
                {currentShowFile?.file.name}
              </p>
            </div>
          ) : (
            <div className='flex flex-col gap-[10px] w-full'>
              <div {...getRootProps()}>
                <div className=''>
                  <input {...getInputProps()} />
                  <p className='text-secondaryText text-sm'>
                    {isDragReject ? 'このファイル形式のアップロードは許可されていません。' : ''}
                  </p>
                  <div className='flex flex-col gap-[10px] w-full'>
                    <div className='flex flex-row gap-[4px]'>
                      <CustomTextField
                        placeholder={'ここにファイルをドラッグ＆ドロップしてアップロード'}
                        value={currentShowFile?.isUploaded ? currentShowFile?.file.name : ''}
                        className='w-[450px] h-12'
                      />
                      <CustomButton className='w-[100px] h-[57px]'>参照</CustomButton>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                {isDragAccept ? 'ファイルをアップロードします。' : isDragReject ? 'エラー' : ''}
              </div>
            </div>
          )}
          <div className='flex flex-col gap-[10px]'>
            <CustomButton
              buttonType='primary'
              disabled={readonly}
              onClick={handleDownload}
              className='w-[200px] h-[57px]'
            >
              {csvDownloadProps.label}
            </CustomButton>
          </div>
        </div>
      </div>
      {/* ファイルアップロード中の表示 */}
      {currentShowFile && !currentShowFile.isUploaded && (
        <aside>
          <p>{currentShowFile.file.name}をアップロードしています…</p>
        </aside>
      )}
    </>
  );
});

CsvHandler.displayName = 'CsvHandler';

export default CsvHandler;
