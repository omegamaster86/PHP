export default function ErrorBox({ errorText }: { errorText: string[] }) {
  return (
    <div>
      {errorText.length > 0 && (
        <div className='relative w-full my-3 h-[50px] bg-systemErrorBg border-systemErrorText border-solid border-[1px] flex justify-center items-center text-systemErrorText'>
          {errorText.map((message) => {
            return (
              <p key={message} className='text-systemErrorText text-small'>
                {message}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}
