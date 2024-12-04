import { createSlice } from '@reduxjs/toolkit';

export const accessToken = createSlice({
  name: 'accesstoken',
  initialState: {
    value: null,
  },
  reducers: {
    setAccessToken: (state, action) => {
      state.value = action.payload
    },
  },
})

export const { setAccessToken } = accessToken.actions;
export default accessToken.reducer;