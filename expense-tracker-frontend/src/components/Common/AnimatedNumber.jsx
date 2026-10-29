import React, { useEffect } from "react";
import { useMotionValue, useSpring, useTransform, useReducedMotion, motion } from "framer-motion";
import { useApp } from "../../contexts/AppContext";

const formatCurrency = (val, prefix, suffix, decimals) => {
  const num = Number(val) || 0;
  const isNegative = num < 0;
  const absVal = Math.abs(num).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${isNegative ? "-" : ""}${prefix}${absVal}${suffix}`;
};

const AnimatedNumber = ({
  value = 0,
  prefix,
  suffix = "",
  decimals = 2,
  className = "",
}) => {
  const appContext = useApp?.();
  const activeCurrency = appContext?.currency || "$";
  const effectivePrefix = prefix !== undefined ? prefix : activeCurrency;

  const prefersReducedMotion = useReducedMotion();
  const motionVal = useMotionValue(Number(value) || 0);
  const springVal = useSpring(motionVal, { stiffness: 100, damping: 18, restDelta: 0.01 });

  const displayVal = useTransform(springVal, (current) =>
    formatCurrency(current, effectivePrefix, suffix, decimals)
  );

  useEffect(() => {
    motionVal.set(Number(value) || 0);
  }, [value, motionVal]);

  if (prefersReducedMotion) {
    return (
      <span className={className}>
        {formatCurrency(value, effectivePrefix, suffix, decimals)}
      </span>
    );
  }

  return <motion.span className={className}>{displayVal}</motion.span>;
};

export default AnimatedNumber;
