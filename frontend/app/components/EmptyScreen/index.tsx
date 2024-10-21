type Props = {
  message: string;
  textClass?: string;
};

const EmptyScreen: React.FC<Props> = (props) => {
  const { message, textClass } = props;

  return (
    <div className='flex flex-col items-center justify-center'>
      <p className={textClass}>{message}</p>
    </div>
  );
};

export default EmptyScreen;
