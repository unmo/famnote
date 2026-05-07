import { useEffect, useRef, useState } from 'react';
import { animate } from 'motion/react';

/**
 * 数値のカウントアップアニメーションhook。
 * target が変化した際にfromからtargetへ数値をアニメートする。
 */
export function useCountUp(target: number, duration = 1.2): number {
  const [displayValue, setDisplayValue] = useState(target);
  const prevTarget = useRef(target);

  useEffect(() => {
    const from = prevTarget.current;
    prevTarget.current = target;
    if (from === target) return;

    const controls = animate(from, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (value: number) => setDisplayValue(Math.round(value)),
    });

    return () => controls.stop();
  }, [target, duration]);

  return displayValue;
}
