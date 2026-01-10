'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Step {
  id: string
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (stepIndex: number) => void
  allowClickNavigation?: boolean
}

export function Stepper({
  steps,
  currentStep,
  onStepClick,
  allowClickNavigation = false,
}: StepperProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = allowClickNavigation && index < currentStep

          return (
            <li key={step.id} className="flex-1">
              <div className="flex flex-col items-center">
                {/* Step circle */}
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                    isCompleted && 'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary bg-background text-primary',
                    !isCompleted && !isCurrent && 'border-muted-foreground/30 bg-background text-muted-foreground',
                    isClickable && 'cursor-pointer hover:bg-primary/10'
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>

                {/* Step title */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      (isCompleted || isCurrent) && 'text-primary',
                      !isCompleted && !isCurrent && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden sm:block absolute top-5 left-[calc(50%+20px)] right-[calc(50%-20px)] h-0.5">
                  <div
                    className={cn(
                      'h-full',
                      isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
                    )}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {/* Mobile connector - simplified progress bar */}
      <div className="mt-4 h-2 w-full rounded-full bg-muted sm:hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>
    </nav>
  )
}
