import React from 'react';
import ConfirmCoachingHistory from './ConfirmCoachingHistory';
import ConfirmCoachQualification from './ConfirmCoachQualification';
import ConfirmRefereeQualification from './ConfirmRefereeQualification';

const ConfirmView = () => {
  return (
    <div className='flex flex-col gap-5'>
      <ConfirmCoachingHistory />
      <ConfirmCoachQualification />
      <ConfirmRefereeQualification />
    </div>
  );
};

export default ConfirmView;
