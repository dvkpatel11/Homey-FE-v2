// src/lib/hooks/form/useMultiStepForm.ts
import { useCallback, useEffect, useState } from "react";
import { useMultiStepData } from "../useLocalStorage";
import type { FormStep, FormValues, UseMultiStepFormOptions, UseMultiStepFormReturn } from "./types";

export function useMultiStepForm(
  steps: FormStep[] = [],
  options: UseMultiStepFormOptions = {}
): UseMultiStepFormReturn {
  const { persistKey, onStepChange } = options;

  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Use centralized multi-step storage
  const storageKey = persistKey ? `multistep_${persistKey}` : null;
  const { stepData, updateStep, clearAllSteps, getStep } = useMultiStepData(storageKey);

  // Load persisted state on mount
  useEffect(() => {
    if (!persistKey || !stepData) return;

    const savedStep = stepData.__currentStep ?? 0;
    const savedCompleted = stepData.__completedSteps ?? [];

    // Validate saved step is within bounds
    if (savedStep >= 0 && savedStep < steps.length) {
      setCurrentStep(savedStep);
    }

    // Validate completed steps
    const validCompletedSteps = Array.isArray(savedCompleted)
      ? savedCompleted.filter((step: number) => step >= 0 && step < steps.length)
      : [];

    setCompletedSteps(new Set(validCompletedSteps));
  }, [persistKey, stepData, steps.length]);

  // Save current step and completed steps whenever they change
  useEffect(() => {
    if (!persistKey) return;

    updateStep("__currentStep", currentStep);
    updateStep("__completedSteps", Array.from(completedSteps));
  }, [currentStep, completedSteps, persistKey, updateStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < steps.length) {
        setCurrentStep(step);
        onStepChange?.(step, steps[step]);
      } else {
        console.warn(`useMultiStepForm: Invalid step index ${step}. Must be between 0 and ${steps.length - 1}`);
      }
    },
    [steps, onStepChange]
  );

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      goToStep(currentStep + 1);
    }
  }, [currentStep, steps.length, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  const completeStep = useCallback(
    (step: number = currentStep) => {
      if (step >= 0 && step < steps.length) {
        setCompletedSteps((prev) => new Set([...prev, step]));
      }
    },
    [currentStep, steps.length]
  );

  const setStepFormData = useCallback(
    (step: number, data: FormValues) => {
      if (step >= 0 && step < steps.length) {
        updateStep(step, data);
      } else {
        console.warn(`useMultiStepForm: Invalid step index ${step} for setStepFormData`);
      }
    },
    [updateStep, steps.length]
  );

  const getStepFormData = useCallback(
    (step: number): FormValues => {
      if (step >= 0 && step < steps.length) {
        return getStep(step) || {};
      }
      console.warn(`useMultiStepForm: Invalid step index ${step} for getStepFormData`);
      return {};
    },
    [getStep, steps.length]
  );

  const getAllFormData = useCallback((): FormValues => {
    const allData = { ...stepData };
    delete allData.__currentStep;
    delete allData.__completedSteps;
    return allData;
  }, [stepData]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
    clearAllSteps();
  }, [clearAllSteps]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const isStepCompleted = useCallback(
    (step: number): boolean => {
      return completedSteps.has(step);
    },
    [completedSteps]
  );

  const canGoToStep = useCallback(
    (step: number): boolean => {
      // Can always go to current step or earlier
      if (step <= currentStep) return true;

      // Can go to next step if previous step is completed
      if (step === currentStep + 1) return true;

      // Can go to any step if it's already completed
      return completedSteps.has(step);
    },
    [currentStep, completedSteps]
  );

  // Calculate progress metrics
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;
  const completionRate = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0;

  return {
    // Current state
    currentStep,
    currentStepData: steps[currentStep] || null,
    completedSteps: Array.from(completedSteps),
    steps,

    // Navigation
    isFirstStep,
    isLastStep,
    goToStep,
    nextStep,
    prevStep,
    reset,

    // Step management
    completeStep,
    isStepCompleted,
    canGoToStep,

    // Data management
    setStepFormData,
    getStepFormData,
    getAllFormData,

    // Progress
    progress,
    completionRate,
  };
}
