import { CustomButton } from '@/app/components';
import CustomInputLabel from '@/app/components/InputLabel';
import CustomTextField from '@mui/material/TextField';
import Papa from 'papaparse';
import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import type { FileRejection } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';

interface Props {
  csvUploadProps: CsvUploadProps;
  csvDownloadProps: CsvDownloadProps;
}

// CSVアップロードのプロパティの型定義
interface CsvUploadProps {
  label: string; // ラベル
  readonly: boolean; // 読み取り専用かどうか
  csvUpload: (newCsvData: { content: string[][]; isSet: boolean }) => void; // CSVアップロード時のコールバック
  resetActivationFlg: () => void; // アクティベーションフラグのリセット
}
// CSVダウンロードのプロパティの型定義
interface CsvDownloadProps {
  data: any[];
  header: any[];
  filename: string;
  isOrgSelected: boolean;
  label: string;
}
// Handlerの型定義
interface Handler {
  clearFile(): void;
}

// FileUploaderコンポーネント
const CsvHandler = forwardRef<Handler, Props>(function FileUploader(props, ref) {
  const [currentShowFile, setcurrentShowFile] = useState<{ file: File; isUploaded: boolean }>();
  const [dispError, setDispError] = useState<boolean>(false);
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
      setcurrentShowFile({ file, isUploaded: true });
    } catch (error) {
      // エラーが発生した場合の処理
      //console.log(`アップロード中にエラーが発生しました: ${error}`);
    }
  };

  // ファイルのクリア処理
  const clearFile = () => {
    setcurrentShowFile(undefined);
    // 他にクリアするべきデータがあればここに追加
  };

  // useCallback は、関数のメモ化を行うフックです。
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // アップロード可能なファイルが存在する場合、アップロード中のスイッチを true にし、アップロードを開始する
      try {
        await Promise.all(acceptedFiles.map(onUploadFile));

        // すべてのファイルのアップロードが成功した後の処理
        setcurrentShowFile(
          acceptedFiles.map((file) => ({
            file,
            isUploaded: true,
            preview: URL.createObjectURL(file),
          }))[0],
        );

        // FileをList<List<String>>に変換
        Papa.parse(acceptedFiles[0], {
          complete: function (results: Papa.ParseResult<any>) {
            props.csvUploadProps.csvUpload({
              content: results.data,
              isSet: true,
            });
          },
        });
        props.csvUploadProps.resetActivationFlg();
      } catch (error) {
        // エラーが発生した場合の処理
        //console.log(`アップロード中にエラーが発生しました: ${error}`);
      }
    },
    [props],
  );

  // ファイルが拒否された場合の処理
  const onDropRejected = useCallback((rejectedFiles: FileRejection[]) => {
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(({ code }) => {
        let message = 'エラーが発生しました。';
        switch (code) {
          case 'file-too-large':
            message = `${file.name} のファイルサイズが大きすぎます。50MB以下のファイルをアップロードしてください。`;
            break;
          case 'file-invalid-type':
            message = `このファイルはcsvではありません。`;
            break;
          default:
            break;
        }
        alert(message);
      });
    });
  }, []);

  // useDropzoneからの必要なプロパティの取得
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
    if (props.csvDownloadProps.isOrgSelected === false) {
      setDispError(true);
      return;
    } else {
      setDispError(false);
    }
    if (props.csvDownloadProps.data.length === 0) {
      alert('ダウンロードするデータがありません。');
      return;
    }

    try {
      // CSVダウンロードのロジック
      const csvContent = props.csvDownloadProps.header.map((h) => h.label).join(',') + '\n';

      // ダウンロード用のBlobを作成（UTF-8指定）
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]); //UTF-8を指定
      const blob = new Blob([bom, csvContent], { type: 'text/csv' });

      // BlobからURLを生成
      const url = window.URL.createObjectURL(blob);

      // ダウンロード用のリンクを作成してクリック
      const a = document.createElement('a');
      a.href = url;
      a.download = props.csvDownloadProps.filename;
      document.body.appendChild(a);
      a.click();

      // ダウンロード後にURLを解放
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('CSV Download Error:', error);
      alert('CSVのダウンロード中にエラーが発生しました。もう一度試してください。');
    }
  };

  return (
    <>
      <div className='flex flex-col gap-[10px] w-full'>
        <CustomInputLabel label={props.csvUploadProps.label}></CustomInputLabel>
        <CustomButton
          buttonType='primary'
          disabled={props.csvUploadProps.readonly}
          onClick={() => {
            handleDownload();
          }}
          className='w-[200px] h-[57px]'
        >
          {props.csvDownloadProps.label}
        </CustomButton>
        {!props.csvUploadProps.readonly && (
          <div className='flex flex-col gap-[10px] w-full'>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p className='text-secondaryText text-sm'>
                {isDragReject ? 'このファイル形式のアップロードは許可されていません。' : ''}
              </p>
              <div className='flex flex-row gap-[4px]'>
                <CustomTextField
                  placeholder={'ここにファイルをドラッグ＆ドロップしてアップロード'}
                  value={currentShowFile?.isUploaded ? currentShowFile?.file.name : ''}
                  className='w-[450px] h-12'
                ></CustomTextField>
                <CustomButton className='w-[100px] h-[57px]'>参照</CustomButton>
              </div>
            </div>
            {isDragAccept ? 'ファイルをアップロードします。' : isDragReject ? 'エラー' : ''}
          </div>
        )}
        {props.csvUploadProps.readonly && (
          <p className='h-12 w-[300px] text-secondaryText p-3 disable'>
            {currentShowFile?.file.name}
          </p>
        )}
        {dispError === true && (
          <p className={`text-systemErrorText text-sm w-[200px]`}>所属団体名を選択してください。</p>
        )}
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

export default CsvHandler;
