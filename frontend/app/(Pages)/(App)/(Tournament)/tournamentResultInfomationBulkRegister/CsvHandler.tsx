import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { FileRejection } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import CustomInputLabel from '@/app/components/InputLabel';
import CustomTextField from '@mui/material/TextField';
import { CustomButton } from '../../../../components';
import axios from '@/app/lib/axios';

interface Props {
  csvUploadProps: CsvUploadProps;
  csvDownloadProps: CsvDownloadProps;
}

interface FormData {
  tournId: number;
  eventYear: string;
  tournName: string;
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
  tournId: number;
  formData: FormData;
  checkTournName: (flg: boolean) => void;
}

// Handlerの型定義
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

    // CSVダウンロードのロジック
    try {
      // 大会IDを取得
      const tournData = props.csvDownloadProps.formData;
      const senddata = {
        tourn_id: tournData.tournId,
      };
      const response = await axios.post('api/getCsvFormatRaceData', senddata);

      const header = props.csvDownloadProps.header.map((h) => h.label).join(',');

      if (response.data.result.length == 0) {
        //レース情報が0件の場合
        if (
          window.confirm(
            '選択された大会に紐づくレースが登録されていません。入力項目のみが出力されたフォーマットを出力しますか？',
          )
        ) {
          csvContent = header;
          props.csvDownloadProps.filename =
            response.data.tournResult.tourn_name + '_レース結果一括登録用フォーマット.csv'; //ファイル名修正 20240412
        } else {
          csvContent = '';
        }
      } else {
        //レース情報が存在する場合
        props.csvDownloadProps.filename =
          response.data.tournResult.tourn_name + '_レース結果一括登録用フォーマット.csv'; //ファイル名修正 20240412
        // TODO: レース情報を取得してCSVに変換する処理を実装
        // csvContent = header + '\n' + raceResponse.data.map((row) => Object.values(row).join(',')).join('\n');
        csvContent = header + '\n';
        for (let index = 0; index < response.data.result.length; index++) {
          csvContent += response.data.result[index].tourn_id + ','; //大会ID
          if (response.data.tournResult.tournTypeName == '公式') {
            csvContent += `${response.data.tournResult.entrysystem_tourn_id ?? ''},`; //エントリー大会ID
          } else {
            csvContent += ','; //エントリー大会ID
          }
          csvContent += response.data.tournResult.tourn_name + ','; //大会名
          csvContent += ','; //選手ID
          csvContent += ','; //JARA選手コード
          csvContent += ','; //選手名
          csvContent += response.data.result[index].race_id + ','; //レースID
          if (response.data.tournResult.tournTypeName == '公式') {
            csvContent += `${response.data.result[index].entrysystem_race_id ?? ''},`; //エントリーレースID
          } else {
            csvContent += ','; //エントリーレースID
          }
          csvContent += response.data.result[index].race_number + ','; //レースNo.
          csvContent += response.data.result[index].race_name + ','; //レース名
          csvContent += response.data.result[index].race_class_id + ','; //レース区分ID
          if (response.data.result[index].race_class_id == 999) {
            csvContent += response.data.result[index].otherRaceClassName + ','; //レース区分名
          } else {
            csvContent += response.data.result[index].race_class_name + ','; //レース区分名
          }

          csvContent += ','; //団体ID
          csvContent += ','; //エントリー団体ID
          csvContent += ','; //団体名
          csvContent += ','; //クルー名
          csvContent += response.data.result[index].by_group + ','; //組別
          csvContent += response.data.result[index].event_id + ','; //種目ID
          if (response.data.result[index].event_id == 999) {
            csvContent += response.data.result[index].otherEventName + ',';
          } else {
            csvContent += response.data.result[index].event_name + ',';
          }
          csvContent += response.data.result[index].range + ','; //距離
          csvContent += ','; //順位
          csvContent += ','; //500mlapタイム
          csvContent += ','; //1000mlapタイム
          csvContent += ','; //1500mlapタイム
          csvContent += ','; //2000mlapタイム
          csvContent += ','; //最終タイム
          csvContent += ','; //ストロークレート（平均）
          csvContent += ','; //500mストロークレート
          csvContent += ','; //1000mストロークレート
          csvContent += ','; //1500mストロークレート
          csvContent += ','; //2000mストロークレート
          csvContent += ','; //心拍数（平均）
          csvContent += ','; //500m心拍数
          csvContent += ','; //1000m心拍数
          csvContent += ','; //1500m心拍数
          csvContent += ','; //2000m心拍数
          csvContent += ','; //公式／非公式
          csvContent += ','; //立ち合い有無
          csvContent += ','; //選手身長
          csvContent += ','; //選手体重
          csvContent += ','; //シート番号ID
          csvContent += ','; //シート番号
          csvContent += ','; //出漕結果記録名
          csvContent += ','; //発艇日時
          csvContent += ','; //天候
          csvContent += ','; //2000m地点風速
          csvContent += ','; //2000m地点風向
          csvContent += ','; //1000m地点風速
          csvContent += ','; //1000m地点風向
          if (index != response.data.result.length - 1) {
            csvContent += '\n'; //備考 ※最終行は改行なし
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
      alert('CSVのダウンロード中にエラーが発生しました。もう一度試してください。');
    }
  };

  /* ファイルアップロードのテキストボックスとボタンの表示 */
  return (
    <>
      <div className='flex flex-col gap-[10px] w-full'>
        <CustomInputLabel label={props.csvUploadProps.label} required></CustomInputLabel>
        {!props.csvUploadProps.readonly && (
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
        )}
        <div className='flex flex-row gap-[4px]'>
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
            <p className='h-12 w-[300px] text-secondaryText p-3 disable'>
              {currentShowFile?.file.name}
            </p>
          )}
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

export default CsvHandler;
