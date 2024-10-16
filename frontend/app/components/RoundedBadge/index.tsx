export const RoundedBadge = ({
  label,
  isValid = false,
}: {
  label: string;
  isValid?: boolean;
}) => {
  return (
    <span
      className={`px-[12px] py-[4px] rounded-full text-small border ${
        isValid
          ? ' border-secondary-500 text-secondary-500'
          : ' border-gray-30 text-white'
      }`}
    >
      {label}
    </span>
  );
};
