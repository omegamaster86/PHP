import type { ReactNode } from 'react';

const CustomButton = ({
  children,
  onClick,
  className,
  buttonType,
  icon,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  buttonType?: string;
  icon?: ReactNode;
  disabled?: boolean;
}) => (
  <button
    type='button'
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
    } ${disabled && 'opacity-20 cursor-not-allowed'}
  `}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

export default CustomButton;
