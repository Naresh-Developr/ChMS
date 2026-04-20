import { createSlice } from "@reduxjs/toolkit";

const initialState: number = 1;

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,

  reducers: {
    incrementOnboardingStepperIndex: (state) => {
      return state + 1;
    },
    decrementOnboardingStepperIndex: (state) => {
      return Math.max(state - 1, 1);
    },
  },
});

export const { incrementOnboardingStepperIndex, decrementOnboardingStepperIndex } = onboardingSlice.actions;
export default onboardingSlice.reducer;
