import { RoundedBadge } from '@/app/components';
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
    <RoundedBadge key='tournType' label={getTournTypeLabel(cardItem.tournType)} isValid />,
    // TODO: チケット購入済みフラグの実装時にコメントアウトを外す
    // true && (
    //   <RoundedBadge key='ticket' label='チケット購入済み' className='text-primary-500 bg-primary-100' />
    // ),
  ];

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
