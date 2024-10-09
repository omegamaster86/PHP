export default function ErrorBox({ errorText }: { errorText: string[] }) {
  return (
    <>
      {errorText?.length > 0 && (
        <div className='p-2 bg-systemErrorBg border-systemErrorText border-solid border-[1px] text-center'>
          {errorText?.map((message) => {
            return (
              <p key={message} className='text-systemErrorText text-small'>
                {message}
              </p>
            );
          })}
        </div>
      )}
    </>
  );
}
