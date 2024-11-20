import { AllUserForm } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/AllUserForm';
import { QualifiedUserForm } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/QualifiedUserForm';
import { TournFollowerForm } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/TournFollowerForm';
import { UserFollowerForm } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/UserFollowerForm';
import { CustomButton, CustomTextField, CustomTitle, InputLabel } from '@/app/components';
import { NotificationToType } from '@/app/constants';
import { useUserType } from '@/app/hooks/useUserType';
import { SelectOption } from '@/app/types';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useForm } from 'react-hook-form';

export type CreateFormInput = {
  to: NotificationToType;
  subject: string;
  body: string;
  tournId: number;
  qualIds: number[];
};

type Props = {
  tournaments: SelectOption[];
  qualifications: SelectOption[];
  onSubmit: (formData: CreateFormInput) => void;
};

export const Create: React.FC<Props> = (props) => {
  const userType = useUserType();

  const { tournaments, qualifications, onSubmit } = props;
  const { register, setValue, handleSubmit, watch } = useForm<CreateFormInput>();

  const radioValues = [
    {
      label: '自分をフォローしているユーザー',
      value: 'userFollower',
      show: true,
    },
    {
      label: '大会をフォローしているユーザー',
      value: 'tournFollower',
      show: userType?.isOrganizationManager,
    },
    {
      label: '有資格者',
      value: 'qualifiedUser',
      show: userType?.isJara,
    },
    {
      label: '全ユーザー',
      value: 'allUser',
      show: userType?.isJara,
    },
  ] as const;

  const to = watch('to');
  const body = watch('body');
  const qualIds = watch('qualIds');

  const handleConfirm = (textLink: { text: string; link: string }) => {
    const mdText = `[${textLink.text}](${textLink.link})`;
    const newBody = body ? `${body}\n${mdText}` : mdText;
    setValue('body', newBody);
  };

  const conditionalFields: Record<CreateFormInput['to'], React.ReactNode> = {
    userFollower: (
      <UserFollowerForm
        bodyProps={register('body', { required: to === 'userFollower' })}
        setValue={setValue}
        handleConfirm={handleConfirm}
      />
    ),
    tournFollower: (
      <TournFollowerForm
        tournaments={tournaments}
        tournFieldProps={register('tournId', { required: to === 'tournFollower' })}
        bodyProps={register('body', { required: to === 'tournFollower' })}
        setValue={setValue}
        handleConfirm={handleConfirm}
      />
    ),
    qualifiedUser: (
      <QualifiedUserForm
        qualIds={qualIds}
        qualifications={qualifications}
        qualFieldProps={register('qualIds', { required: to === 'qualifiedUser' })}
        bodyProps={register('body', { required: to === 'qualifiedUser' })}
        setValue={setValue}
        handleConfirm={handleConfirm}
      />
    ),
    allUser: (
      <AllUserForm
        bodyProps={register('body', { required: to === 'allUser' })}
        setValue={setValue}
        handleConfirm={handleConfirm}
      />
    ),
  } as const;

  const ConditionalField = conditionalFields[to];

  return (
    <>
      <CustomTitle displayBack>通知登録</CustomTitle>

      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-12'>
        <div>
          <InputLabel label='To' required />
          <RadioGroup
            {...(register('to', { required: true }),
            {
              onChange: (e) => {
                setValue('to', e.target.value as CreateFormInput['to']);
              },
            })}
            aria-labelledby='controlled-radio-buttons-group'
            name='controlled-radio-buttons-group'
            className='text-sm'
          >
            {radioValues.map((x) => (
              <FormControlLabel
                key={x.value}
                value={x.value}
                control={<Radio size='small' />}
                label={x.label}
                disabled={!x.show}
              />
            ))}
          </RadioGroup>
        </div>

        <div className='flex flex-col gap-2'>
          <InputLabel label='件名' required />
          <CustomTextField
            className='w-full max-w-md'
            {...register('subject', { required: true })}
            onChange={(e) => setValue('subject', e.target.value)}
          />
        </div>

        {ConditionalField}

        <CustomButton type='submit' buttonType='primary' className='w-full max-w-sm mx-auto'>
          確認
        </CustomButton>
      </form>
    </>
  );
};
