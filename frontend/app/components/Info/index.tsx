type Props = {
  label: string;
  value?: string | number | null;
};

const Info: React.FC<Props> = (props) => {
  const { label, value } = props;

  return (
    <div className='flex gap-2 text-sm'>
      <span className='font-semibold'>{label}</span>
      <p>{value}</p>
    </div>
  );
};

export default Info;
