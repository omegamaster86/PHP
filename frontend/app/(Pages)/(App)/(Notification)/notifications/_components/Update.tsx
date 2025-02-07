import { AllUserForm } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/AllUserForm';
import { QualifiedUserForm } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/QualifiedUserForm';
import { TournFollowerForm } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/TournFollowerForm';
import { UserFollowerForm } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/UserFollowerForm';
import { CustomButton, CustomTextField, CustomTitle, InputLabel } from '@/app/components';
import { getNotificationDestinationType } from '@/app/constants';
import { useUserType } from '@/app/hooks/useUserType';
import { fetcher } from '@/app/lib/swr';
import { NotificationInfoData, NotificationUpdateFormInput, SelectOption } from '@/app/types';
import { getSessionStorage, getStorageKey } from '@/app/utils/sessionStorage';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useSWR from 'swr';

type Props = {
  tournaments: SelectOption[];
  qualifications: SelectOption<string>[];
  onSubmit: (formData: NotificationUpdateFormInput, notificationId: number) => void;
};

export const Update: React.FC<Props> = (props) => {
  const { tournaments, qualifications } = props;

  const userType = useUserType();
  const searchParams = useSearchParams();

  const notificationId = Number(searchParams.get('id'));
  const source = searchParams.get('source') as 'confirm' | null;

  const storageKey = getStorageKey({
    pageName: 'notification',
    type: 'update',
    id: notificationId,
  });
  const draftFormData = getSessionStorage<NotificationUpdateFormInput>(storageKey);

  const { data } = useSWR(
    {
      url: 'api/getNotificationInfoData',
      params: {
        notificationId,
      },
    },
    notificationId ? fetcher<NotificationInfoData> : null,
    { suspense: true },
  );

  const defaultValues: Partial<NotificationUpdateFormInput> = {
    to: getNotificationDestinationType(data.result.notificationDestinationTypeId),
    title: data.result.title,
    body: data.result.body,
    tournId: data.result.tournId ?? undefined,
    qualIds: [
      ...data.result.coachQualIds.map((id) => `coach_${id}`),
      ...data.result.refereeQualIds.map((id) => `referee_${id}`),
    ],
  };

  const { register, setValue, handleSubmit, watch } = useForm<NotificationUpdateFormInput>({
    defaultValues,
  });

  const to = watch('to');
  const body = watch('body');
  const tournId = watch('tournId');
  const qualIds = watch('qualIds');

  const setValues = (data: NotificationUpdateFormInput) => {
    setValue('title', data.title);
    setValue('body', data.body);
    setValue('tournId', data.tournId);
    setValue('qualIds', data.qualIds);
  };

  useEffect(() => {
    // draftFormDataがない場合は復元しない
    if (!draftFormData) {
      return;
    }

    // 確認画面から戻ってきた場合はdraftFormDataをそのまま復元
    if (source === 'confirm') {
      setValues(draftFormData);
      return;
    }

    const ok = confirm('編集中の入力内容があります。復元しますか？');
    if (ok) {
      setValues(draftFormData);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirm = (textLink: { text: string; link: string }) => {
    const mdText = `[${textLink.text}](${textLink.link})`;
    const newBody = body ? `${body}\n${mdText}` : mdText;
    setValue('body', newBody);
  };

  const onSubmit = (data: NotificationUpdateFormInput) => {
    props.onSubmit(data, notificationId);
  };

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

  const conditionalFields = {
    userFollower: (
      <UserFollowerForm
        bodyProps={register('body', { required: to === 'userFollower' })}
        setValue={setValue}
        handleConfirm={handleConfirm}
      />
    ),
    tournFollower: (
      <TournFollowerForm
        tournId={tournId}
        tournaments={tournaments}
        tournFieldProps={register('tournId', { required: to === 'tournFollower', disabled: true })}
        tournFieldDisabled
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
        qualFieldDisabled
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

  if (!notificationId) {
    return null;
  }

  return (
    <>
      <CustomTitle displayBack>通知更新</CustomTitle>

      <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-12'>
        <div>
          <InputLabel label='To' required />
          <RadioGroup
            {...(register('to', { required: true }), { value: to })}
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
                disabled
              />
            ))}
          </RadioGroup>
        </div>

        <div className='flex flex-col gap-2'>
          <InputLabel label='件名' required />
          <CustomTextField
            className='w-full max-w-md'
            {...register('title', { required: true })}
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
