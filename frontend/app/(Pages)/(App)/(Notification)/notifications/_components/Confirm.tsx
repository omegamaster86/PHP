import { CustomButton, CustomTitle, ErrorBox } from '@/app/components';
import LinkifyText from '@/app/components/LinkifyText';
import { getNotificationDestination, getNotificationToTypeLabel } from '@/app/constants';
import { fetcher } from '@/app/lib/swr';
import {
  CreateNotificationRequest,
  NotificationCreateFormInput,
  NotificationUpdateFormInput,
  SelectOption,
  UpdateNotificationRequest,
} from '@/app/types';
import { getSessionStorage, removeSessionStorage } from '@/app/utils/sessionStorage';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWRMutation from 'swr/mutation';

const sendCreateRequest = async (
  url: string,
  trigger: { arg: { reqFormData: CreateNotificationRequest } },
) => {
  return await fetcher({
    url,
    method: 'POST',
    data: trigger.arg.reqFormData,
  });
};

const sendUpdateRequest = async (
  url: string,
  trigger: { arg: { reqFormData: UpdateNotificationRequest } },
) => {
  return await fetcher({
    url,
    method: 'PATCH',
    data: trigger.arg.reqFormData,
  });
};

type Props = {
  tournaments: SelectOption[];
  coachQualifications: SelectOption<number>[];
  refereeQualifications: SelectOption<number>[];
};

type FormDataInput =
  | (NotificationCreateFormInput & {
      type: 'create';
    })
  | (NotificationUpdateFormInput & {
      type: 'update';
      notificationId: number;
    });

export const Confirm: React.FC<Props> = (props) => {
  const { tournaments, coachQualifications, refereeQualifications } = props;

  const router = useRouter();

  const createMutation = useSWRMutation('api/insertNotification', sendCreateRequest);
  const updateMutation = useSWRMutation('api/updateNotification', sendUpdateRequest);

  const searchParams = useSearchParams();
  const notificationId = Number(searchParams.get('notificationId'));
  const storageKey = searchParams.get('storageKey');
  const type = searchParams.get('type') as 'create' | 'update';

  if (!storageKey || !type || (type === 'update' && !notificationId)) {
    return null;
  }

  const draftFormData = getSessionStorage<
    NotificationCreateFormInput | NotificationUpdateFormInput
  >(storageKey);
  if (!draftFormData) {
    return null;
  }

  const formData: FormDataInput =
    type === 'create'
      ? {
          ...draftFormData,
          type,
        }
      : {
          ...draftFormData,
          type,
          notificationId,
        };

  const tourn = tournaments.find((t) => t.key === formData.tournId);
  const validCoachQuals = coachQualifications.filter(
    (x) => formData.qualIds?.includes(`coach_${x.key}`),
  );
  const validRefereeQuals = refereeQualifications.filter(
    (x) => formData.qualIds?.includes(`referee_${x.key}`),
  );

  const quals = [...validCoachQuals, ...validRefereeQuals];

  const info = [
    {
      label: 'To',
      value: getNotificationToTypeLabel(formData.to),
    },
    {
      label: '件名',
      value: formData.title,
    },
    {
      label: '大会名',
      value: tourn?.value,
    },
    {
      label: '資格名',
      value: quals.map((x) => x.value).join(','),
    },
    {
      label: '本文',
      value: (
        <p className='whitespace-pre-wrap'>
          <LinkifyText>{formData.body}</LinkifyText>
        </p>
      ),
    },
  ].filter((x) => !!x.value);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.type === 'create') {
      const reqData: CreateNotificationRequest = {
        notificationData: {
          notificationDestinationTypeId: getNotificationDestination(formData.to),
          tournId: formData.tournId ?? null,
          title: formData.title,
          body: formData.body,
        },
        coachQualificationsData: validCoachQuals.map((x) => ({
          coachQualificationId: x.key,
        })),
        refereeQualificationsData: validRefereeQuals.map((x) => ({
          refereeQualificationId: x.key,
        })),
      };

      await createMutation.trigger({ reqFormData: reqData });
    }

    if (formData.type === 'update') {
      const reqData: UpdateNotificationRequest = {
        notificationId: formData.notificationId,
        tournId: formData.tournId,
        title: formData.title,
        body: formData.body,
        coachQualificationsData: validCoachQuals.map((x) => ({
          coachQualificationId: x.key,
        })),
        refereeQualificationsData: validRefereeQuals.map((x) => ({
          refereeQualificationId: x.key,
        })),
      };

      await updateMutation.trigger({ reqFormData: reqData });
    }

    const hasError = !!createMutation.error || !!updateMutation.error;

    if (hasError) {
      return;
    }

    removeSessionStorage(storageKey);
    alert('送信が完了しました。');
    router.replace('/notifications/sent');
  };

  const apiErrorMessages = [
    createMutation.error ? '通知登録に失敗しました。' : '',
    updateMutation.error ? '通知更新に失敗しました。' : '',
  ].filter((x) => !!x);

  const buttonLabel = formData.type === 'create' ? '登録' : '更新';

  const handleGoBack = () => {
    if (type === 'create') {
      router.back();
    }
    if (type === 'update') {
      router.push(`/notification?mode=update&id=${notificationId}&source=confirm`);
    }
  };

  return (
    <>
      <ErrorBox errorText={apiErrorMessages} />

      <CustomTitle customBack={handleGoBack}>通知入力確認</CustomTitle>

      <form onSubmit={handleSubmit} className='flex flex-col gap-12'>
        {info.map((x) => (
          <div key={x.label} className='flex flex-col gap-2'>
            <span className='w-32'>{x.label}</span>
            <span className='text-gray-400'>{x.value}</span>
          </div>
        ))}

        <div className='m-auto flex gap-3'>
          <CustomButton type='button' buttonType='secondary' onClick={() => router.back()}>
            戻る
          </CustomButton>
          <CustomButton type='submit' buttonType='primary' className='w-full'>
            {buttonLabel}
          </CustomButton>
        </div>
      </form>
    </>
  );
};
