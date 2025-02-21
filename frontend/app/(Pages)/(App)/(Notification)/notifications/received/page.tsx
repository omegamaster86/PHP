'use client';

import { CustomTitle } from '@/app/components';
import NotificationsList from '@/app/components/NotificationsList';

const page = () => {
  return (
    <>
      <CustomTitle displayBack>{'受信通知一覧'}</CustomTitle>
      <NotificationsList />
    </>
  );
};

export default page;
