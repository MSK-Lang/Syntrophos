import { useEffect, useState } from 'react';
import { demoStore, type SyntrophosState } from './syntrophosDemoStore.js';

export function useSyntrophosDemoStore(): SyntrophosState {
  const [state, setState] = useState<SyntrophosState>(() => demoStore.getState());

  useEffect(() => {
    const unsubscribe = demoStore.subscribe((nextState) => {
      setState(nextState);
    });
    return unsubscribe;
  }, []);

  return state;
}
