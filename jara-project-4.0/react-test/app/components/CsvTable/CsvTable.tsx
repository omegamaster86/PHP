import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const CsvTable: React.FC<{ content: Array<Array<string>>; isSet: boolean }> = (props) => {
  // const [csvData, setCsvData] = useState(props);
  // console.log('csvtabelでcsvDataを表示します。');
  // console.log(csvData);
  console.log('csvtabelでpropsを表示します。');
  console.log(props);
  // const data = csvData?.content;
  const data = props.content;
  // function CsvTable({ data }: { data: Array<Array<string>> }) {
  // dataがundefinedまたは空の配列でないことを確認
  if (!data || data.length === 0) {
    console.log('データがありません。');
    console.log(data);
    return <p>データがありません。</p>;
  }

  return (
    <TableContainer className='mb-1' component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label='simple table'>
        <TableHead>
          <TableRow>
            <TableCell align='center' key={0}>
              選択
            </TableCell>
            <TableCell align='center' key={1}>
              連携
            </TableCell>
            {data[0].map((header: any, index: any) => (
              <TableCell align='center' key={index + 2}>
                {header}
              </TableCell>
            ))}
            <TableCell align='center' key={data[0].length - 1}>
              エラー内容
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.slice(1).map((row, rowIndex) => (
            <TableRow key={rowIndex} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell align='center' key={0}>
                <input type='checkbox' />
              </TableCell>
              <TableCell align='center' key={1}>
                {true ? '連携済み' : '未連携'}
              </TableCell>
              {row.map((cell, cellIndex) => (
                <TableCell
                  component='th'
                  scope='row'
                  align='center'
                  key={cellIndex + 1}
                  className='text-primaryText'
                >
                  {cell}
                </TableCell>
              ))}
              <TableCell align='center' key={row.length - 1}></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
export default CsvTable;
