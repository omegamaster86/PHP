import Tag from '@/app/components/Tag';
import { getTournTypeLabel } from '@/app/constants';
import { MyPageTournamentInfoData } from '@/app/types';
import { formatDate } from '@/app/utils/dateUtil';
import { EventOutlined, LocationOnOutlined } from '@mui/icons-material';

type Props = {
  cardItem: MyPageTournamentInfoData;
};

const TournamentCardContent: React.FC<Props> = (props) => {
  const { cardItem } = props;

  const tagEls = [
    <Tag
      key='tournType'
      tag={getTournTypeLabel(cardItem.tournType)}
      className='text-secondary-500 bg-secondary-100'
    />,
    cardItem.isPurchased && (
      <Tag key='ticket' tag='チケット購入済み' className='text-primary-500 bg-primary-100' />
    ),
  ].filter(Boolean);

  return (
    <div className='flex flex-col text-xs'>
      <div className='flex gap-2 mb-2'>{tagEls.map((tag) => tag)}</div>

      <h2 className='text-lg font-bold mb-2 text-primary-300'>{cardItem.tournName}</h2>

      <div className='flex flex-col gap-1 mb-2'>
        <div className='flex items-center gap-2'>
          <EventOutlined sx={{ width: 20, height: 20 }} />
          <p>{formatDate(cardItem.eventStartDate, 'yyyy/MM/dd')}</p>
        </div>
        <div className='flex items-center gap-2'>
          <LocationOnOutlined sx={{ width: 20, height: 20 }} />
          <p>{cardItem.venueName}</p>
        </div>

        <div>
          <span>主催団体</span>
          <p className='text-2xs'>{cardItem.sponsorOrgName}</p>
        </div>
      </div>
    </div>
  );
};

export default TournamentCardContent;
