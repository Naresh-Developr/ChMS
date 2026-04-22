import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const MIN_ONBOARDING_INDEX = 1;
const MAX_ONBOARDING_INDEX = 4;
const initialState: number = MIN_ONBOARDING_INDEX;

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,

  reducers: {
    incrementOnboardingStepperIndex: (state) => {
      return Math.min(state + 1, MAX_ONBOARDING_INDEX);
    },
    decrementOnboardingStepperIndex: (state) => {
      return Math.max(state - 1, MIN_ONBOARDING_INDEX);
    },
    setOnboardingStepperIndex: (state, action: PayloadAction<number>) => {
      return Math.max(MIN_ONBOARDING_INDEX, Math.min(action.payload, MAX_ONBOARDING_INDEX));
    },
  },
});

export const { incrementOnboardingStepperIndex, decrementOnboardingStepperIndex, setOnboardingStepperIndex } =
  onboardingSlice.actions;
export default onboardingSlice.reducer;
