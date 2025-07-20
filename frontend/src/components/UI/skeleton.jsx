import React from "react";

const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-pulse bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded ${className}`}
      {...props}
    />
  );
};

export { Skeleton };
