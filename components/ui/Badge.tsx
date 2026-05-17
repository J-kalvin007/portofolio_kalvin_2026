'use client';

import React from 'react';
import { useTheme } from '@/lib/useTheme';
import { motion } from 'framer-motion';

interface BadgeProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'default';
  text: string;
  icon?: React.ReactNode;
  pulse?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ status, text, icon, pulse = false }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const statusConfig = {
    success: {
      bg: isDark ? 'bg-[#23BE31]/10' : 'bg-green-50',
      text: isDark ? 'text-[#23BE31]' : 'text-green-700',
      border: isDark ? 'border-[#23BE31]/20' : 'border-green-200',
      dot: 'bg-[#23BE31]'
    },
    error: {
      bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
      text: isDark ? 'text-red-400' : 'text-red-700',
      border: isDark ? 'border-red-500/20' : 'border-red-200',
      dot: 'bg-red-500'
    },
    warning: {
      bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
      text: isDark ? 'text-amber-400' : 'text-amber-700',
      border: isDark ? 'border-amber-500/20' : 'border-amber-200',
      dot: 'bg-amber-500'
    },
    info: {
      bg: isDark ? 'bg-primary/10' : 'bg-primary/5',
      text: isDark ? 'text-primary' : 'text-primary',
      border: isDark ? 'border-primary/20' : 'border-primary/20',
      dot: 'bg-primary'
    },
    default: {
      bg: isDark ? 'bg-gray-500/10' : 'bg-gray-100',
      text: isDark ? 'text-gray-400' : 'text-gray-700',
      border: isDark ? 'border-gray-500/20' : 'border-gray-200',
      dot: 'bg-gray-500'
    }
  };

  const config = statusConfig[status] || statusConfig.default;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 
        rounded-full text-xs font-semibold
        border backdrop-blur-sm
        ${config.bg} ${config.text} ${config.border}
      `}
    >
      {pulse ? (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
        </span>
      ) : icon ? (
        <span className="w-3 h-3">{icon}</span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      )}
      <span>{text}</span>
    </motion.div>
  );
};

export default Badge;
