import { InsertLinkDialog } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/InsertLinkDialog';
import { CustomDropdown, InputLabel } from '@/app/components';
import {
  NotificationCreateFormInput,
  NotificationUpdateFormInput,
  SelectOption,
} from '@/app/types';
import { UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form';

type Props = {
  tournId: number;
  tournaments: SelectOption[];
  tournFieldProps: UseFormRegisterReturn<'tournId'>;
  bodyProps: UseFormRegisterReturn<'body'>;
  setValue: UseFormSetValue<NotificationCreateFormInput | NotificationUpdateFormInput>;
  handleConfirm: (textLink: { text: string; link: string }) => void;
};

export const TournFollowerForm: React.FC<Props> = (props) => {
  const { tournId, tournaments, tournFieldProps, bodyProps, setValue, handleConfirm } = props;

  return (
    <>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <InputLabel label='大会名' required />
        </div>
        <CustomDropdown<number>
          id='tourn-dropdown'
          options={tournaments}
          {...tournFieldProps}
          onChange={(value) => {
            setValue('tournId', Number(value));
          }}
          value={tournId}
        />
      </div>

      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <InputLabel label='本文' required />
          <InsertLinkDialog handleConfirm={handleConfirm} />
        </div>
        <textarea
          className='w-full h-40 p-2 border border-gray-300 rounded'
          rows={10}
          placeholder='大会に関するお知らせを記入してください。'
          {...bodyProps}
        />
      </div>
    </>
  );
};
