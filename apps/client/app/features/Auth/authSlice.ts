import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signInUser, signUpUser } from "../../api/auth.api";
import type { AuthState, SignInRequest, SignUpRequest } from "../../interfaces/auth.interface";
import { setAccessToken } from "~/utils/services/tokenServices";

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

export const signIn = createAsyncThunk("auth/signin", async (data: SignInRequest, thunkAPI) => {
  try {
    const response = await signInUser(data);
    setAccessToken(response.accessToken, response.expiresOn);
    return response;
  } catch (error: any) {
    return thunkAPI.rejectWithValue({
      message: error.response?.data?.title || "SignIn failed!",
      status: error.response?.status,
    });
  }
});

export const signUp = createAsyncThunk("auth/signup", async (data: SignUpRequest, thunkAPI) => {
  try {
    return await signUpUser(data);
  } catch (error: any) {
    return thunkAPI.rejectWithValue({
      message: error.response?.data?.title || "SignUp failed!",
      status: error.response?.status,
    });
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // SignIn reducers (handles what's returned by signIn thunk)
      .addCase(signIn.pending, (state) => {
        state.loading = true;
        state.user = null;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as {
          status: number;
          message: string;
        };
      })

      // SignUp reducers (handles what's returned by signUp thunk)
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.user = null;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as {
          status: number;
          message: string;
        };
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
