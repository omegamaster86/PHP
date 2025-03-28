type Props = {
  active: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const MenuButton: React.FC<Props> = (props) => {
  const { active, ...rest } = props;

  const className = `${
    active ? 'border-b-[2px] rounded-none border-solid border-primary-500 text-primary-500' : ''
  } flex justify-center items-center h-[49px] cursor-pointer ${
    props.className ?? ''
  }`;

  return <button {...rest} className={className} />;
};

export default MenuButton;
