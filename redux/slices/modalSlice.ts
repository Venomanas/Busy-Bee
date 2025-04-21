import LoginModal from '@/components/modals/LoginModal';
import SignUpModal from '@/components/modals/SignUpModal';
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    SignUpModalOpen: false,
    LoginModalOpen: false,
}

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openSignUpModal: state => {
      state.SignUpModalOpen = true;
    },
    closeSignUpModal: state => {
      state.SignUpModalOpen = false;
    },
    openLoginModal: state => {
      state.LoginModalOpen = true;
    },
    closeLoginModal: state => {
      state.LoginModalOpen = false;
    },
  },
});

export const { openSignUpModal, closeSignUpModal, openLoginModal, closeLoginModal } =
  modalSlice.actions;

export default modalSlice.reducer