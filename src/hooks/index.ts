import { useRef } from 'react';

// 封装节流函数
export const useThrottle = (fn: Function, delay: number) => {
    const lastTime = useRef(Date.now());
    return (...args: any[]) => {
        const now = Date.now();
        if (now - lastTime.current > delay) {
            fn.apply(null, args);
            lastTime.current = now;
        }
    };
};

// 封装防抖函数
export const useDebounce = (fn: Function, delay: number) => {
    const timer = useRef<any>();
    return (...args: any[]) => {
        if (timer.current) {
            clearTimeout(timer.current);
        }
        timer.current = setTimeout(() => {
            fn.apply(null, args);
        }, delay);
    };
};
