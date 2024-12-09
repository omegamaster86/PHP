import { InsertLinkDialog } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/InsertLinkDialog';
import { CustomDropdown, InputLabel } from '@/app/components';
import {
  NotificationCreateFormInput,
  NotificationUpdateFormInput,
  SelectOption,
} from '@/app/types';
import { UseFormRegisterReturn, UseFormSetValue } from 'react-hook-form';

type Props = {
  qualIds: string[];
  qualifications: SelectOption<string>[];
  qualFieldProps: UseFormRegisterReturn<'qualIds'>;
  bodyProps: UseFormRegisterReturn<'body'>;
  setValue: UseFormSetValue<NotificationCreateFormInput | NotificationUpdateFormInput>;
  handleConfirm: (textLink: { text: string; link: string }) => void;
};

export const QualifiedUserForm: React.FC<Props> = (props) => {
  const { qualIds, qualifications, qualFieldProps, bodyProps, setValue, handleConfirm } = props;

  const { ref: _, ...restQualFieldProps } = qualFieldProps;

  return (
    <>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <InputLabel label='資格' required />
        </div>
        <CustomDropdown<string[]>
          id='qual-dropdown'
          options={qualifications}
          {...restQualFieldProps}
          onChange={(value) => {
            setValue('qualIds', value);
          }}
          value={qualIds ?? []}
          multiple
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
          placeholder='資格に関するお知らせを記入してください。'
          {...bodyProps}
        />
      </div>
    </>
  );
};
