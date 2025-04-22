import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  signUpModalOpen: false,
  loginModalOpen: false,
  commentModalOpen: false,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openSignUpModal: state => {
      state.signUpModalOpen = true;
    },
    closeSignUpModal: state => {
      state.signUpModalOpen = false;
    },
    openLoginModal: state => {
      state.loginModalOpen = true;
    },
    closeLoginModal: state => {
      state.loginModalOpen = false;
    },
    openCommentModal: state => {
      state.commentModalOpen = true;
    },
    closeCommentModal: state => {
      state.commentModalOpen = false;
    },
  },
});

export const {
  openSignUpModal,
  closeSignUpModal,
  openLoginModal,
  closeLoginModal,
  openCommentModal,
  closeCommentModal,
} = modalSlice.actions;

export default modalSlice.reducer;
