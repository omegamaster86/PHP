import { AllUserForm } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/AllUserForm';
import { QualifiedUserForm } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/QualifiedUserForm';
import { TournFollowerForm } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/TournFollowerForm';
import { UserFollowerForm } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/UserFollowerForm';
import { CustomButton, CustomTextField, CustomTitle, ErrorBox, InputLabel } from '@/app/components';
import { useUserType } from '@/app/hooks/useUserType';
import { NotificationCreateFormInput, SelectOption } from '@/app/types';
import { getSessionStorage, getStorageKey } from '@/app/utils/sessionStorage';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useForm } from 'react-hook-form';

type Props = {
  tournaments: SelectOption[];
  qualifications: SelectOption<string>[];
  onSubmit: (formData: NotificationCreateFormInput) => void;
};

const storageKey = getStorageKey({
  pageName: 'notification',
  type: 'create',
});

const errorMessages = {
  to: 'Toを選択してください。',
  title: '件名を入力してください。',
  body: '本文を入力してください。',
  tournId: '大会名を選択してください。',
  qualIds: '資格を選択してください。',
};
export const Create: React.FC<Props> = (props) => {
  const { tournaments, qualifications, onSubmit } = props;
  const userType = useUserType();
  const draftFormData = getSessionStorage<NotificationCreateFormInput>(storageKey);

  const { register, setValue, handleSubmit, watch, formState } =
    useForm<NotificationCreateFormInput>({
      defaultValues: {
        to: draftFormData?.to,
        title: draftFormData?.title,
        body: draftFormData?.body,
        tournId: draftFormData?.tournId,
        qualIds: draftFormData?.qualIds ?? [],
      },
    });

  const radioValues = [
    {
      label: '自分をフォローしているユーザー',
      value: 'userFollower',
      show: userType?.isPlayer,
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
  const tournId = watch('tournId');
  const qualIds = watch('qualIds');

  const handleConfirm = (textLink: { text: string; link: string }) => {
    const mdText = `[${textLink.text}](${textLink.link})`;
    const newBody = body ? `${body}\n${mdText}` : mdText;
    setValue('body', newBody);
  };

  const conditionalFields: Record<NotificationCreateFormInput['to'], React.ReactNode> = {
    userFollower: (
      <UserFollowerForm
        bodyProps={register('body', {
          required: to === 'userFollower' ? errorMessages.body : false,
        })}
        setValue={setValue}
        handleConfirm={handleConfirm}
      />
    ),
    tournFollower: (
      <TournFollowerForm
        tournId={tournId}
        tournaments={tournaments}
        tournFieldProps={register('tournId', {
          required: to === 'tournFollower' ? errorMessages.tournId : false,
        })}
        bodyProps={register('body', {
          required: to === 'tournFollower' ? errorMessages.body : false,
        })}
        setValue={setValue}
        handleConfirm={handleConfirm}
      />
    ),
    qualifiedUser: (
      <QualifiedUserForm
        qualIds={qualIds}
        qualifications={qualifications}
        qualFieldProps={register('qualIds', {
          required: to === 'qualifiedUser' ? errorMessages.qualIds : false,
        })}
        bodyProps={register('body', {
          required: to === 'qualifiedUser' ? errorMessages.body : false,
        })}
        setValue={setValue}
        handleConfirm={handleConfirm}
      />
    ),
    allUser: (
      <AllUserForm
        bodyProps={register('body', { required: to === 'allUser' ? errorMessages.body : false })}
        setValue={setValue}
        handleConfirm={handleConfirm}
      />
    ),
  } as const;

  const ConditionalField = conditionalFields[to];

  const formErrorMessages = [
    formState.errors.to?.message,
    formState.errors.title?.message,
    formState.errors.tournId?.message,
    formState.errors.qualIds?.message,
    formState.errors.body?.message,
  ].filter((x): x is string => !!x);

  return (
    <>
      <ErrorBox errorText={formErrorMessages} />

      <CustomTitle displayBack>通知登録</CustomTitle>

      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-12'>
        <div>
          <InputLabel label='To' required />
          <RadioGroup
            {...(register('to', { required: errorMessages.to }),
            {
              onChange: (e) => {
                setValue('to', e.target.value as NotificationCreateFormInput['to']);
              },
              value: to,
            })}
            aria-labelledby='controlled-radio-buttons-group'
            name='controlled-radio-buttons-group'
            className='text-sm w-max'
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
            {...register('title', { required: errorMessages.title })}
            onChange={(e) => setValue('title', e.target.value)}
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
