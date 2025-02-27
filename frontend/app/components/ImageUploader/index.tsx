import React, { useState, useCallback, useEffect, Dispatch, SetStateAction, FC } from 'react';
import { useDropzone } from 'react-dropzone';
import type { FileRejection } from 'react-dropzone';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Papa from 'papaparse';
import CloseIcon from '@mui/icons-material/Close';
import { Avatar } from '@mui/material';

interface ImageUploaderProps {
  currentShowFile: { file: File; isUploaded: boolean; preview?: string } | undefined;
  setCurrentShowFile: Dispatch<
    SetStateAction<{ file: File; isUploaded: boolean; preview?: string } | undefined>
  >;
  setFormData: Dispatch<SetStateAction<any>>;
  initialPhotoUrl?: string;
  displayCloseIcon?: boolean;
}

const ImageUploader: FC<ImageUploaderProps> = ({
  currentShowFile,
  setCurrentShowFile,
  setFormData,
  initialPhotoUrl,
  displayCloseIcon,
}) => {
  const [isinitial, setIsinitial] = useState(true);
  const [initialPhoto, setInitialPhoto] = useState('');
  const onUploadFile = async (file: File) => {
    isinitial && setIsinitial(false);
    try {
      setCurrentShowFile({ file, isUploaded: false });

      const uploadTime = 1000; // 1秒
      await new Promise((resolve) => setTimeout(resolve, uploadTime));

      // アップロード成功時の処理
      setCurrentShowFile({ file, isUploaded: true });
    } catch (error) {
      // ここでエラーに関するユーザーへの通知や処理を行う
      alert(`アップロード中にエラーが発生しました。`);
    }
  };

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
        //console.log(`アップロード中にエラーが発生しました。`);
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
    <>
      <div {...getRootProps()} className='w-full h-[320px] justify-center flex dropzone'>
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
            <Avatar
              alt='プレビュー画像'
              src={currentShowFile.preview}
              sx={{ width: 200, height: 200, cursor: 'pointer' }}
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
                  setFormData((prevFormData: any) => ({
                    ...prevFormData,
                    uploadedPhotoName: '',
                    uploadedPhoto: undefined,
                    photo: '',
                  })) as void;
                  setInitialPhoto('');
                }}
              >
                <CloseIcon />
              </button>
            )}
            {initialPhoto ? (
              <Avatar
                alt='プレビュー画像'
                src={initialPhoto}
                sx={{ width: 200, height: 200, cursor: 'pointer' }}
              />
            ) : (
              <div className='w-[320px] h-[320px] bg-containerBg m-auto mt-auto justify-center flex items-center flex-col gap-[10px]'>
                <input {...getInputProps()} />
                <UploadFileIcon className='text-primaryText' />
                <p className='text-secondaryText border-secondaryText text-sm'>ファイルを選択</p>
                <p className='text-secondaryText text-sm'>
                  {isDragReject ? 'このファイル形式のアップロードは許可されていません。' : 'or'}
                </p>
                <button
                  className='py-2.5 px-5 text-small font-medium text-gray-900 focus:outline-none border border-dashed border-secondaryText hover:bg-containerBg focus:z-10 focus:ring-4 focus:ring-primary-50'
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
        ) : (
          <div className='w-full h-[320px] bg-containerBg m-auto mt-auto justify-center flex items-center flex-col gap-[10px]'>
            <input {...getInputProps()} />
            <UploadFileIcon className='text-primaryText' />
            <p className='text-secondaryText border-secondaryText text-sm'>ファイルを選択</p>
            <p className='text-secondaryText text-sm'>
              {isDragReject ? 'このファイル形式のアップロードは許可されていません。' : 'or'}
            </p>
            <button
              className='py-2.5 px-5 text-small font-medium text-gray-900 focus:outline-none border border-dashed border-secondaryText hover:bg-containerBg focus:z-10 focus:ring-4 focus:ring-primary-50'
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
      {currentShowFile && (
        <aside>
          {currentShowFile.isUploaded ? (
            <p>{currentShowFile.file.name}</p>
          ) : (
            <p>{currentShowFile.file.name}をアップロードしています…</p>
          )}
        </aside>
      )}
    </>
  );
};

export default ImageUploader;
