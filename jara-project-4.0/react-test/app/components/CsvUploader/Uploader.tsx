import React, { useState, useCallback } from 'react';
import type { FileRejection } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Papa from 'papaparse';

const CsvUploader = (props: any) => {
  const [currentShowFile, setcurrentShowFile] = useState<{ file: File; isUploaded: boolean }>();
  // const [csvData, setCsvData] = useState<{ content: Array<Array<string>> , isSet: boolean}>();

  const onUploadFile = async (file: File) => {
    try {
      setcurrentShowFile({ file, isUploaded: false });

      const uploadTime = Math.random() * 9000 + 1000; // 1秒から10秒
      await new Promise((resolve) => setTimeout(resolve, uploadTime));

      // アップロード成功時の処理
      setcurrentShowFile({ file, isUploaded: true });
    } catch (error) {
      // ここでエラーに関するユーザーへの通知や処理を行う
      alert(`アップロード中にエラーが発生しました: ${error}`);
    }
  };

  // useCallback は、関数のメモ化を行うフックです。
  const onDrop = useCallback(
    // ドロップしたファイルを受け取る
    async (acceptedFiles: File[]) => {
      // アップロード可能なファイルが存在する場合、アップロード中のスイッチを true にし、アップロードを開始する
      try {
        await Promise.all(acceptedFiles.map(onUploadFile));
        // ↓すべてのファイルのアップロードが成功した後の処理を書く

        setcurrentShowFile(
          acceptedFiles.map((file) => ({
            file,
            isUploaded: true,
            preview: URL.createObjectURL(file),
          }))[0],
        );
        console.log(acceptedFiles[0] + 'is Uploaded');
        // FileをList<List<String>>に変換
        Papa.parse(acceptedFiles[0], {
          complete: function (results: Papa.ParseResult<any>) {
            props.csvUpload({
              content: results.data,
              isSet: true,
            });
            // console.log('CSVデータをセットしました。');
            // console.log(csvData);
            console.log('propsを表示します。');
            console.log(props);
          },
        });
        props.resetLoadingFlg(false);
      } catch (error) {
        // ↓ここでエラーに関するユーザーへの通知や処理を行う
        alert(`アップロード中にエラーが発生しました: ${error}`);
      }
    },
    // [currentShowFile, csvData],
    [currentShowFile, props.setCsvData],
  );

  const onDropRejected = useCallback((rejectedFiles: FileRejection[]) => {
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(({ code }) => {
        let message = 'エラーが発生しました。';
        switch (code) {
          case 'file-too-large':
            message = `${file.name} のファイルサイズが大きすぎます。50MB以下のファイルをアップロードしてください。`;
            break;
          case 'file-invalid-type':
            message = `${file.name} のファイル形式が許可されていません。許可されているファイル形式は .csv です。`;
            break;
          default:
            break;
        }
        alert(message);
      });
    });
  }, []);

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'text/csv': [],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  return (
    <div>
      <div>
        <div
          {...getRootProps()}
          className='bg-containerBg w-[320px] h-[320px] justify-center flex dropzone mb-1'
        >
          {currentShowFile?.isUploaded || false ? (
            <div>
              <p>{currentShowFile.file.name}</p>
            </div>
          ) : (
            <div className='m-auto mt-auto justify-center flex items-center flex-col gap-[10px] mb-1'>
              <input {...getInputProps()} />
              <UploadFileIcon className='w-full h-5 w-[32px] h-[32px] text-primaryText' />
              <p className='text-secondaryText border-secondaryText text-sm'>ファイルを選択</p>
              <p className='text-secondaryText text-sm'>
                {isDragReject ? 'このファイル形式のアップロードは許可されていません。' : 'or'}
              </p>
              <button
                className='text-secondaryText py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none border border-dashed border-secondaryText hover:bg-containerBg focus:z-10 focus:ring-4 focus:ring-primary-50'
                disabled={isDragReject}
                type='button'
              >
                {isDragAccept
                  ? 'ファイルをアップロードします。'
                  : isDragReject
                    ? 'エラー'
                    : 'アップロード'}
              </button>
            </div>
          )}
        </div>
        {/* <p className='text-secondaryText font-xs'>
          1つのファイルを選択できます。png, jpg, jpeg ファイルを選択できます。
        </p>
        <p className='text-primary-100 font-xs'>※1ファイルの最大サイズは50MBです</p> */}
      </div>
      {currentShowFile && (
        <aside>
          {currentShowFile.isUploaded ? (
            <div>
              <div>
                <span></span>
              </div>
              <div>
                <p>{currentShowFile.file.name}</p>
              </div>
            </div>
          ) : (
            <div>
              <div>
                <p>{currentShowFile.file.name}をアップロードしています…</p>
              </div>
            </div>
          )}
        </aside>
      )}
    </div>
  );
};
export default CsvUploader;
