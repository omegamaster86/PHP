'use client';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import CustomButton from '@/app/components/CustomButton';
import Header from '@/app/components/Header';

interface teamResponse {
  teamTyp: string;
  entteamId: string;
  teamId: string;
  name: string;
}

export default function TeamManagement() {
  const [error, setError] = React.useState({ isError: false, errorMessage: '' });
  const [teamdata, setTeamdata] = React.useState([] as teamResponse[]);
  const router = useRouter();

  var responseData = null; //Laravel_Reactデータ送信テスト 20231227
  var buttonValue = "送信ボタン";

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        responseData = await axios.get('http://localhost:8000/api/list'); //Laravel_Reactデータ送信テスト 20231227
        console.log(responseData.data.post[0].content); //Laravel_Reactデータ送信テスト 20231227
        console.log(responseData.data.post[0].title); //Laravel_Reactデータ送信テスト 20231227
        console.log(responseData.data.post[1].content); //Laravel_Reactデータ送信テスト 20231227
        console.log(responseData.data.post[1].title); //Laravel_Reactデータ送信テスト 20231227
        console.log(responseData.data.post[2].content); //Laravel_Reactデータ送信テスト 20231227
        console.log(responseData.data.post[2].title); //Laravel_Reactデータ送信テスト 20231227
        // 仮のURL（繋ぎ込み時に変更すること）
        const response = await axios.get<teamResponse[]>('http://localhost:3100/teams');
        setTeamdata(response.data);
      } catch (error) {
        setError({ isError: true, errorMessage: 'API取得エラー:' + (error as Error).message });
      }
    };
    fetchData();
  }, []);

  //React_Laravelデータ送信テスト 20240108
  const onClick = async () => {
    await axios.post('http://localhost:8000/api/postSample', "送信成功")
      .then((res) => {
        console.log(res);
      }).catch(error => {
        console.log(error);
      });
  }
  //React_Laravelデータ送信テスト 20240108

  return (
    <div>
      <Header />
      <main className='flex min-h-screen w-max max-w-[900px] flex-col justify-start p-24 m-auto gap-[80px] my-[100px]'>
        <div className='relative w-full h-screen'>
          <div className='m-3 flex flex-row items-center justify-center'>
            <div className='text-h1 font-bold'>団体管理画面</div>
            <CustomButton
              className='primary absolute right-[10px] top-[10px] w-[120px]'
              onClick={() => {
                router.push('/teamRegistration');
                // 団体登録画面に遷移
              }}
            >
              団体登録
            </CustomButton>
          </div>
        </div>
        {error.isError && (
          <div className='relative w-full my-3 h-[50px] bg-systemErrorBg border-systemErrorText border-solid border-[1px] flex justify-center items-center text-systemErrorText'>
            <div className=''>{error.errorMessage}</div>
          </div>
        )}
        {/*  検索エリア */}
        <div className=''>
          <div className='w-full bg-primary-500 text-white h-[40px] flex justify-center items-center'>
            <div className='font-bold'>管理団体一覧</div>
          </div>
          <TableContainer className='' component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label='simple table'>
              <TableHead>
                <TableRow>
                  <TableCell>団体種別</TableCell>
                  <TableCell align='center'>エントリーシステムの団体ID</TableCell>
                  <TableCell align='center'>団体ID</TableCell>
                  <TableCell align='center'>団体名</TableCell>
                  <TableCell align='center'>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {teamdata.map((row) => (
                  <TableRow
                    key={row.teamId}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component='th' scope='row'>
                      {row.teamTyp}
                    </TableCell>
                    <TableCell
                      align='center'
                      className='text-primary-200 underline hover:text-primary-50'
                    >
                      <Link
                        href={'teamInfoUpdate?teamId=' + row.teamId.toString()}
                        rel='noopener noreferrer'
                        target='_blank'
                      >
                        {row.entteamId}
                      </Link>
                    </TableCell>
                    <TableCell
                      align='center'
                      className='text-primary-200 underline hover:text-primary-50'
                    >
                      <Link
                        href={'teamInfoUpdate?teamId=' + row.teamId.toString()}
                        rel='noopener noreferrer'
                        target='_blank'
                      >
                        {row.teamId}
                      </Link>
                    </TableCell>
                    <TableCell
                      align='center'
                      className='text-primary-200 underline hover:text-primary-50'
                    >
                      <Link
                        href={'teamInfoUpdate?teamId=' + row.teamId.toString()}
                        rel='noopener noreferrer'
                        target='_blank'
                      >
                        {row.name}
                      </Link>
                    </TableCell>
                    <TableCell align='center'>
                      <div className='flex justify-center gap-[10px]'>
                        <CustomButton
                          onClick={() => {
                            router.push('/teamInfoUpdate?teamId=' + row.teamId.toString());
                          }}
                          className='secondary w-[80px]'
                        >
                          更新
                        </CustomButton>
                        <CustomButton
                          onClick={() => {
                            router.push('/teamInfoDelete?teamId=' + row.teamId.toString());
                          }}
                          className='bg-transparent text-primaryText hover:bg-gray-50 w-[80px]'
                        >
                          削除
                        </CustomButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div className='flex justify-center items-center gap-[20px] mt-[20px]'>
          <CustomButton
            className='secondary w-[120px]'
            onClick={() => {
              router.back();
            }}
          >
            戻る
          </CustomButton>
          {/* React_Laravelデータ送信テスト 20231228 */}
          {/* <form name="postSample" onSubmit={(event) => handleSubmit(event)}> */}
          <form name="postSample">
            <label htmlFor="name">Name: </label>
            <br />
            <input type="text" id="name" name="name" />
            <br />
            <input type="button" defaultValue={buttonValue} onClick={onClick} />
          </form>
          {/* React_Laravelデータ送信テスト 20231228 */}
        </div>
      </main>
    </div>
  );
}
