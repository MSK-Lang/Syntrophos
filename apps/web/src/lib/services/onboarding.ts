export type OnboardingState = {
  isFirstTimeUser: boolean;
  dismissedPrompt: boolean;
  completedSteps: string[];
};

const STORAGE_KEY = 'syntrophos_onboarding_state';

const DEFAULT_STATE: OnboardingState = {
  isFirstTimeUser: false,
  dismissedPrompt: false,
  completedSteps: ['step-1', 'step-2'],
};

export function getOnboardingState(): OnboardingState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveOnboardingState(state: Partial<OnboardingState>): OnboardingState {
  const current = getOnboardingState();
  const next = { ...current, ...state };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function setFirstTimeUser(isFirstTime: boolean): void {
  saveOnboardingState({
    isFirstTimeUser: isFirstTime,
    dismissedPrompt: !isFirstTime,
  });
}

export function dismissWelcomePrompt(): void {
  saveOnboardingState({
    dismissedPrompt: true,
  });
}

export function toggleStepCompleted(stepId: string): OnboardingState {
  const current = getOnboardingState();
  const exists = current.completedSteps.includes(stepId);
  const nextSteps = exists
    ? current.completedSteps.filter((id) => id !== stepId)
    : [...current.completedSteps, stepId];
  return saveOnboardingState({ completedSteps: nextSteps });
}

export function getOnboardingProgress(): { completed: number; total: number; percentage: number } {
  const state = getOnboardingState();
  const total = 6;
  const completed = state.completedSteps.length;
  const percentage = Math.round((completed / total) * 100);
  return { completed, total, percentage };
}
