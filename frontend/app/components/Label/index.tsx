export default function Label({
  label,
  textColor,
  textSize,
  isBold,
}: {
  label: string;
  textColor?: string;
  textSize?: string;
  isBold?: boolean;
}) {
  return (
    <div
      className={`
    ${
      textColor === 'secondary'
        ? 'text-secondaryText'
        : textColor === 'white'
          ? 'text-white'
          : textColor === 'gray'
            ? 'text-gray-40'
            : textColor === 'red'
              ? 'text-red'
              : 'text-primaryText'
    }
    ${
      textSize === 'h1'
        ? 'text-h1'
        : textSize === 'h2'
          ? 'text-h2'
          : textSize === 'h3'
            ? 'text-h3'
            : textSize === 'normal'
              ? 'text-normal'
              : textSize === 'small'
                ? 'text-small'
                : textSize === 'caption1'
                  ? 'text-caption1'
                  : textSize === 'caption2'
                    ? 'text-caption2'
                    : 'text-normal'
    }
    ${isBold ? 'font-bold' : 'font-normal'}
    `}
    >
      {label}
    </div>
  );
}
