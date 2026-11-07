import { useEffect, useRef, type DependencyList } from 'react';
import gsap from 'gsap';

export function useGsapContext(
  animationCallback: (context: gsap.Context) => void,
  scopeRef?: React.RefObject<HTMLElement | null>,
  deps: DependencyList = []
) {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    const ctx = gsap.context((self) => {
      if (isMountedRef.current) {
        animationCallback(self);
      }
    }, scopeRef?.current || undefined);

    return () => {
      isMountedRef.current = false;
      ctx.revert();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
