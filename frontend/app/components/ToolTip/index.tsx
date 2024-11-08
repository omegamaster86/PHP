import { styled } from '@mui/material/styles';
import Tooltip, { type TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

type ToolTipProps = {
  toolTipTitle?: string;
  toolTipText?: string;
  children: React.ReactElement;
};

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#fff',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 350,
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

const ToolTip: React.FC<ToolTipProps> = ({ toolTipTitle = '', toolTipText = '', children }) => {
  if (!toolTipTitle && !toolTipText) return null;

  return (
    <div className='flex justify-start items-center gap-[10px]'>
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
            <p
              className='text-secondaryText text-[12px]'
              dangerouslySetInnerHTML={{ __html: toolTipText == undefined ? '' : toolTipText }}
            ></p>
          </div>
        }
        placement='top'
      >
        {children}
      </HtmlTooltip>
    </div>
  );
};

export default ToolTip;
