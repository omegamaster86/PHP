import Card from '@/app/components/Card';
import Link from 'next/link';

type Props = {
  href: string;
  children?: React.ReactNode;
};

const LinkCard: React.FC<Props> = (props) => {
  const { href, children } = props;

  return (
    <Link href={href} className='rounded-xl'>
      <Card>{children}</Card>
    </Link>
  );
};

export default LinkCard;
