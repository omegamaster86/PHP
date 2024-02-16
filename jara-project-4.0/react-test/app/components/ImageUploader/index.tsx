import React, { useState, useCallback, useEffect, Dispatch, SetStateAction, FC } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Papa from 'papaparse';
import CloseIcon from '@mui/icons-material/Close';

interface ImageUploaderProps {
  currentShowFile: { file: File; isUploaded: boolean; preview?: string } | undefined;
  setCurrentShowFile: Dispatch<
    SetStateAction<{ file: File; isUploaded: boolean; preview?: string } | undefined>
  >;
  initialPhotoUrl?: string;
  displayCloseIcon?: boolean;
}

const ImageUploader: FC<ImageUploaderProps> = ({
  currentShowFile,
  setCurrentShowFile,
  initialPhotoUrl,
  displayCloseIcon,
}) => {
  const [isinitial, setIsinitial] = useState(true);
  const [initialPhoto, setInitialPhoto] = useState('');
  const onUploadFile = async (file: File) => {
    isinitial && setIsinitial(false);
    try {
      setCurrentShowFile({ file, isUploaded: false });

      // const uploadTime = Math.random() * 9000 + 1000; // 1秒から10秒
      const uploadTime = 1000; // 1秒
      await new Promise((resolve) => setTimeout(resolve, uploadTime));

      // アップロード成功時の処理
      setCurrentShowFile({ file, isUploaded: true });
    } catch (error) {
      // ここでエラーに関するユーザーへの通知や処理を行う
      // alert(`アップロード中にエラーが発生しました: ${error}`);
      alert(`アップロード中にエラーが発生しました。`);
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
        setCurrentShowFile(
          acceptedFiles.map((file) => ({
            file,
            isUploaded: true,
            preview: URL.createObjectURL(file),
          }))[0],
        );
        Papa.parse(acceptedFiles[0], {
          header: true,
          complete: function (results: any) {
            // 成功時の処理
          },
        });
      } catch (error) {
        // ↓ここでエラーに関するユーザーへの通知や処理を行う
        // console.log(`アップロード中にエラーが発生しました: ${error}`);
        console.log(`アップロード中にエラーが発生しました。`);
      }
    },
    [currentShowFile],
  );

  const onDropRejected = useCallback((rejectedFiles: FileRejection[]) => {
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach(({ code }) => {
        let message = 'エラーが発生しました。';
        switch (code) {
          case 'file-too-large':
            message = `50MBを超えるサイズの画像ファイルはアップロードで出来ません。`;
            break;
          case 'file-invalid-type':
            message = `アップロードできるファイルの種類はjpg, pngのみです。`;
            break;
          case 'too-many-files':
            message = `複数のファイルは選択できません。`;
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
      'image/jpeg': [],
      'image/png': [],
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  useEffect(() => {
    if (initialPhotoUrl) {
      setInitialPhoto(initialPhotoUrl);
    }
  }, [initialPhotoUrl]);

  return (
    <div>
      <div>
        <div {...getRootProps()} className='w-[320px] h-[320px] justify-center flex dropzone'>
          {currentShowFile?.isUploaded ? (
            <div className='relative'>
              <button
                className='absolute rounded bg-transparent hover:bg-transparent text-primaryText h-12 w-[50px] top-1 right-[0px]'
                onClick={(e) => {
                  // 画像をクリアする
                  e.stopPropagation();
                  setCurrentShowFile(undefined);
                }}
              >
                <CloseIcon />
              </button>
              <img
                className='w-[320px] h-[320px] rounded-[2px] object-cover cursor-pointer'
                src={currentShowFile.preview}
                alt='image preview'
                // Revoke data uri after image is loaded
                onLoad={() => {}}
              />
            </div>
          ) : initialPhotoUrl && isinitial ? (
            <div className='relative'>
              {initialPhoto && (
                <button
                  className='absolute rounded bg-transparent hover:opacity-25 hover:bg-containerBg text-primaryText h-12 w-[50px] top-1 right-[0px]'
                  onClick={(e) => {
                    // 画像をクリアする
                    e.stopPropagation();
                    setInitialPhoto('');
                  }}
                >
                  <CloseIcon />
                </button>
              )}
              <img
                className='object-cover w-[320px] h-[320px] cursor-pointer'
                src={initialPhoto}
                // Revoke data uri after image is loaded
                onLoad={() => {}}
              />
            </div>
          ) : (
            <div className='w-[320px] h-[320px] bg-containerBg m-auto mt-auto justify-center flex items-center flex-col gap-[10px]'>
              <input {...getInputProps()} />
              <UploadFileIcon className='w-full h-5 w-[32px] h-[32px] text-primaryText' />
              <p className='text-secondaryText border-secondaryText text-sm'>ファイルを選択</p>
              <p className='text-secondaryText text-sm'>
                {isDragReject ? 'このファイル形式のアップロードは許可されていません。' : 'or'}
              </p>
              <button
                className='text-secondaryText py-2.5 px-5 me-2 mb-2 text-small font-medium text-gray-900 focus:outline-none border border-dashed border-secondaryText hover:bg-containerBg focus:z-10 focus:ring-4 focus:ring-primary-50'
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

export default ImageUploader;
