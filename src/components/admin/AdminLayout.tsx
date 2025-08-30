"use client";

import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function AdminLayout({ 
  children, 
  title, 
  subtitle, 
  actions 
}: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        {(title || subtitle || actions) && (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                {title && (
                  <h1 className="text-2xl font-bold text-slate-900">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-slate-600 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
              
              {actions && (
                <div className="flex items-center space-x-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// Componentes auxiliares para layouts comunes
export function AdminCard({ 
  children, 
  title, 
  className = "",
  padding = "p-6",
  hover = false
}: {
  children: ReactNode;
  title?: string;
  className?: string;
  padding?: string;
  hover?: boolean;
}) {
  return (
    <div className={`
      bg-white rounded-xl border border-slate-200 shadow-sm 
      ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
      ${className}
    `}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">
            {title}
          </h3>
        </div>
      )}
      <div className={title ? `${padding}` : padding}>
        {children}
      </div>
    </div>
  );
}

export function AdminGrid({ 
  children, 
  cols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  gap = "gap-6"
}: {
  children: ReactNode;
  cols?: string;
  gap?: string;
}) {
  return (
    <div className={`grid ${cols} ${gap}`}>
      {children}
    </div>
  );
}

export function AdminStat({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = "blue",
  trend
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'slate';
  trend?: {
    value: string;
    isPositive: boolean;
  };
}) {
  const colorClasses = {
    blue: 'from-blue-50 to-indigo-50 border-blue-200 text-blue-700',
    green: 'from-emerald-50 to-green-50 border-emerald-200 text-emerald-700',
    yellow: 'from-amber-50 to-yellow-50 border-amber-200 text-amber-700',
    red: 'from-red-50 to-rose-50 border-red-200 text-red-700',
    purple: 'from-violet-50 to-purple-50 border-violet-200 text-violet-700',
    slate: 'from-slate-50 to-gray-50 border-slate-200 text-slate-700'
  };

  return (
    <AdminCard className={`bg-gradient-to-br ${colorClasses[color]} border overflow-visible`} padding="p-4">
      <div className="flex flex-col">
        {icon && (
          <div className="flex items-start justify-between mb-2">
            <div className="w-8 h-8 bg-white/60 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm">
              {icon}
            </div>
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-slate-700">
            {title}
          </p>
          <p className="text-2xl lg:text-3xl font-bold mt-1 text-slate-900 break-all">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs font-medium text-slate-600 mt-1 truncate">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={`flex items-center mt-2 text-xs ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <svg 
                className={`w-3 h-3 mr-1 ${
                  trend.isPositive ? 'rotate-0' : 'rotate-180'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              {trend.value}
            </div>
          )}
        </div>
      </div>
    </AdminCard>
  );
}

export function AdminButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = ""
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  className?: string;
}) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
    success: 'bg-green-600 hover:bg-green-700 text-white border-transparent'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center space-x-2 rounded-lg border font-medium
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )}
      {!loading && icon && icon}
      <span>{children}</span>
    </button>
  );
}
