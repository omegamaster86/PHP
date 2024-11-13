import { CloseOutlined } from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Fragment, ReactNode, useState } from 'react';
import CustomButton, { CustomButtonProps } from '../CustomButton';

export default function CustomDialog({
  title,
  buttonLabel,
  children,
  displayCancel,
  handleConfirm,
  confirmButtonLabel,
  confirmButtonType,
  handleCancel,
  buttonType = 'primary',
  withDividers = true,
  withCloseIcon = false,
  ...customButtonProps
}: {
  title: string;
  buttonLabel: string;
  children: ReactNode;
  displayCancel?: boolean;
  handleConfirm: () => boolean;
  confirmButtonLabel?: string;
  confirmButtonType?: HTMLButtonElement['type'];
  handleCancel?: () => void;
  withDividers?: boolean;
  withCloseIcon?: boolean;
} & Omit<CustomButtonProps, 'children'>) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Fragment>
      <CustomButton {...customButtonProps} buttonType={buttonType} onClick={handleClickOpen}>
        {buttonLabel}
      </CustomButton>
      <Dialog
        fullWidth={true}
        maxWidth={'lg'}
        open={open}
        onClose={handleClose}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
      >
        <div className='flex justify-between'>
          <DialogTitle id='alert-dialog-title' className='!font-bold'>
            {title}
          </DialogTitle>
          {withCloseIcon && (
            <button onClick={handleClose} className='flex justify-center items-center px-6'>
              <CloseOutlined />
            </button>
          )}
        </div>
        <DialogContent dividers={withDividers}>{children}</DialogContent>
        <DialogActions className='mt-4 !px-6 flex flex-col sm:flex-row gap-4'>
          {displayCancel && (
            <CustomButton
              onClick={() => {
                if (window.confirm('編集中の内容は破棄されます。キャンセルしてよろしいですか？')) {
                  if (handleCancel) {
                    handleCancel();
                  }
                  handleClose();
                }
              }}
              className='!w-28'
            >
              キャンセル
            </CustomButton>
          )}
          <CustomButton
            className='!m-0 !w-28'
            buttonType='primary'
            type={confirmButtonType}
            onClick={() => {
              if (handleConfirm()) {
                handleClose();
              }
            }}
          >
            {confirmButtonLabel || '確認'}
          </CustomButton>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
