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
}

export const TitleSideButton: React.FC<Props> = ({ href, icon: Icon, text = '' }) => {
  return (
    <Link
      href={href}
      target='_blank'
      className='text-primary-500 border border-primary-500 p-2 flex gap-1 items-center'
    >
      <Icon sx={{ fontSize: 18, m: 0 }} />
      <span className='hidden sm:inline font-normal'>{text}</span>
    </Link>
  );
};
