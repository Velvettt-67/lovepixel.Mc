import React, { useState } from 'react';
import { SupportContext } from './SupportContextBase';
import { SupportModal } from '../components/support/SupportModal';

export const SupportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SupportContext.Provider
      value={{
        openSupport: () => setIsOpen(true),
        closeSupport: () => setIsOpen(false),
      }}
    >
      {children}
      <SupportModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </SupportContext.Provider>
  );
};
