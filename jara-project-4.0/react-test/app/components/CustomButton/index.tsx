const CustomButton = ({
  children,
  onClick,
  className,
  buttonType,
  icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  buttonType?: string;
  icon?: React.ReactNode;
}) => (
  <button
    className={`${className} text-normal h-12 w-72 border-solid border-[1px] rounded-[2px] p-2
      ${
        buttonType === 'primary'
          ? 'bg-primary-500 text-white hover:bg-primary-700'
          : buttonType === 'white-outlined'
            ? 'bg-transparent text-secondaryText hover:bg-gray-50 border-gray-100'
            : buttonType === 'primary-outlined'
              ? 'bg-transparent text-primary-500 hover:bg-gray-50 border-primary-500'
              : buttonType === 'red-outlined'
                ? 'bg-transparent text-systemErrorText hover:bg-gray-50 border-systemErrorText'
                : 'bg-white'
      }`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default CustomButton;
