export default function ErrorBox({ errorText }: { errorText: string[] }) {
  if (errorText.length === 0) return null;
  return (
    <div className='p-2 bg-systemErrorBg border-systemErrorText border-solid border-[1px] text-center'>
      {errorText.map((message) => {
        return (
          <p key={message} className='text-systemErrorText text-small'>
            {message}
          </p>
        );
      })}
    </div>
  );
}
