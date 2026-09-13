import React from 'react'

export interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

const roundedClasses = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'xl',
}) => {
  const style: React.CSSProperties = {}
  if (width !== undefined) style.width = width
  if (height !== undefined) style.height = height

  return (
    <div
      style={style}
      className={`bg-surface-3 animate-pulse border border-border-subtle/50 ${roundedClasses[rounded]} ${className}`}
    />
  )
}
