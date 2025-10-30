import { useContext } from 'react';
import { BACContext } from '@/contexts/BACContext';

export function useBAC() {
  const context = useContext(BACContext);
  if (!context) {
    throw new Error('useBAC must be used within BACProvider');
  }
  return context;
}