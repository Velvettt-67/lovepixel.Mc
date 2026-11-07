import { createContext } from 'react';

export interface SupportContextType {
  openSupport: () => void;
  closeSupport: () => void;
}

export const SupportContext = createContext<SupportContextType>({
  openSupport: () => {},
  closeSupport: () => {},
});
