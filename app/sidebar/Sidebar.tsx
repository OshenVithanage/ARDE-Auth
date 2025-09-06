'use client'

import React, { useState } from 'react';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isExpanded, onToggle }: SidebarProps) {
  return (
    <div 
      className={`h-screen transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-64' : 'w-16'
      } flex flex-col`}
      style={{ 
        background: isExpanded ? 'var(--primary)' : 'var(--background)',
        borderRight: '1px solid var(--border)'
      }}
    >
      {/* Header with expand/collapse button */}
      <div className="p-4">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-start gap-3 p-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none cursor-pointer"
          style={{ 
            color: 'var(--text)',
            backgroundColor: 'transparent',
            border: 'none'
          }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'var(--secondary)'}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = 'transparent'}
        >
          {/* Menu/Hamburger Icon */}
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
            style={{ display: 'block' }}
          >
            <path 
              d="M3 12H21M3 6H21M3 18H21" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          
          {/* Text - only show when expanded */}
          {isExpanded && (
            <span className="font-medium text-sm whitespace-nowrap">
              ARDE
            </span>
          )}
        </button>
      </div>

      {/* Sidebar content area */}
      <div className="flex-1 p-4">
        {isExpanded ? (
          <div style={{ color: 'var(--text)' }}>
            <p className="text-sm opacity-60">Sidebar content will go here...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Collapsed state - could add navigation icons here */}
          </div>
        )}
      </div>
    </div>
  );
}
