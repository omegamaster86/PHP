import { CustomDialog, InputLabel } from '@/app/components';
import Validator from '@/app/utils/validator';
import { InsertLinkOutlined } from '@mui/icons-material';
import { useForm } from 'react-hook-form';

type Props = {
  handleConfirm: (textLink: { text: string; link: string }) => void;
};

type InsertLink = {
  text: string;
  link: string;
};

export const InsertLinkDialog: React.FC<Props> = (props) => {
  const { handleConfirm } = props;

  const { register, handleSubmit, reset, getValues } = useForm<InsertLink>();

  const ok = () => {
    const text = getValues('text');
    const link = getValues('link');
    const isValidLink = Validator.isValidUrl(link);

    if (!text || !link || !isValidLink) {
      return false;
    }

    handleSubmit(handleConfirm)();
    reset();

    return true;
  };
  const cancel = () => {
    reset();
  };

  return (
    <CustomDialog
      title='リンクを追加する'
      icon={<InsertLinkOutlined />}
      buttonLabel='リンク挿入'
      buttonType='white-outlined'
      className='!w-36'
      handleConfirm={ok}
      handleCancel={cancel}
      confirmButtonType='submit'
      confirmButtonLabel='保存する'
      withDividers={false}
      withCloseIcon
      displayCancel
    >
      <form className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <InputLabel label='テキスト' />
          <input
            type='text'
            className='w-full p-2 border border-gray-300 rounded'
            placeholder='テキスト'
            {...register('text')}
          />
        </div>

        <div className='flex flex-col gap-2'>
          <InputLabel label='リンク' />
          <input
            type='url'
            className='w-full p-2 border border-gray-300 rounded'
            placeholder='リンク'
            {...register('link')}
          />
        </div>
      </form>
    </CustomDialog>
  );
};
