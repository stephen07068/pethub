import React from 'react';
import { MdCheck } from 'react-icons/md';
export default function ProgressStepper({ currentStep }) {
  const steps = ['Cart', 'Checkout', 'Success'];
  
  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <div className="flex items-center justify-center mb-12 max-w-xl mx-auto w-full px-4">
      {steps.map((step, index) => {
        const status = getStepStatus(index);
        
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center relative">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-label-sm font-bold z-10 transition-colors ${
                status === 'completed' ? 'bg-primary text-white' :
                status === 'current' ? 'bg-primary text-white' :
                'bg-surface-container-high text-secondary'
              }`}>
                {status === 'completed' ? (
                  <MdCheck size={16} />
                ) : (
                  index + 1
                )}
              </div>
              <span className={`absolute top-10 whitespace-nowrap text-label-sm font-semibold ${
                status === 'upcoming' ? 'text-secondary' : 'text-primary'
              }`}>
                {step}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 mx-2 sm:mx-4 h-[2px] mt-4 relative top-[-16px]">
                <div className={`h-full transition-all ${
                  status === 'completed' ? 'bg-primary' : 'bg-border-light'
                }`}></div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
