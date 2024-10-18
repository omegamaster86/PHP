import Tag from '@/app/components/Tag';
import { formatDate } from '@/app/utils/dateUtil';
import { EventOutlined, LocationOnOutlined } from '@mui/icons-material';

export type TournamentCardItem = {
  id: number;
  title: string;
  tags: string[];
  date: string;
  venue: string;
  host: string;
};

type Props = {
  cardItem: TournamentCardItem;
};

const colorClasses: Record<string, string> = {
  公式: 'text-secondary-500 bg-secondary-100',
  チケット購入済み: 'text-primary-500 bg-primary-100',
};

const TournamentCardContent: React.FC<Props> = (props) => {
  const { cardItem } = props;
  return (
    <div className='flex flex-col text-xs'>
      <div className='flex gap-2 mb-2'>
        {cardItem.tags.map((tag) => (
          <Tag key={tag} tag={tag} className={colorClasses[tag]} />
        ))}
      </div>

      <h2 className='text-lg font-bold mb-2 text-primary-300'>{cardItem.title}</h2>

      <div className='flex flex-col gap-1 mb-2'>
        <div className='flex items-center gap-2'>
          <EventOutlined sx={{ width: 20, height: 20 }} />
          <p>{formatDate(cardItem.date, 'yyyy/MM/dd')}</p>
        </div>
        <div className='flex items-center gap-2'>
          <LocationOnOutlined sx={{ width: 20, height: 20 }} />
          <p>{cardItem.venue}</p>
        </div>

        <div>
          <span>主催団体</span>
          <p className='text-2xs'>{cardItem.host}</p>
        </div>
      </div>
    </div>
  );
};

export default TournamentCardContent;
