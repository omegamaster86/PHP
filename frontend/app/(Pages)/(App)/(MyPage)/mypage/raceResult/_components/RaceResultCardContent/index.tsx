import Tag from '@/app/components/Tag';
import { getOfficialTypeLabel } from '@/app/constants/official';
import { MyPageRaceResultRecordInfoData } from '@/app/types';
import { formatDate } from '@/app/utils/dateUtil';
import { EventOutlined } from '@mui/icons-material';

type Props = {
  cardItem: MyPageRaceResultRecordInfoData;
};

const RaceResultCardContent: React.FC<Props> = (props) => {
  const { cardItem } = props;

  const tagEls = [
    <Tag
      key='official'
      tag={getOfficialTypeLabel(cardItem.official)}
      className='text-secondary-500 bg-secondary-100'
    />,
  ];

  return (
    <div className='flex flex-col text-xs'>
      <div className='flex gap-2 mb-2'>{tagEls.map((tag) => tag)}</div>

      <h2 className='text-lg font-bold mb-2 text-primary-300'>{cardItem.tournName}</h2>

      <div className='flex flex-col gap-1 mb-2'>
        <div className='flex items-center gap-2'>
          <EventOutlined sx={{ width: 20, height: 20 }} />
          <p>{formatDate(cardItem.startDateTime, 'yyyy/MM/dd')}</p>
        </div>
      </div>

      <p>{cardItem.raceName}</p>
      <p className='text-2xs'>{cardItem.byGroup}</p>
    </div>
  );
};

export default RaceResultCardContent;
