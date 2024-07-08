import React, {
  useState,
  useCallback,
  useRef,
  forwardRef,
  Dispatch,
  SetStateAction,
  useImperativeHandle,
  useEffect,
} from 'react';
import type { FileRejection } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import CustomInputLabel from '@/app/components/InputLabel';
import CustomTextField from '@mui/material/TextField';

// Propsの型定義
interface Props {
  label: string; // ラベル
  readonly: boolean; // 読み取り専用かどうか
  setTournamentFormData: Dispatch<SetStateAction<any>>; //アップロードされた場合、退会ファイル名更新
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

  //アップロードされたファイルを保存するー開始
  useEffect(() => {
    if (currentShowFile?.file) {
      //console.log(currentShowFile?.file);
      props.setTournamentFormData((prevFormData: any) => ({
        ...prevFormData,
        uploadedPDFFilePath: currentShowFile.file.name,
        uploadedPDFFile: currentShowFile.file,
        tourn_info_faile_path: '',
      }));
    }
  }, [currentShowFile]); //ファイルのアップロード終わったら
  //アップロードされたファイルを保存するー完了

  // ファイルアップロード時の処理
  const onUploadFile = async (file: File) => {
    try {
      setcurrentShowFile({ file, isUploaded: false });

      // const uploadTime = Math.random() * 9000 + 1000; // 1秒から10秒
      const uploadTime = 1000; // 1秒
      await new Promise((resolve) => setTimeout(resolve, uploadTime));

      // アップロード成功時の処理
      setcurrentShowFile({ file, isUploaded: true });
    } catch (error) {
      // エラーが発生した場合の処理
      //console.log(`アップロード中にエラーが発生しました: ${error}`);
      alert(`アップロード中にエラーが発生しました。`);
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

        //console.log(acceptedFiles[0] + 'is Uploaded');
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

  {
    /* ファイルアップロードのテキストボックスとボタンの表示 */
  }
  return (
    <div>
      <div>
        <div className='flex flex-col gap-[8px] w-full'>
          {!props.readonly && (
            <>
              <CustomInputLabel
                label={props.label}
                displayHelp
                toolTipText='登録できるファイルの種類は、PDFファイルのみです。' //はてなボタン用
              ></CustomInputLabel>
              <div {...getRootProps()} className='w-[555px]'>
                <div>
                  <input {...getInputProps()} />
                  <p className='text-secondaryText text-sm'>
                    {isDragReject ? 'このファイル形式のアップロードは許可されていません。' : ''}
                  </p>
                  <div className='flex flex-col w-full'>
                    <div className='flex flex-row gap-[4px]'>
                      <CustomTextField
                        placeholder={'ここにファイルをドラッグ＆ドロップしてアップロード'}
                        value={currentShowFile?.isUploaded ? currentShowFile?.file.name : ''}
                        className='w-[450px]'
                      ></CustomTextField>
                      <button
                        className='text-normal w-[100px] border-solid border-[1px] rounded-md p-2 bg-transparent text-primaryText hover:bg-gray-50 border-gray-200'
                        disabled={isDragReject}
                        type='button'
                      >
                        参照
                      </button>
                    </div>
                    <div>
                      {isDragAccept
                        ? 'ファイルをアップロードします。'
                        : isDragReject
                          ? 'エラー'
                          : ''}
                    </div>
                  </div>
                </div>
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
      </div>
      {/* ファイルアップロード中の表示 */}
      {currentShowFile && (
        <aside>
          {currentShowFile.isUploaded ? (
            <div></div>
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
});

export default PdfFileUploader;
