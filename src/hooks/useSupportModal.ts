import { useContext } from 'react';
import { SupportContext } from '../context/SupportContextBase';

export function useSupportModal() {
  return useContext(SupportContext);
}
