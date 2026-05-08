import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export default function WizardStepper({ steps, currentStep, onStepClick, completedUntil }) {
    return (
        <div className="flex items-center justify-center gap-0 px-6 pb-3">
            {steps.map((step, i) => {
                const isCompleted = step.id < completedUntil
                const isCurrent = step.id === currentStep
                const isClickable = step.id <= completedUntil

                return (
                    <div key={step.id} className="flex items-center">
                        {/* Step circle */}
                        <button
                            onClick={() => isClickable && onStepClick(step.id)}
                            className={cn(
                                'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                                isCurrent &&
                                    'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/20',
                                isCompleted && !isCurrent && 'bg-[#DCFCE7] text-[#22C55E]',
                                !isCurrent && !isCompleted && 'bg-[#F1F5F9] text-[#94A3B8]',
                                !isClickable && 'cursor-not-allowed opacity-60'
                            )}
                        >
                            {isCompleted && !isCurrent ? (
                                <Check className="size-3.5" />
                            ) : (
                                <span className="flex size-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                                    {step.id}
                                </span>
                            )}
                            <span className="hidden sm:inline">{step.label}</span>
                        </button>

                        {/* Connector line */}
                        {i < steps.length - 1 && (
                            <div
                                className={cn(
                                    'mx-1 h-0.5 w-8 rounded-full transition-colors sm:w-12',
                                    step.id < completedUntil ? 'bg-[#22C55E]' : 'bg-[#E2E8F0]'
                                )}
                            />
                        )}
                    </div>
                )
            })}
        </div>
    )
}