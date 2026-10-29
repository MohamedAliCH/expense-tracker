import React from "react";
import { motion } from "framer-motion";

export const SkeletonBox = ({ className = "", style = {} }) => (
  <div
    className={`animate-pulse rounded-[12px] ${className}`}
    style={{
      background: "linear-gradient(90deg, var(--card-2) 0%, var(--card-3) 50%, var(--card-2) 100%)",
      backgroundSize: "200% 100%",
      boxShadow: "inset 0 0 0 1px var(--line)",
      ...style,
    }}
  />
);

export const DashboardSkeleton = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full flex flex-col gap-5 py-2"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
        <div className="space-y-2">
          <SkeletonBox className="w-64 h-8" />
          <SkeletonBox className="w-96 h-4" />
        </div>
        <div className="flex gap-2">
          <SkeletonBox className="w-28 h-9 rounded-[12px]" />
          <SkeletonBox className="w-32 h-9 rounded-[12px]" />
        </div>
      </div>

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="moorly-card p-5 flex flex-col justify-between h-[126px]"
          >
            <div className="flex justify-between items-center">
              <SkeletonBox className="w-24 h-4" />
              <SkeletonBox className="w-7 h-7 rounded-[8px]" />
            </div>
            <SkeletonBox className="w-36 h-7" />
            <SkeletonBox className="w-48 h-3" />
          </div>
        ))}
      </div>

      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="moorly-card lg:col-span-2 p-6 flex flex-col gap-4 h-[350px]">
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
              <SkeletonBox className="w-40 h-5" />
              <SkeletonBox className="w-56 h-3" />
            </div>
            <SkeletonBox className="w-36 h-7 rounded-[8px]" />
          </div>
          <SkeletonBox className="w-full flex-1 rounded-[14px]" />
        </div>

        <div className="moorly-card p-6 flex flex-col gap-4 h-[350px]">
          <SkeletonBox className="w-32 h-5" />
          <div className="flex-1 flex items-center justify-center">
            <SkeletonBox className="w-44 h-44 rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardSkeleton;

