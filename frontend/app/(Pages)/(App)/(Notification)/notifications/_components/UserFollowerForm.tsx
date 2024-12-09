import { InsertLinkDialog } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/InsertLinkDialog';
import { InputLabel } from '@/app/components';
import { NotificationCreateFormInput, NotificationUpdateFormInput } from '@/app/types';
import { HTMLAttributes } from 'react';
import { UseFormSetValue } from 'react-hook-form';

type Props = {
  bodyProps: HTMLAttributes<HTMLTextAreaElement>;
  setValue: UseFormSetValue<NotificationCreateFormInput | NotificationUpdateFormInput>;
  handleConfirm: (textLink: { text: string; link: string }) => void;
};

export const UserFollowerForm: React.FC<Props> = (props) => {
  const { bodyProps, setValue, handleConfirm } = props;

  const handleChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue('body', e.target.value);
  };

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <InputLabel label='本文' required />
        <InsertLinkDialog handleConfirm={handleConfirm} />
      </div>
      <textarea
        className='w-full h-40 p-2 border border-gray-300 rounded'
        rows={10}
        placeholder='出場大会など、自分をフォローしているユーザーへのお知らせを記入してください。'
        {...bodyProps}
        onChange={handleChangeTextArea}
      />
    </div>
  );
};
