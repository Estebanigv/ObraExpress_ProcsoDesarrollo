"use client";

import React, { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  endValue: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  endValue,
  duration = 2000,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0
}) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateValue();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const animateValue = () => {
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const value = startValue + (endValue - startValue) * easeOutCubic;

      setCurrentValue(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentValue(endValue);
      }
    };

    requestAnimationFrame(animate);
  };

  const formatValue = (value: number) => {
    if (decimals > 0) {
      return value.toFixed(decimals);
    }
    return Math.floor(value).toString();
  };

  return (
    <div ref={elementRef} className={className}>
      {prefix}{formatValue(currentValue)}{suffix}
    </div>
  );
};

export default AnimatedCounter;