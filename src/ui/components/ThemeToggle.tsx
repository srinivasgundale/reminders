'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    function toggleTheme() {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    }

    return (
        <div style={{
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-full)',
            padding: '0.25rem',
            display: 'flex',
            gap: '0.25rem',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
            alignItems: 'center'
        }}>
            <button
                onClick={() => theme !== 'light' && toggleTheme()}
                style={{
                    background: theme === 'light' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                    color: theme === 'light' ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    width: '2.5rem',
                    height: '2.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title="Light Mode"
            >
                ☀️
            </button>
            <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                style={{
                    background: theme === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                    color: theme === 'dark' ? 'white' : 'var(--text-secondary)',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    width: '2.5rem',
                    height: '2.5rem',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title="Dark Mode"
            >
                🌙
            </button>
        </div>
    );
}
