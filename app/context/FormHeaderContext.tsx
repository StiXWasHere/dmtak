'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useMemo } from 'react';

type FormHeaderContextType = {
  showSave: boolean;
  showGenerate: boolean;
  onSave?: () => void;
  onGeneratePdf?: () => void;
  setHeader?: (newState: Partial<FormHeaderContextType>) => void;
};

const FormHeaderContext = createContext<FormHeaderContextType>({
  showSave: false,
  showGenerate: false,
});

export const useFormHeader = () => useContext(FormHeaderContext);

export const FormHeaderProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<FormHeaderContextType>({
    showSave: false,
    showGenerate: false,
  });

  const setHeader = useCallback((newState: Partial<FormHeaderContextType>) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  const value = useMemo(() => ({ ...state, setHeader }), [state, setHeader]);

  return (
    <FormHeaderContext.Provider value={value}>
      {children}
    </FormHeaderContext.Provider>
  );
};
