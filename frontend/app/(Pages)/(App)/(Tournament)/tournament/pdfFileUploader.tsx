import React, {
  useState,
  useCallback,
  forwardRef,
  Dispatch,
  SetStateAction,
  useImperativeHandle,
  useEffect,
} from 'react';
import type { FileRejection } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';
import CustomInputLabel from '@/app/components/InputLabel';
import CustomTextField from '@mui/material/TextField';

// Propsの型定義
interface Props {
  label: string; // ラベル
  readonly: boolean; // 読み取り専用かどうか
  setTournamentFormData: Dispatch<SetStateAction<any>>; //アップロードされた場合、大会ファイル名更新
}

// Handlerの型定義
interface Handler {
  clearFile(): void;
}

// PdfFileUploaderコンポーネント
const PdfFileUploader = forwardRef<Handler, Props>(function PdfFileUploaderBase(props, ref) {
  const [currentShowFile, setcurrentShowFile] = useState<{ file: File; isUploaded: boolean }>();
  useImperativeHandle(ref, () => {
    return {
      clearFile() {
        clearFile();
      },
    };
  });

  useEffect(() => {
    if (currentShowFile?.file) {
      props.setTournamentFormData((prevFormData: any) => ({
        ...prevFormData,
        uploadedPDFFilePath: currentShowFile.file.name,
        uploadedPDFFile: currentShowFile.file,
        tourn_info_faile_path: '',
      }));
    }
  }, [currentShowFile]); //ファイルのアップロード終わったら

  // ファイルアップロード時の処理
  const onUploadFile = async (file: File) => {
    try {
      setcurrentShowFile({ file, isUploaded: false });

      const uploadTime = 1000; // 1秒
      await new Promise((resolve) => setTimeout(resolve, uploadTime));

      // アップロード成功時の処理
      setcurrentShowFile({ file, isUploaded: true });
    } catch (error) {
      // エラーが発生した場合の処理
      alert(`アップロード中にエラーが発生しました。`);
    }
  };

  // ファイルのクリア処理
  const clearFile = () => {
    setcurrentShowFile(undefined);
  };

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
      } catch (error) {
        // エラーが発生した場合の処理
        //console.log(`アップロード中にエラーが発生しました: ${error}`);
      }
    },
    [currentShowFile],
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
            message = `アップロードされたファイルが正しくありません。.pdfをアップロードしてください。`;
            break;
          case 'too-many-files':
            message = 'アップロードできるファイルは１つのみです。';
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
    accept: {
      'application/pdf': [],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
  });

  return (
    <>
      <div className='flex flex-col gap-[8px] w-full'>
        {!props.readonly && (
          <>
            <CustomInputLabel
              label={props.label}
              displayHelp
              toolTipText='登録できるファイルの種類は、PDFファイルのみです。' //はてなボタン用
            ></CustomInputLabel>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <p className='text-secondaryText text-sm'>
                {isDragReject ? 'このファイル形式のアップロードは許可されていません。' : ''}
              </p>
              <div className='flex flex-row gap-4'>
                <CustomTextField
                  placeholder={'ここにファイルをドラッグ＆ドロップしてアップロード'}
                  value={currentShowFile?.isUploaded ? currentShowFile?.file.name : ''}
                  className='w-full'
                ></CustomTextField>
                <button
                  className='text-normal w-[100px] border-solid border-[1px] rounded-md p-2 bg-transparent text-primaryText hover:bg-gray-50 border-gray-200'
                  disabled={isDragReject}
                  type='button'
                >
                  参照
                </button>
              </div>
              {isDragAccept ? 'ファイルをアップロードします。' : isDragReject ? 'エラー' : ''}
            </div>
          </>
        )}
        {props.readonly && (
          <div>
            <CustomInputLabel label={props.label}></CustomInputLabel>
            <p className='h-12 w-[300px] text-secondaryText p-3 disable'>
              {currentShowFile?.file.name}
            </p>
          </div>
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

export default PdfFileUploader;
