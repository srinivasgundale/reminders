'use client';

import { useState, useEffect } from 'react';
import { Reminder } from '@/domain/reminder';
import {
    getDashboardData,
    submitReminder,
    deleteReminderAction,
    deleteMultipleRemindersAction,
    updateReminderStatusAction,
    updateNudgeAction
} from '@/app/actions';

// Define Categories
const CATEGORIES = ['General', 'Insurance', 'Maintenance', 'Subscription', 'Health', 'Documents'];
const UNITS = ['minutes', 'hours', 'days', 'weeks'];

export default function Dashboard() {
    // State
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');
    const [selectedReminders, setSelectedReminders] = useState<string[]>([]);

    // Pagination
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('General');
    const [remindValue, setRemindValue] = useState(1);
    const [remindUnit, setRemindUnit] = useState('days');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const data = await getDashboardData();
        setReminders(data.reminders);
        setLoading(false);
    }

    // --- Actions ---

    function openCreateModal() {
        setEditingId(null);
        setTitle('');
        setDate(new Date().toISOString().split('T')[0]); // Default today
        setCategory('General');
        setRemindValue(1);
        setRemindUnit('days');
        setIsModalOpen(true);
    }

    function openEditModal(rem: Reminder) {
        setEditingId(rem.id);
        setTitle(rem.title);
        // Format date for input [type=date]
        const d = new Date(rem.dueAt);
        const dateString = d.toISOString().split('T')[0];
        setDate(dateString);

        setCategory(rem.category || 'General');
        setRemindValue(rem.remindBeforeValue || 1);
        setRemindUnit(rem.remindBeforeUnit || 'days');

        setIsModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        if (editingId) {
            // Edit Mode
            await updateNudgeAction(editingId, title, date, category, remindValue, remindUnit);
        } else {
            // Create Mode
            await submitReminder(title, date, category, remindValue, remindUnit);
        }

        await loadData();
        setIsModalOpen(false);
        setLoading(false);
    }

    async function handleComplete(id: string) {
        setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'completed' } : r));
        await updateReminderStatusAction(id, 'completed');
        loadData();
    }

    async function handleDelete(id: string) {
        setReminders(prev => prev.filter(r => r.id !== id));
        await deleteReminderAction(id);
        loadData();
    }

    async function handleBulkDelete() {
        const ids = selectedReminders;
        setSelectedReminders([]);
        setReminders(prev => prev.filter(r => !ids.includes(r.id)));
        await deleteMultipleRemindersAction(ids);
        loadData();
    }

    async function handleBulkComplete() {
        const ids = selectedReminders;
        setSelectedReminders([]);
        setReminders(prev => prev.map(r => ids.includes(r.id) ? { ...r, status: 'completed' } : r));
        for (const id of ids) {
            await updateReminderStatusAction(id, 'completed');
        }
        loadData();
    }

    async function handleRevert(id: string) {
        setReminders(prev => prev.map(r => r.id === id ? { ...r, status: 'pending' } : r));
        await updateReminderStatusAction(id, 'pending');
        loadData();
    }

    async function handleBulkRevert() {
        const ids = selectedReminders;
        setSelectedReminders([]);
        setReminders(prev => prev.map(r => ids.includes(r.id) ? { ...r, status: 'pending' } : r));
        for (const id of ids) {
            await updateReminderStatusAction(id, 'pending');
        }
        loadData();
    }

    function toggleSelection(id: string) {
        setSelectedReminders(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }

    function handleTabChange(tab: 'pending' | 'completed' | 'all') {
        setActiveTab(tab);
        setSelectedReminders([]);
        setCurrentPage(1);
    }

    // Filter & Pagination
    const counts = {
        all: reminders.length,
        pending: reminders.filter(r => r.status === 'pending').length,
        completed: reminders.filter(r => r.status === 'completed').length
    };

    const visibleReminders = reminders.filter(r => {
        if (activeTab === 'all') return true;
        return r.status === activeTab;
    });

    const totalPages = Math.ceil(visibleReminders.length / ITEMS_PER_PAGE);
    const paginatedReminders = visibleReminders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    if (loading && reminders.length === 0) {
        return (
            <div className="container" style={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}>
                <div className="text-gradient">Loading LifeNudge...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <header style={{ marginBottom: '3rem', textAlign: 'center', position: 'relative' }}>
                <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>LifeNudge</h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>Don't just remember. Regret less.</p>
            </header>

            {/* Main Action Button (Floating or Top) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                    onClick={openCreateModal}
                    className="btn-primary"
                    style={{
                        boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.4)',
                        padding: '0.75rem 1.5rem',
                        fontSize: '1rem'
                    }}
                >
                    + New Nudge
                </button>
            </div>

            {/* Nudges List Section */}
            <section style={{ marginBottom: '3rem' }}>

                {/* Tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-full)', padding: '4px' }}>
                        {(['pending', 'completed', 'all'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                style={{
                                    background: activeTab === tab ? 'var(--color-bg-elevated)' : 'transparent',
                                    color: activeTab === tab ? 'white' : 'var(--color-text-muted)',
                                    border: 'none',
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '0.9rem',
                                    textTransform: 'capitalize',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {tab}
                                <span style={{
                                    background: activeTab === tab ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    padding: '1px 6px',
                                    borderRadius: '10px',
                                    fontSize: '0.75rem',
                                    minWidth: '20px',
                                    textAlign: 'center'
                                }}>
                                    {counts[tab]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedReminders.length > 0 && (
                    <div className="glass-panel" style={{
                        marginBottom: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem',
                        background: 'rgba(99, 102, 241, 0.1)', border: '1px solid var(--color-primary)'
                    }}>
                        <span style={{ fontSize: '1rem', fontWeight: 600 }}>{selectedReminders.length} selected</span>
                        <div style={{ flex: 1 }}></div>
                        {activeTab !== 'completed' && (
                            <button onClick={handleBulkComplete} style={{ background: 'transparent', border: 'none', color: 'var(--color-success)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Mark Complete</button>
                        )}
                        {activeTab === 'completed' && (
                            <button onClick={handleBulkRevert} style={{ background: 'transparent', border: 'none', color: 'var(--color-warning)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Mark Pending</button>
                        )}
                        <button onClick={handleBulkDelete} style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Delete</button>
                    </div>
                )}

                {/* List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {paginatedReminders.map(rem => (
                        <div key={rem.id} className="glass-panel" style={{
                            padding: '1.25rem',
                            display: 'flex',
                            flexWrap: 'wrap', // Allow wrapping
                            gap: '1rem',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderLeft: `4px solid ${rem.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)'}`,
                            opacity: rem.status === 'completed' ? 0.6 : 1,
                            transition: 'all 0.2s'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '200px' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedReminders.includes(rem.id)}
                                    onChange={() => toggleSelection(rem.id)}
                                    style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--color-primary)', cursor: 'pointer', flexShrink: 0 }}
                                />
                                <div style={{ minWidth: 0 }}>
                                    <h3 style={{
                                        margin: 0,
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        textDecoration: rem.status === 'completed' ? 'line-through' : 'none',
                                        wordBreak: 'break-word',
                                        lineHeight: 1.4
                                    }}>
                                        {rem.title}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                        <span style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            color: 'var(--color-text-secondary)',
                                            textTransform: 'uppercase',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {rem.category || 'General'}
                                        </span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                                            {rem.status === 'completed' ? 'Completed' : `Due: ${new Date(rem.dueAt).toLocaleDateString()}`}
                                        </span>
                                        {rem.remindBeforeValue > 0 && rem.status !== 'completed' && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', whiteSpace: 'nowrap' }}>
                                                (🔔 {rem.remindBeforeValue} {rem.remindBeforeUnit} before)
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                <button
                                    onClick={() => openEditModal(rem)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--color-text-muted)',
                                        color: 'var(--color-text-muted)',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: '0.4rem 0.8rem',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Edit
                                </button>

                                {rem.status !== 'completed' ? (
                                    <button
                                        onClick={() => handleComplete(rem.id)}
                                        className="btn-primary"
                                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', background: 'var(--color-success)' }}
                                        title="Mark as Completed"
                                    >
                                        ✓
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleRevert(rem.id)}
                                        style={{
                                            fontSize: '0.8rem',
                                            padding: '0.4rem 0.8rem',
                                            background: 'transparent',
                                            border: '1px solid var(--color-warning)',
                                            color: 'var(--color-warning)',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer'
                                        }}
                                        title="Mark as Pending"
                                    >
                                        ↺
                                    </button>
                                )}

                                <button
                                    onClick={() => handleDelete(rem.id)}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--color-danger)',
                                        color: 'var(--color-danger)',
                                        borderRadius: 'var(--radius-sm)',
                                        width: '32px',
                                        height: '32px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title="Delete"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                    {visibleReminders.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>No {activeTab} nudges found.</p>
                            {activeTab === 'pending' && (
                                <button onClick={openCreateModal} className="btn-primary" style={{ opacity: 0.8 }}>
                                    Create your first nudge
                                </button>
                            )}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--color-text-muted)',
                                    color: 'var(--color-text-muted)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.4rem 0.8rem',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === 1 ? 0.5 : 1
                                }}
                            >
                                Previous
                            </button>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--color-text-muted)',
                                    color: 'var(--color-text-muted)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.4rem 0.8rem',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                    opacity: currentPage === totalPages ? 0.5 : 1
                                }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '90%', maxWidth: '500px', padding: '2rem', animation: 'fadeIn 0.2s ease' }}>
                        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            {editingId ? 'Edit Nudge' : 'New Nudge'}
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                            {/* Title */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                    What is it?
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Renew car insurance"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'white',
                                        fontSize: '1rem'
                                    }}
                                    autoFocus // Only auto focus on create?
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                    Category
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setCategory(cat)}
                                            style={{
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: 'var(--radius-full)',
                                                border: '1px solid ' + (category === cat ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'),
                                                background: category === cat ? 'var(--color-primary)' : 'transparent',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                    When is it due?
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(0,0,0,0.2)',
                                        color: 'white',
                                        fontSize: '1rem',
                                        colorScheme: 'dark'
                                    }}
                                />
                            </div>

                            {/* Alert Config */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                    Remind me before
                                </label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input
                                        type="number"
                                        min="0"
                                        value={remindValue}
                                        onChange={e => setRemindValue(parseInt(e.target.value) || 0)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(0,0,0,0.2)',
                                            color: 'white'
                                        }}
                                    />
                                    <select
                                        value={remindUnit}
                                        onChange={e => setRemindUnit(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(0,0,0,0.2)',
                                            color: 'white'
                                        }}
                                    >
                                        {UNITS.map(u => (
                                            <option key={u} value={u} style={{ background: '#111' }}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
                                    {editingId ? 'Save Changes' : 'Create Nudge'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        flex: 1,
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--color-text-muted)',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
