import { NotificationToType } from '@/app/constants';

interface SelectOption<T extends string | number = number> {
  key: T;
  value: string;
}

type NotificationCreateFormInput = {
  to: NotificationToType;
  title: string;
  body: string;
  tournId: number;
  qualIds: string[];
};

type NotificationUpdateFormInput = {
  to: NotificationToType;
  title: string;
  body: string;
  tournId: number;
  qualIds: string[];
};

export type { NotificationCreateFormInput, NotificationUpdateFormInput, SelectOption };
