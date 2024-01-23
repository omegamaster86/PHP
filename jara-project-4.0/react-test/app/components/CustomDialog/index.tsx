import React from 'react';
import CustomButton from '../CustomButton';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

export default function CustomDialog({
  title,
  buttonLabel,
  className,
  children,
  displayCancel,
  handleConfirm,
  confirmButtonLabel,
  handleCancel,
}: {
  title: string;
  buttonLabel: string;
  className?: string;
  children: React.ReactNode;
  displayCancel?: boolean;
  handleConfirm: () => boolean;
  confirmButtonLabel?: string;
  handleCancel?: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <CustomButton onClick={handleClickOpen} className={className} buttonType='primary'>
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
        <DialogTitle id='alert-dialog-title' className='font-bold'>
          {title}
        </DialogTitle>
        <DialogContent dividers>{children}</DialogContent>
        <DialogActions className='mt-[16px]'>
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
            >
              キャンセル
            </CustomButton>
          )}
          <CustomButton
            onClick={() => {
              if (handleConfirm()) {
                handleClose();
              }
            }}
            buttonType='primary'
          >
            {confirmButtonLabel || '確認'}
          </CustomButton>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
