import { cn } from '@/app/utils/cn';
import Link, { LinkProps } from 'next/link';
import React, { ComponentType } from 'react';

interface Props {
  href: LinkProps['href'];
  icon: ComponentType<{
    sx: {
      fontSize: number;
      m: number;
    };
  }>;
  text: string;
  textClassName?: string;
  className?: string;
  external?: boolean;
}

export const TitleSideButton: React.FC<Props> = ({
  href,
  icon: Icon,
  text = '',
  className,
  textClassName,
  external = true,
}) => {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      className={cn(
        'text-primary-500 border border-primary-500 p-2 flex gap-1 items-center',
        className,
      )}
    >
      <Icon sx={{ fontSize: 18, m: 0 }} />
      <span className={cn('hidden sm:inline font-normal', textClassName)}>{text}</span>
    </Link>
  );
};
