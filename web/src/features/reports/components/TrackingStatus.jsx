import { memo } from 'react';
import { TRACKING_STEPS, getStepIndex } from '../constants/reportStatus';

const TrackingStatus = memo(({ status }) => {
const currentStepIndex = getStepIndex(status);

  return (
    <section
      className="bg-white/[0.02] rounded-2xl p-6 lg:p-8 border border-white/[0.08] w-full"
      aria-label="Report tracking status"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 rounded-full bg-blue-500" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-white">Tracking Status</h3>
      </div>

      <ol className="w-full flex items-center" role="list">
        {TRACKING_STEPS.map((step, index) => {
          const Icon       = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent  = index === currentStepIndex;
          const isLast     = index === TRACKING_STEPS.length - 1;
          const circleStyle = {
            backgroundColor: index <= currentStepIndex
              ? `${step.color}20`
              : 'rgba(255,255,255,0.06)',
            borderColor: index <= currentStepIndex
              ? step.color
              : 'rgba(255,255,255,0.15)',
            color: index <= currentStepIndex
              ? step.color
              : 'rgba(255,255,255,0.4)',
            boxShadow: isCurrent
              ? `0 0 24px ${step.color}, 0 0 48px ${step.color}66`
              : isCompleted
                ? `0 0 12px ${step.color}44`
                : '0 0 8px rgba(255,255,255,0.08)',
          };
          const labelStyle = {
            color: isCurrent
              ? step.color
              : isCompleted
                ? 'rgba(255,255,255,0.85)'
                : 'rgba(255,255,255,0.45)',
            textShadow: isCurrent ? `0 0 10px ${step.color}` : undefined,
          };
          const connectorStyle = {
            backgroundColor: isCompleted
              ? step.color
              : 'rgba(255,255,255,0.12)',
            boxShadow: isCompleted
              ? `0 0 8px ${step.color}60`
              : undefined,
          };

          return (
            <li key={step.key} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                  style={circleStyle}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <Icon size={22} strokeWidth={2.5} aria-hidden="true" />
                </div>
                <span
                  className="mt-3 text-sm font-medium text-center truncate w-full max-w-[100px] block"
                  style={labelStyle}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className="flex-1 h-1 min-w-[24px] mx-1 -mt-8 rounded-full transition-all duration-300"
                  style={connectorStyle}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
});

TrackingStatus.displayName = 'TrackingStatus';

export default TrackingStatus;