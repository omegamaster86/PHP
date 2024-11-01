'use client';

type Props = {
  searchParams: {
    id: string;
  };
};

export default function NotificationDetail(props: Props) {
  const { id } = props.searchParams;
  console.log({
    props,
    id,
  });

  return (
    <main>
      <div>NotificationDetail</div>
      <p>id: {id}</p>
    </main>
  );
}
