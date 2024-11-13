import { CreateFormInput } from '@/app/(Pages)/(App)/(Notification)/notifications/_components/Create';
import { CustomButton, CustomTitle } from '@/app/components';
import { SelectOption } from '@/app/types';
import { useSearchParams } from 'next/navigation';

type Props = {
  tournaments: SelectOption[];
  qualifications: SelectOption[];
};

export const Confirm: React.FC<Props> = (props) => {
  const { tournaments, qualifications } = props;

  const searchParams = useSearchParams();
  const data = searchParams.get('formData');
  const formData = data ? (JSON.parse(data) as CreateFormInput) : null;
  if (!formData) {
    return null;
  }

  const toLabels = {
    userFollower: '自分をフォローしているユーザー',
    tournFollower: '大会をフォローしているユーザー',
    qualifiedUser: '有資格者',
    allUser: '全ユーザー',
  };
  const tourn = tournaments.find((t) => t.key === formData.tournId);
  const quals = qualifications.filter((q) => formData.qualIds?.includes(q.key));

  const info = [
    {
      label: 'To',
      value: toLabels[formData.to],
    },
    {
      label: '件名',
      value: formData.subject,
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
      value: formData.body,
    },
  ].filter((x) => !!x.value);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const reqData = {
      ...formData,
      to: Number(formData.to),
      tournId: formData.tournId || undefined,
      qualIds: !!formData.qualIds.length ? formData.qualIds : undefined,
    };

    console.log({
      reqData,
    });
  };

  return (
    <>
      <CustomTitle displayBack>通知入力確認</CustomTitle>

      <form onSubmit={handleSubmit} className='flex flex-col gap-12'>
        {info.map((x) => (
          <div key={x.label} className='flex flex-col gap-2'>
            <span className='w-32'>{x.label}</span>
            <span className='text-gray-400'>{x.value}</span>
          </div>
        ))}
        <CustomButton type='submit' buttonType='primary' className='w-full max-w-sm mx-auto'>
          更新
        </CustomButton>
      </form>
    </>
  );
};
