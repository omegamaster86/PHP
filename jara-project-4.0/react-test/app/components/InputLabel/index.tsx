import { HelpOutlineSharp } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#fff',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 300,
    border: '1px solid #dadde9',
    padding: '12px 16px',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: '#fff',
  },
  [`& .${tooltipClasses.tooltip} .${tooltipClasses.arrow}`]: {
    '&::before': {
      border: '1px solid #dadde9',
    },
  },
}));
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
      <div className='text-small font-bold text-primaryText'>{label}</div>
      {required && <p className='text-caption2 text-systemErrorText'>必須</p>}
      {displayHelp && (
        <HtmlTooltip
          arrow
          title={
            <div>
              <Typography
                className='text-[16px] font-bold text-primaryText mb-[10px]'
                color='inherit'
              >
                {toolTipTitle}
              </Typography>
              <p className='text-caption2 text-secondaryText text-[12px]'>{toolTipText}</p>
            </div>
          }
          placement='top'
        >
          <HelpOutlineSharp className='text-secondaryText text-[16px]' />
        </HtmlTooltip>
      )}
    </div>
  );
}
