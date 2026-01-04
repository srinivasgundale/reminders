'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const pathname = usePathname();

    const navItems = [
        { label: 'LifeNudge', href: '/', icon: '🔔' },
        { label: 'Asset Tracker', href: '/assets', icon: '💎' }
    ];

    return (
        <nav className="glass-panel" style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            padding: '0.75rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-primary)',
            opacity: 0.98,
            backdropFilter: 'blur(12px) saturate(180%)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <Link href="/" style={{
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                    color: 'var(--text-primary)'
                }}>
                    <span style={{
                        fontSize: '1.5rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>✨</span>
                    <span>SaaS Hub</span>
                </Link>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {navItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                textDecoration: 'none',
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                transition: 'all 0.3s ease',
                                background: pathname === item.href ? 'var(--bg-elevated)' : 'transparent',
                                color: pathname === item.href ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <ThemeToggle />
                <div style={{
                    padding: '0.25rem 0.75rem',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--accent-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    Beta
                </div>
            </div>
        </nav>
    );
}
