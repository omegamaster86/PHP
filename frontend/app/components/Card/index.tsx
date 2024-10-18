type Props = {
  children?: React.ReactNode;
};

const Card: React.FC<Props> = (props) => {
  const { children } = props;
  return (
    <div className='bg-white rounded-xl border border-gray-100 border-opacity-50 p-4'>
      {children}
    </div>
  );
};

export default Card;
