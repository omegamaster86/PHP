import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { FileRejection } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import CustomInputLabel from '@/app/components/InputLabel';
import CustomTextField from '@mui/material/TextField';
import { CustomButton } from '../../../../components';
import axios from '@/app/lib/axios';
import { FormData } from './FormDataInterface';

interface Props {
  csvUploadProps: CsvUploadProps;
  csvDownloadProps: CsvDownloadProps;
}

// CSVアップロードのプロパティの型定義
interface CsvUploadProps {
  label: string; // ラベル
  readonly: boolean; // 読み取り専用かどうか
  csvUpload: (newCsvData: { content: Array<Array<string>>; isSet: boolean }) => void; // CSVアップロード時のコールバック
  resetActivationFlg: () => void; // アクティベーションフラグのリセット
}

// CSVダウンロードのプロパティの型定義
interface CsvDownloadProps {
  data: any[];
  header: any[];
  filename: string;
  label: string;
  formData: FormData;
  checkTournName: (flg: boolean) => void;
}

export interface FileHandler {
  clearFile(): void;
}

// FileUploaderコンポーネント
const CsvHandler = forwardRef<FileHandler, Props>(function FileUploader(props, ref) {
  const [currentShowFile, setcurrentShowFile] = useState<{ file: File; isUploaded: boolean }>();
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
      setcurrentShowFile({ file, isUploaded: false });

      // アップロード成功時の処理
      setcurrentShowFile({ file, isUploaded: true });
    } catch (error) {
      // エラーが発生した場合の処理
      //console.log(`アップロード中にエラーが発生しました: ${error}`);
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
  const handleDownload = async () => {
    let csvContent = '';

    try {
      const tournData = props.csvDownloadProps.formData;
      const senddata = {
        tourn_id: tournData.tournId,
      };
      const response = await axios.post('api/getCsvFormatRaceData', senddata);

      const header = props.csvDownloadProps.header.map((h) => h.label).join(',');

      // CSVダウンロードのロジック
      if (response.data.result.length == 0) {
        if (
          window.confirm(
            '選択された大会に紐づくレースが登録されていません。入力項目のみが出力されたフォーマットを出力しますか？',
          )
        ) {
          csvContent = header;
          props.csvDownloadProps.filename =
            response.data.tournResult.tourn_name + '_大会エントリー一括登録用フォーマット.csv'; //ファイル名修正 20240419
        } else {
          csvContent = '';
        }
      } else {
        props.csvDownloadProps.filename =
          response.data.tournResult.tourn_name + '_大会エントリー一括登録用フォーマット.csv'; //ファイル名修正 20240419
        csvContent = header + '\n';
        for (let index = 0; index < response.data.result.length; index++) {
          csvContent += response.data.result[index].tourn_id + ','; //大会ID
          csvContent += response.data.tournResult.tourn_name + ','; //大会名
          csvContent += response.data.result[index].event_id + ','; //種目ID
          if (response.data.result[index].event_id == 999) {
            csvContent += response.data.result[index].otherEventName + ',';
          } else {
            csvContent += response.data.result[index].event_name + ',';
          }
          csvContent += response.data.result[index].race_class_id + ','; //レース区分ID
          if (response.data.result[index].race_class_id == 999) {
            csvContent += response.data.result[index].otherRaceClassName + ','; //レース区分名
          } else {
            csvContent += response.data.result[index].race_class_name + ','; //レース区分名
          }
          csvContent += response.data.result[index].race_id + ','; //レースID
          csvContent += response.data.result[index].race_name + ','; //レース名
          csvContent += response.data.result[index].by_group + ','; //組別
          csvContent += response.data.result[index].race_number + ','; //レースNo.
          csvContent += '-,'; //発艇日時
          csvContent += ','; //団体ID
          csvContent += ','; //団体名
          csvContent += ','; //クルー名
          csvContent += ','; //シート番号ID
          csvContent += ','; //シート番号
          csvContent += ','; //選手ID
          if (index != response.data.result.length - 1) {
            csvContent += '\n'; //選手名 ※最終行は改行なし
          }
        }
      }
    } catch (error) {
      alert('APIの呼び出しに失敗しました。:' + error);
    }

    if (csvContent === '') {
      return;
    }

    try {
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

  /* ファイルアップロードのテキストボックスとボタンの表示 */
  return (
    <>
      <div className='flex flex-col gap-[10px] w-full'>
        <CustomInputLabel label={props.csvUploadProps.label} required></CustomInputLabel>
        <CustomButton
          buttonType='primary'
          onClick={() => {
            props.csvDownloadProps.checkTournName(
              props.csvDownloadProps.formData.tournName === '' ||
                props.csvDownloadProps.formData.tournName === undefined,
            );
            if (
              !(
                props.csvDownloadProps.formData.tournName === '' ||
                props.csvDownloadProps.formData.tournName === undefined
              )
            ) {
              handleDownload();
            }
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
            <div>
              {isDragAccept ? 'ファイルをアップロードします。' : isDragReject ? 'エラー' : ''}
            </div>
          </div>
        )}
        {props.csvUploadProps.readonly && (
          <div>
            <CustomInputLabel label={props.csvUploadProps.label}></CustomInputLabel>
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

export default CsvHandler;
