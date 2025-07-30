import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UIState, ButtonState } from "@/types/store";

// 默认按钮状态
const defaultButtonState: ButtonState = {
  isLoading: false,
  isDisabled: false,
  error: null,
};

// 初始状态
const initialState = {
  buttons: {},
  modals: {
    isLoginModalOpen: false,
    isCreateCourseModalOpen: false,
    isDeleteConfirmModalOpen: false,
  },
  loading: {
    isPageLoading: false,
    isDataLoading: false,
  },
  errors: {
    global: null,
    form: {},
  },
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 按钮状态管理
      setButtonState: (buttonId: string, state: Partial<ButtonState>) => {
        set((prev) => ({
          buttons: {
            ...prev.buttons,
            [buttonId]: {
              ...defaultButtonState,
              ...prev.buttons[buttonId],
              ...state,
            },
          },
        }));
      },

      resetButtonState: (buttonId: string) => {
        set((prev) => ({
          buttons: {
            ...prev.buttons,
            [buttonId]: defaultButtonState,
          },
        }));
      },

      setButtonLoading: (buttonId: string, isLoading: boolean) => {
        get().setButtonState(buttonId, { isLoading });
      },

      setButtonDisabled: (buttonId: string, isDisabled: boolean) => {
        get().setButtonState(buttonId, { isDisabled });
      },

      setButtonError: (buttonId: string, error: string | null) => {
        get().setButtonState(buttonId, { error });
      },

      // 模态框操作
      openModal: (modalName) => {
        set((prev) => ({
          modals: {
            ...prev.modals,
            [modalName]: true,
          },
        }));
      },

      closeModal: (modalName) => {
        set((prev) => ({
          modals: {
            ...prev.modals,
            [modalName]: false,
          },
        }));
      },

      closeAllModals: () => {
        set((prev) => ({
          modals: {
            ...Object.keys(prev.modals).reduce(
              (acc, key) => {
                acc[key as keyof typeof prev.modals] = false;
                return acc;
              },
              {} as typeof prev.modals,
            ),
          },
        }));
      },

      // 加载状态操作
      setPageLoading: (isLoading: boolean) => {
        set((prev) => ({
          loading: {
            ...prev.loading,
            isPageLoading: isLoading,
          },
        }));
      },

      setDataLoading: (isLoading: boolean) => {
        set((prev) => ({
          loading: {
            ...prev.loading,
            isDataLoading: isLoading,
          },
        }));
      },

      // 错误处理
      setGlobalError: (error: string | null) => {
        set((prev) => ({
          errors: {
            ...prev.errors,
            global: error,
          },
        }));
      },

      setFormError: (field: string, error: string) => {
        set((prev) => ({
          errors: {
            ...prev.errors,
            form: {
              ...prev.errors.form,
              [field]: error,
            },
          },
        }));
      },

      clearFormErrors: () => {
        set((prev) => ({
          errors: {
            ...prev.errors,
            form: {},
          },
        }));
      },

      clearAllErrors: () => {
        set((prev) => ({
          errors: {
            global: null,
            form: {},
          },
        }));
      },

      // 重置所有状态
      resetUIState: () => {
        set(initialState);
      },
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        buttons: state.buttons,
        modals: state.modals,
      }),
    },
  ),
);

// 按钮状态选择器
export const useButtonState = (buttonId: string) => {
  const buttonState =
    useUIStore((state) => state.buttons[buttonId]) ?? defaultButtonState;
  const setButtonState = useUIStore((state) => state.setButtonState);
  const resetButtonState = useUIStore((state) => state.resetButtonState);
  const setButtonLoading = useUIStore((state) => state.setButtonLoading);
  const setButtonDisabled = useUIStore((state) => state.setButtonDisabled);
  const setButtonError = useUIStore((state) => state.setButtonError);

  return {
    ...buttonState,
    setButtonState: (state: Partial<ButtonState>) =>
      setButtonState(buttonId, state),
    resetButtonState: () => resetButtonState(buttonId),
    setLoading: (isLoading: boolean) => setButtonLoading(buttonId, isLoading),
    setDisabled: (isDisabled: boolean) =>
      setButtonDisabled(buttonId, isDisabled),
    setError: (error: string | null) => setButtonError(buttonId, error),
  };
};

// 模态框状态选择器
export const useModalState = (modalName: keyof UIState["modals"]) => {
  const isOpen = useUIStore((state) => state.modals[modalName]);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);

  return {
    isOpen,
    open: () => openModal(modalName),
    close: () => closeModal(modalName),
  };
};

// 加载状态选择器
export const useLoadingState = () => {
  const loading = useUIStore((state) => state.loading);
  const setPageLoading = useUIStore((state) => state.setPageLoading);
  const setDataLoading = useUIStore((state) => state.setDataLoading);

  return {
    ...loading,
    setPageLoading,
    setDataLoading,
  };
};

// 错误状态选择器
export const useErrorState = () => {
  const errors = useUIStore((state) => state.errors);
  const setGlobalError = useUIStore((state) => state.setGlobalError);
  const setFormError = useUIStore((state) => state.setFormError);
  const clearFormErrors = useUIStore((state) => state.clearFormErrors);
  const clearAllErrors = useUIStore((state) => state.clearAllErrors);

  return {
    ...errors,
    setGlobalError,
    setFormError,
    clearFormErrors,
    clearAllErrors,
  };
};
