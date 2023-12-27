const CustomButton = ({
  children,
  onClick,
  className,
  width,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  width?: string;
}) => (
  <button
    className={`text-base h-12 w-72 border-solid border-gray-200 border-[1px] rounded-md p-2 ${className}
      ${
        className?.split(' ')[0] === 'primary'
          ? 'bg-primary-500 text-white hover:bg-primary-700'
          : className?.split(' ')[0] === 'secondary'
            ? 'bg-transparent text-primaryText hover:bg-gray-50'
            : ''
      }`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default CustomButton;
