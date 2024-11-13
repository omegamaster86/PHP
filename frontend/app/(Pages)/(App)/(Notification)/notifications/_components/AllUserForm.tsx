import { CreateFormInput } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/Create';
import { InsertLinkDialog } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/InsertLinkDialog';
import { InputLabel } from '@/app/components';
import { UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form';

type Props = {
  bodyProps: UseFormRegisterReturn<'body'>;
  setValue: UseFormSetValue<CreateFormInput>;
  handleConfirm: (textLink: { text: string; link: string }) => void;
};

export const AllUserForm: React.FC<Props> = (props) => {
  const { bodyProps, handleConfirm } = props;

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <InputLabel label='本文' required />
        <InsertLinkDialog handleConfirm={handleConfirm} />
      </div>
      <textarea
        className='w-full h-40 p-2 border border-gray-300 rounded'
        rows={10}
        placeholder='全ユーザーに向けたお知らせを記入してください。'
        {...bodyProps}
      />
    </div>
  );
};
