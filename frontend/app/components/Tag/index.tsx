type Props = {
  tag: string;
};

const Tag: React.FC<Props> = (props) => {
  const { tag } = props;

  return (
    <span className='flex justify-center items-center py-1 px-2 h-6 bg-gray-50 rounded-lg text-2xs'>
      {tag}
    </span>
  );
};

export default Tag;
