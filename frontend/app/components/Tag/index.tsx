import clsx from 'clsx';

type Props = {
  tag: string;
} & React.HTMLAttributes<HTMLSpanElement>;

const Tag: React.FC<Props> = (props) => {
  const { tag, ...rest } = props;

  const className = clsx(
    'flex justify-center items-center py-1 px-2 h-6 rounded-lg text-2xs md:text-xs',
    props.className,
  );

  return (
    <span {...rest} className={className}>
      {tag}
    </span>
  );
};

export default Tag;
