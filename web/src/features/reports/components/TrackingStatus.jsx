import { memo } from 'react';
import { Building2, Clock, Wrench, CheckCircle2 } from 'lucide-react';
import { TRACKING_STEPS, getStepIndex } from '../constants/reportStatus';

// ── Department status config ──────────────────────────────────────────────────
const DEPT_STEPS = [
  {
    key:   'PENDING',
    label: 'Pending',
    icon:  Clock,
    color: '#f59e0b',
  },
  {
    key:   'IN_PROGRESS',
    label: 'In Progress',
    icon:  Wrench,
    color: '#3b82f6',
  },
  {
    key:   'COMPLETED',
    label: 'Completed',
    icon:  CheckCircle2,
    color: '#22c55e',
  },
];

const getDeptStepIndex = (status) => {
  const idx = DEPT_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
};

// ── Reusable step timeline ────────────────────────────────────────────────────
const StepTimeline = ({ steps, currentIndex }) => (
  <ol className="w-full flex items-center" role="list">
    {steps.map((step, index) => {
      const Icon        = step.icon;
      const isCompleted = index < currentIndex;
      const isCurrent   = index === currentIndex;
      const isLast      = index === steps.length - 1;

      const circleStyle = {
        backgroundColor: index <= currentIndex
          ? `${step.color}20`
          : 'rgba(255,255,255,0.06)',
        borderColor: index <= currentIndex
          ? step.color
          : 'rgba(255,255,255,0.15)',
        color: index <= currentIndex
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
);

// ── Department card ───────────────────────────────────────────────────────────
const DepartmentTrack = ({ name, status, assignedAt, completedAt }) => {
  const currentIndex = getDeptStepIndex(status);
  const accentColor  = DEPT_STEPS[currentIndex]?.color ?? '#3b82f6';

  return (
    <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.07] space-y-4">
      {/* Department header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 size={15} style={{ color: accentColor }} aria-hidden="true" />
          <span className="text-white text-sm font-semibold">{name}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-white/40 text-xs">
            Assigned {new Date(assignedAt).toLocaleDateString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </span>
          {completedAt && (
            <span className="text-white/30 text-xs">
              Completed {new Date(completedAt).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>

      {/* Department step timeline */}
      <StepTimeline steps={DEPT_STEPS} currentIndex={currentIndex} />
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const TrackingStatus = memo(({ status, departments = [] }) => {
  const currentStepIndex = getStepIndex(status);

  return (
    <section
      className="bg-white/[0.02] rounded-2xl p-6 lg:p-8 border border-white/[0.08] w-full space-y-8"
      aria-label="Report tracking status"
    >
      {/* ── Overall report status ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full bg-blue-500" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-white">Tracking Status</h3>
        </div>

        <StepTimeline steps={TRACKING_STEPS} currentIndex={currentStepIndex} />
      </div>

      {/* ── Per-department tracking ── */}
      {departments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 rounded-full bg-violet-500" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-white">
              Department Work
              <span className="ml-2 text-sm font-normal text-white/40">
                ({departments.length} assigned)
              </span>
            </h3>
          </div>

          {departments.map(({ id, department, status: deptStatus, assignedAt, completedAt }) => (
            <DepartmentTrack
              key={id}
              name={department.name}
              status={deptStatus}
              assignedAt={assignedAt}
              completedAt={completedAt}
            />
          ))}
        </div>
      )}
    </section>
  );
});

TrackingStatus.displayName = 'TrackingStatus';

export default TrackingStatus;