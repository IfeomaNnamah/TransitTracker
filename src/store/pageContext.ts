import { createSlice } from '@reduxjs/toolkit';

export const pageContext = createSlice({
  name: 'pageContext',
  initialState: {
    value: null,
  },
  reducers: {
    setPageContext: (state, action) => {
      state.value = action.payload
    },
  },
})

export const { setPageContext } = pageContext.actions;
export default pageContext.reducer;