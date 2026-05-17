'use client';

import React from 'react';
import { LucideIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';

type ButtonOwnProps = {
  variant?: 'default' | 'outline' | 'ghost' | 'glass' | 'danger' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  pulse?: boolean;
  rounded?: 'default' | 'full' | 'xl';
};

export type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> &
  ButtonOwnProps & {
    children?: React.ReactNode;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'default',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  pulse = false,
  rounded = 'default',
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = `
    inline-flex items-center justify-center
    font-semibold
    relative overflow-hidden
    disabled:opacity-50 disabled:cursor-not-allowed
    outline-none
  `;

  const sizeClasses = {
    xs: 'h-8 px-3 text-xs gap-1.5',
    sm: 'h-10 px-4 text-sm gap-2',
    md: 'h-12 px-6 text-base gap-2.5',
    lg: 'h-14 px-8 text-lg gap-3',
    xl: 'h-16 px-10 text-xl gap-3.5',
    icon: 'h-10 w-10 p-2',
  };

  const roundedClasses = {
    default: 'rounded-xl',
    full: 'rounded-full',
    xl: 'rounded-2xl',
  };

  const variantClasses = {
    default: `
      bg-primary
      text-primary-content
      shadow-lg shadow-primary/20
      hover:bg-primary/90
      border border-transparent
    `,
    outline: `
      bg-transparent
      border-2 border-primary
      text-primary
      hover:bg-primary/10
    `,
    ghost: `
      bg-transparent
      text-base-content/60
      hover:text-base-content
      hover:bg-base-200
    `,
    glass: `
      bg-base-100/10 dark:bg-white/[0.03]
      backdrop-blur-md
      border border-base-content/10 dark:border-white/10
      text-base-content
      hover:bg-base-100/20 dark:hover:bg-white/[0.05]
      shadow-xl shadow-base-content/5
    `,
    danger: `
      bg-red-600
      text-white
      shadow-lg shadow-red-600/20
      hover:bg-red-700
    `,
    link: `
      bg-transparent
      text-primary
      underline-offset-4
      hover:underline
      shadow-none
      border-none
    `
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`
        ${baseStyles}
        ${sizeClasses[size]}
        ${roundedClasses[rounded]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {/* Glow Effect for Primary Variant */}
      {variant === 'default' && !disabled && (
        <motion.div
          className="absolute inset-0 bg-white/10"
          initial={{ x: '-100%', skewX: -15 }}
          whileHover={{ x: '200%' }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        />
      )}

      {/* Content */}
      <span className="relative z-10 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Chargement...</span>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
              {children}
              {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
            </motion.div>
          )}
        </AnimatePresence>
      </span>

      {/* Pulse Effect */}
      {pulse && (
        <span className="absolute right-0 top-0 -mr-1 -mt-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
