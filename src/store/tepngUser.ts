import { createSlice } from '@reduxjs/toolkit';

export const tepngUser = createSlice({
  name: 'tepnguser',
  initialState: {
    value: null,
  },
  reducers: {
    setTepngUser: (state, action) => {
      state.value = action.payload
    },
  },
})

export const { setTepngUser } = tepngUser.actions;
export default tepngUser.reducer;