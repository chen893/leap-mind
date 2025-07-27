import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 按钮状态类型定义
interface ButtonState {
  isLoading: boolean;
  isDisabled: boolean;
  error: string | null;
}

// UI状态接口
interface UIState {
  // 按钮状态管理
  buttons: Record<string, ButtonState>;
  
  // 模态框状态
  modals: {
    isLoginModalOpen: boolean;
    isCreateCourseModalOpen: boolean;
    isDeleteConfirmModalOpen: boolean;
  };
  
  // 加载状态
  loading: {
    isPageLoading: boolean;
    isDataLoading: boolean;
  };
  
  // 错误状态
  errors: {
    global: string | null;
    form: Record<string, string>;
  };
  
  // 操作方法
  setButtonState: (buttonId: string, state: Partial<ButtonState>) => void;
  resetButtonState: (buttonId: string) => void;
  setButtonLoading: (buttonId: string, isLoading: boolean) => void;
  setButtonDisabled: (buttonId: string, isDisabled: boolean) => void;
  setButtonError: (buttonId: string, error: string | null) => void;
  
  // 模态框操作
  openModal: (modalName: keyof UIState['modals']) => void;
  closeModal: (modalName: keyof UIState['modals']) => void;
  closeAllModals: () => void;
  
  // 加载状态操作
  setPageLoading: (isLoading: boolean) => void;
  setDataLoading: (isLoading: boolean) => void;
  
  // 错误处理
  setGlobalError: (error: string | null) => void;
  setFormError: (field: string, error: string) => void;
  clearFormErrors: () => void;
  clearAllErrors: () => void;
  
  // 重置所有状态
  resetUIState: () => void;
}

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
        set((_prev) => ({
          buttons: {
            ..._prev.buttons,
            [buttonId]: {
              ...defaultButtonState,
              ..._prev.buttons[buttonId],
              ...state,
            },
          },
        }));
      },
      
      resetButtonState: (buttonId: string) => {
        set((_prev) => ({
          buttons: {
            ..._prev.buttons,
            [buttonId]: { ...defaultButtonState },
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
        set((_prev) => ({
          modals: {
            ..._prev.modals,
            [modalName]: true,
          },
        }));
      },
      
      closeModal: (modalName) => {
        set((_prev) => ({
          modals: {
            ..._prev.modals,
            [modalName]: false,
          },
        }));
      },
      
      closeAllModals: () => {
        set((_prev) => ({
          modals: Object.keys(_prev.modals).reduce(
            (acc, key) => ({ ...acc, [key]: false }),
            {} as UIState['modals']
          ),
        }));
      },
      
      // 加载状态操作
      setPageLoading: (isLoading: boolean) => {
        set((_prev) => ({
          loading: {
            ..._prev.loading,
            isPageLoading: isLoading,
          },
        }));
      },
      
      setDataLoading: (isLoading: boolean) => {
        set((_prev) => ({
          loading: {
            ..._prev.loading,
            isDataLoading: isLoading,
          },
        }));
      },
      
      // 错误处理
      setGlobalError: (error: string | null) => {
        set((_prev) => ({
          errors: {
            ..._prev.errors,
            global: error,
          },
        }));
      },
      
      setFormError: (field: string, error: string) => {
        set((_prev) => ({
          errors: {
            ..._prev.errors,
            form: {
              ..._prev.errors.form,
              [field]: error,
            },
          },
        }));
      },
      
      clearFormErrors: () => {
        set((_prev) => ({
          errors: {
            ..._prev.errors,
            form: {},
          },
        }));
      },
      
      clearAllErrors: () => {
        set((_prev) => ({
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
      name: 'ui-storage',
      partialize: (state) => ({
        // 只持久化模态框状态，其他状态在页面刷新时重置
        modals: state.modals,
      }),
    }
  )
);

// 便捷的hooks
export const useButtonState = (buttonId: string) => {
  const buttonState = useUIStore((state) => state.buttons[buttonId] ?? defaultButtonState);
  const setButtonState = useUIStore((state) => state.setButtonState);
  const resetButtonState = useUIStore((state) => state.resetButtonState);
  const setButtonLoading = useUIStore((state) => state.setButtonLoading);
  const setButtonDisabled = useUIStore((state) => state.setButtonDisabled);
  const setButtonError = useUIStore((state) => state.setButtonError);
  
  return {
    ...buttonState,
    setButtonState: (state: Partial<ButtonState>) => setButtonState(buttonId, state),
    resetButtonState: () => resetButtonState(buttonId),
    setLoading: (isLoading: boolean) => setButtonLoading(buttonId, isLoading),
    setDisabled: (isDisabled: boolean) => setButtonDisabled(buttonId, isDisabled),
    setError: (error: string | null) => setButtonError(buttonId, error),
  };
};

// 模态框hooks
export const useModalState = (modalName: keyof UIState['modals']) => {
  const isOpen = useUIStore((state) => state.modals[modalName]);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);
  
  return {
    isOpen,
    open: () => openModal(modalName),
    close: () => closeModal(modalName),
  };
};

// 加载状态hooks
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

// 错误状态hooks
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