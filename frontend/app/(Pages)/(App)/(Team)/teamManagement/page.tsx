// 機能名: 団体管理画面
'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import axios from '@/app/lib/axios';
import {
  CustomButton,
  ErrorBox,
  CustomTitle,
  CustomTable,
  CustomTh,
  CustomThead,
  CustomTbody,
  CustomTr,
  CustomTd,
} from '@/app/components';
import { TeamResponse } from '@/app/types';
import { DeleteOutline, EditOutlined } from '@mui/icons-material';
import Link from 'next/link';

export default function TeamManagement() {
  const [errorMessage, setErrorMessage] = useState([] as string[]);
  const [teamdata, setTeamdata] = useState([] as TeamResponse[]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const csrf = () => axios.get('/sanctum/csrf-cookie');
        await csrf();
        // const response = await axios.get<TeamResponse[]>('/teams');
        const responseData = await axios.get('/getOrganizationForOrgManagement'); //団体データ取得 20240201
        // console.log(responseData.data.result);
        setTeamdata(responseData.data.result);
      } catch (error) {
        setErrorMessage(['API取得エラー:' + (error as Error).message]);
      }
    };
    fetchData();
  }, []);

  //React_Laravelデータ送信テスト 20240108
  const onClick = async () => {
    const csrf = () => axios.get('/sanctum/csrf-cookie');
    await csrf();
    await axios.post('/postSample', "送信成功")
      .then((res) => {
        // console.log(res);
      }).catch(error => {
        // console.log(error);
      });
  };
  //React_Laravelデータ送信テスト 20240108

  return (
    <div>
      <main className='flex flex-col justify-start p-24 m-auto gap-[80px] my-[100px]'>
        <div className='w-full h-screen'>
          <div className='flex flex-row items-center justify-between flex-wrap'>
            {/* 画面名 */}
            <CustomTitle isCenter={false} displayBack={true}>
              団体管理
            </CustomTitle>
          </div>
        </div>
        {/* エラー表示１ */}
        <ErrorBox errorText={errorMessage} />
        <div className=''>
          <div className='w-full bg-primary-500 text-white h-[40px] flex justify-center items-center'>
            <div className='font-bold'>管理団体一覧</div>
          </div>
          <CustomTable>
            <CustomThead>
              <CustomTr>
                <CustomTh align='left'>団体種別</CustomTh>
                <CustomTh align='left'>エントリーシステムの団体ID</CustomTh>
                <CustomTh align='left'>団体ID</CustomTh>
                <CustomTh align='left'>団体名</CustomTh>
                <CustomTh align='left'>操作</CustomTh>
              </CustomTr>
            </CustomThead>
            <CustomTbody>
              {teamdata.map((row, index) => (
                <CustomTr key={index}>
                  {/* 団体種別 */}
                  <CustomTd>{row.teamTyp}</CustomTd>
                  {/* エントリーシステムの団体ID */}
                  <CustomTd>
                    <Link
                      className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                      href={{
                        pathname: '/teamRef',
                        query: { org_id: row.org_id.toString() },
                      }}
                      rel='noopener noreferrer'
                      target='_blank'
                    >
                      {row.entrysystem_org_id}
                    </Link>
                  </CustomTd>
                  {/* 団体ID */}
                  <CustomTd>
                    <Link
                      className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                      href={{
                        pathname: '/teamRef',
                        query: { org_id: row.org_id.toString() },
                      }}
                      rel='noopener noreferrer'
                      target='_blank'
                    >
                      {row.org_id}
                    </Link>
                  </CustomTd>
                  {/* 団体名 */}
                  <CustomTd>
                    <Link
                      className='text-primary-300 cursor-pointer underline hover:text-primary-50'
                      href={{
                        pathname: '/teamRef',
                        query: { org_id: row.org_id.toString() },
                      }}
                      rel='noopener noreferrer'
                      target='_blank'
                    >
                      {row.org_name}
                    </Link>
                  </CustomTd>
                  <CustomTd>
                    <div>
                      <div className='flex justify-center items-center gap-[10px]'>
                        {/* 更新ボタン */}
                        <CustomButton
                          onClick={() => {
                            router.push('/team?mode=update&org_id=' + row.org_id.toString());
                          }}
                          buttonType='white-outlined'
                          className='w-[60px] text-small h-[40px] p-[0px] border-transparent'
                        >
                          <EditOutlined className='text-secondaryText text-normal mr-[2px]'></EditOutlined>
                          更新
                        </CustomButton>
                        {/* 削除ボタン */}
                        <CustomButton
                          onClick={() => {
                            router.push('/teamRef?mode=delete&org_id=' + row.org_id.toString());
                          }}
                          buttonType='white-outlined'
                          className='w-[60px] text-small h-[40px] p-[0px] border-transparent'
                        >
                          <DeleteOutline className='text-secondaryText text-normal mr-[2px]' />
                          削除
                        </CustomButton>
                      </div>
                    </div>
                  </CustomTd>
                </CustomTr>
              ))}
            </CustomTbody>
          </CustomTable>
        </div>
        <div className='flex justify-center items-center gap-[20px] mt-[20px]'>
          {/* 戻るボタン */}
          <CustomButton
            buttonType='white-outlined'
            className='w-[120px] text-small'
            onClick={() => {
              router.back();
            }}
          >
            戻る
          </CustomButton>
        </div>
      </main>
    </div>
  );
}
