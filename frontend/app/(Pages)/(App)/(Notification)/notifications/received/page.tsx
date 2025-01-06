'use client';

import NotificationsList from '@/app/components/NotificationsList';
import { CustomTitle } from '@/app/components';

const page = () => {
  return (
    <>
      <CustomTitle displayBack>{'受信通知一覧'}</CustomTitle>
      <NotificationsList />;
    </>
  );
};

export default page;
