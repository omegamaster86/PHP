import type { ReactNode } from 'react';

export type CustomButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  buttonType?:
    | 'primary'
    | 'secondary'
    | 'white-outlined'
    | 'primary-outlined'
    | 'red-outlined'
    | 'white';
  icon?: ReactNode;
  disabled?: boolean;
  type?: HTMLButtonElement['type'];
};

const CustomButton = ({
  children,
  onClick,
  className,
  buttonType,
  icon,
  disabled,
  type = 'button',
}: CustomButtonProps) => (
  <button
    type={type}
    className={`${
      className ?? ''
    } text-normal h-12 w-72 border-solid border-[1px] rounded-[2px] p-2 flex justify-center items-center gap-2
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
    {icon}
    {children}
  </button>
);

export default CustomButton;
