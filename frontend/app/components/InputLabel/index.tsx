import { HelpOutlineSharp } from '@mui/icons-material';
import ToolTip from '../ToolTip';

export default function InputLabel({
  label,
  required,
  displayHelp,
  toolTipTitle,
  toolTipText,
}: {
  label: string;
  required?: boolean;
  displayHelp?: boolean;
  toolTipTitle?: string;
  toolTipText?: string;
}) {
  return (
    <div className='flex justify-start items-center gap-[10px]'>
      <div className='text-small text-primaryText font-bold'>{label}</div>
      {required && <p className='text-caption2 text-systemErrorText'>必須</p>}
      {displayHelp && (
        <ToolTip toolTipTitle={toolTipTitle} toolTipText={toolTipText}>
          <HelpOutlineSharp className='text-secondaryText text-[16px]' />
        </ToolTip>
      )}
    </div>
  );
}