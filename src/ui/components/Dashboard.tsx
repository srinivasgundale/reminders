'use client';

import { useState, useEffect } from 'react';
import { Reminder } from '@/domain/reminder';
import {
    getDashboardData,
    submitReminder,
    deleteReminderAction,
    deleteMultipleRemindersAction,
    updateReminderStatusAction,
    updateNudgeAction,
    togglePinAction,
    cloneReminderAction
} from '@/app/actions';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CATEGORIES = ['General', 'Insurance', 'Maintenance', 'Subscription', 'Health', 'Documents'];
const UNITS = ['minutes', 'hours', 'days', 'weeks'];

type SavedView = 'all' | 'pinned' | 'last-7-days' | 'needs-action' | 'overdue';

// Sortable Reminder Card Component
function SortableReminderCard({
    rem,
    selectedReminders,
    toggleSelection,
    handleTogglePin,
    handleClone,
    openEditModal,
    handleComplete,
    handleRevert,
    handleDelete
}: {
    rem: Reminder;
    selectedReminders: string[];
    toggleSelection: (id: string) => void;
    handleTogglePin: (id: string) => void;
    handleClone: (id: string) => void;
    openEditModal: (rem: Reminder) => void;
    handleComplete: (id: string) => void;
    handleRevert: (id: string) => void;
    handleDelete: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: rem.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="glass-panel card-hover"
        >
            <div style={{
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column' as const,
                gap: '1rem',
                position: 'relative' as const,
                borderLeft: `4px solid ${rem.isPinned ? 'var(--accent-warning)' : rem.status === 'completed' ? 'var(--accent-success)' : 'var(--accent-warning)'}`,
                opacity: rem.status === 'completed' ? 0.7 : 1,
                cursor: isDragging ? 'grabbing' : 'grab'
            }}>
                {rem.isPinned && (
                    <div style={{ position: 'absolute' as const, top: '0.75rem', right: '0.75rem', fontSize: '1.125rem' }}>
                        📌
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div
                        {...attributes}
                        {...listeners}
                        style={{
                            cursor: 'grab',
                            padding: '0.25rem',
                            color: 'var(--text-muted)',
                            fontSize: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            flexShrink: 0,
                            touchAction: 'none'
                        }}
                        title="Drag to reorder"
                    >
                        ⋮⋮
                    </div>

                    <input
                        type="checkbox"
                        checked={selectedReminders.includes(rem.id)}
                        onChange={() => toggleSelection(rem.id)}
                        style={{
                            width: '1.25rem',
                            height: '1.25rem',
                            accentColor: 'var(--accent-primary)',
                            cursor: 'pointer',
                            marginTop: '0.125rem',
                            flexShrink: 0
                        }}
                    />

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                            margin: 0,
                            marginBottom: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            textDecoration: rem.status === 'completed' ? 'line-through' : 'none',
                            wordBreak: 'break-word' as const,
                            lineHeight: 1.4
                        }}>
                            {rem.title}
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' as const }}>
                            <span className="badge" style={{
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-secondary)',
                                textTransform: 'uppercase' as const,
                                letterSpacing: '0.5px',
                                fontSize: '0.6875rem'
                            }}>
                                {rem.category}
                            </span>
                            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                                {rem.status === 'completed' ? '✓ Completed' : `Due ${new Date(rem.dueAt).toLocaleDateString()}`}
                            </span>
                            {rem.remindBeforeValue > 0 && rem.status !== 'completed' && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--accent-warning)' }}>
                                    🔔 {rem.remindBeforeValue} {rem.remindBeforeUnit}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap' as const,
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={() => handleTogglePin(rem.id)}
                        style={{
                            padding: '0.5rem 0.75rem',
                            fontSize: '1rem',
                            background: rem.isPinned
                                ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                                : 'var(--bg-elevated)',
                            color: rem.isPinned ? 'white' : 'var(--text-primary)',
                            border: rem.isPinned ? 'none' : '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            minHeight: '2.25rem',
                            minWidth: '2.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: rem.isPinned ? '0 2px 8px rgba(251, 191, 36, 0.4)' : 'none'
                        }}
                        title={rem.isPinned ? 'Unpin' : 'Pin'}
                        onMouseEnter={e => {
                            if (!rem.isPinned) e.currentTarget.style.background = 'var(--bg-card)';
                        }}
                        onMouseLeave={e => {
                            if (!rem.isPinned) e.currentTarget.style.background = 'var(--bg-elevated)';
                        }}
                    >
                        📌
                    </button>

                    <button
                        onClick={() => handleClone(rem.id)}
                        style={{
                            padding: '0.5rem 0.75rem',
                            fontSize: '1rem',
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            minHeight: '2.25rem',
                            minWidth: '2.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Duplicate"
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    >
                        📋
                    </button>

                    <button
                        onClick={() => openEditModal(rem)}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            minHeight: '2.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap' as const
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    >
                        Edit
                    </button>

                    {rem.status !== 'completed' ? (
                        <button
                            onClick={() => handleComplete(rem.id)}
                            style={{
                                padding: '0.5rem 0.75rem',
                                fontSize: '1rem',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                minHeight: '2.25rem',
                                minWidth: '2.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                            }}
                        >
                            ✓
                        </button>
                    ) : (
                        <button
                            onClick={() => handleRevert(rem.id)}
                            style={{
                                padding: '0.5rem 0.75rem',
                                fontSize: '1rem',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                minHeight: '2.25rem',
                                minWidth: '2.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)';
                            }}
                        >
                            ↺
                        </button>
                    )}

                    <button
                        onClick={() => handleDelete(rem.id)}
                        style={{
                            padding: '0.5rem 0.75rem',
                            fontSize: '1.125rem',
                            background: 'transparent',
                            border: '2px solid var(--accent-danger)',
                            color: 'var(--accent-danger)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            minHeight: '2.25rem',
                            minWidth: '2.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700
                        }}
                        title="Delete"
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--accent-danger)';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--accent-danger)';
                        }}
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');

    const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');
    const [selectedReminders, setSelectedReminders] = useState<string[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeView, setActiveView] = useState<SavedView>('all');
    const [sortBy, setSortBy] = useState<'dueDate' | 'created' | 'title' | 'category'>('dueDate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [category, setCategory] = useState('General');
    const [remindValue, setRemindValue] = useState(1);
    const [remindUnit, setRemindUnit] = useState('days');

    // Drag and Drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement required before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        loadData();
        // Load theme from localStorage
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'dark';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
    }, []);

    async function loadData() {
        const data = await getDashboardData();
        setReminders(data.reminders);
        setLoading(false);
    }

    function toggleTheme() {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    }

    function openCreateModal() {
        setEditingId(null);
        setTitle('');
        setDate(new Date().toISOString().split('T')[0]);
        setCategory('General');
        setRemindValue(1);
        setRemindUnit('days');
        setIsModalOpen(true);
    }

    function openEditModal(rem: Reminder) {
        setEditingId(rem.id);
        setTitle(rem.title);
        const d = new Date(rem.dueAt);
        setDate(d.toISOString().split('T')[0]);
        setCategory(rem.category || 'General');
        setRemindValue(rem.remindBeforeValue || 1);
        setRemindUnit(rem.remindBeforeUnit || 'days');
        setIsModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        if (editingId) {
            await updateNudgeAction(editingId, title, date, category, remindValue, remindUnit);
        } else {
            await submitReminder(title, date, category, remindValue, remindUnit);
        }

        await loadData();
        setIsModalOpen(false);
        setLoading(false);
    }

    async function handleComplete(id: string) {
        await updateReminderStatusAction(id, 'completed');
        loadData();
    }

    async function handleDelete(id: string) {
        await deleteReminderAction(id);
        loadData();
    }

    async function handleBulkDelete() {
        await deleteMultipleRemindersAction(selectedReminders);
        setSelectedReminders([]);
        loadData();
    }

    async function handleBulkComplete() {
        for (const id of selectedReminders) {
            await updateReminderStatusAction(id, 'completed');
        }
        setSelectedReminders([]);
        loadData();
    }

    async function handleRevert(id: string) {
        await updateReminderStatusAction(id, 'pending');
        loadData();
    }

    async function handleBulkRevert() {
        for (const id of selectedReminders) {
            await updateReminderStatusAction(id, 'pending');
        }
        setSelectedReminders([]);
        loadData();
    }

    async function handleTogglePin(id: string) {
        await togglePinAction(id);
        loadData();
    }

    async function handleClone(id: string) {
        await cloneReminderAction(id);
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

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setReminders((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }

    function matchesSearch(rem: Reminder): boolean {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        return (
            rem.title.toLowerCase().includes(query) ||
            rem.category.toLowerCase().includes(query)
        );
    }

    function matchesView(rem: Reminder): boolean {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        switch (activeView) {
            case 'pinned':
                return rem.isPinned;
            case 'last-7-days':
                return new Date(rem.createdAt) >= sevenDaysAgo;
            case 'needs-action':
                return rem.status === 'pending' && new Date(rem.dueAt) <= new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            case 'overdue':
                return rem.status === 'pending' && new Date(rem.dueAt) < now;
            default:
                return true;
        }
    }

    function sortReminders(a: Reminder, b: Reminder): number {
        let comparison = 0;

        switch (sortBy) {
            case 'dueDate':
                comparison = new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
                break;
            case 'created':
                comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                break;
            case 'title':
                comparison = a.title.localeCompare(b.title);
                break;
            case 'category':
                comparison = a.category.localeCompare(b.category);
                break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
    }

    const counts = {
        all: reminders.length,
        pending: reminders.filter(r => r.status === 'pending').length,
        completed: reminders.filter(r => r.status === 'completed').length
    };

    const visibleReminders = reminders
        .filter(r => activeTab === 'all' || r.status === activeTab)
        .filter(matchesSearch)
        .filter(matchesView)
        .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return sortReminders(a, b);
        });

    const totalPages = Math.ceil(visibleReminders.length / ITEMS_PER_PAGE);
    const paginatedReminders = visibleReminders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    if (loading && reminders.length === 0) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 600 }}>Loading...</div>
            </div>
        );
    }

    return (
        <>
            {/* Theme Toggle */}
            <div style={{
                position: 'fixed',
                top: '1rem',
                right: '1rem',
                zIndex: 1000,
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-full)',
                padding: '0.25rem',
                display: 'flex',
                flexDirection: window.innerWidth < 640 ? 'column' : 'row',
                gap: '0.25rem',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-color)'
            }}>
                <button
                    onClick={() => theme !== 'light' && toggleTheme()}
                    style={{
                        background: theme === 'light' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                        color: theme === 'light' ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        padding: window.innerWidth < 640 ? '0.5rem' : '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        whiteSpace: 'nowrap',
                        minWidth: window.innerWidth < 640 ? '2.5rem' : 'auto',
                        minHeight: '2.5rem'
                    }}
                    title="Light Mode"
                >
                    <span style={{ fontSize: '1rem' }}>☀️</span>
                    {window.innerWidth >= 640 && <span>Light</span>}
                </button>
                <button
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    style={{
                        background: theme === 'dark' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                        color: theme === 'dark' ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: 'var(--radius-full)',
                        padding: window.innerWidth < 640 ? '0.5rem' : '0.5rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        whiteSpace: 'nowrap',
                        minWidth: window.innerWidth < 640 ? '2.5rem' : 'auto',
                        minHeight: '2.5rem'
                    }}
                    title="Dark Mode"
                >
                    <span style={{ fontSize: '1rem' }}>🌙</span>
                    {window.innerWidth >= 640 && <span>Dark</span>}
                </button>
            </div>

            <div className="container" style={{ padding: '1rem' }}>
                {/* Header */}
                <header style={{ marginBottom: '2rem', textAlign: 'center', paddingTop: '1rem' }} className="fade-in">
                    <h1 className="text-gradient" style={{
                        fontSize: 'clamp(2rem, 8vw, 3rem)',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        letterSpacing: '-0.02em'
                    }}>
                        LifeNudge
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.875rem, 3vw, 1.125rem)' }}>
                        Never forget what matters
                    </p>
                </header>

                {/* Search & Create */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    marginBottom: '1.5rem'
                }} className="slide-in">
                    <div style={{ position: 'relative', width: '100%' }}>
                        <input
                            type="text"
                            placeholder="Search reminders..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                paddingLeft: '2.5rem',
                                fontSize: '1rem'
                            }}
                        />
                        <span style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '1.25rem'
                        }}>
                            🔍
                        </span>
                    </div>
                    <button
                        onClick={openCreateModal}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-lg)',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                        }}
                    >
                        <span style={{ fontSize: '1.25rem' }}>+</span>
                        <span>New Reminder</span>
                    </button>
                </div>

                {/* Smart Views */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(['all', 'pinned', 'last-7-days', 'needs-action', 'overdue'] as SavedView[]).map(view => (
                        <button
                            key={view}
                            onClick={() => { setActiveView(view); setCurrentPage(1); }}
                            style={{
                                background: activeView === view
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    : 'var(--bg-elevated)',
                                color: activeView === view ? 'white' : 'var(--text-primary)',
                                border: activeView === view ? 'none' : '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-full)',
                                padding: '0.625rem 1.125rem',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: activeView === view ? '0 2px 8px rgba(102, 126, 234, 0.3)' : 'none'
                            }}
                            onMouseEnter={e => {
                                if (activeView !== view) {
                                    e.currentTarget.style.background = 'var(--bg-card)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (activeView !== view) {
                                    e.currentTarget.style.background = 'var(--bg-elevated)';
                                }
                            }}
                        >
                            {view.replace('-', ' ')}
                        </button>
                    ))}
                </div>

                {/* Sorting */}
                <div style={{
                    marginBottom: '1.5rem',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                }}>
                    <span style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                        fontWeight: 500
                    }}>
                        Sort:
                    </span>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        style={{ flex: '1 1 auto', minWidth: '120px' }}
                    >
                        <option value="dueDate">Due Date</option>
                        <option value="created">Created</option>
                        <option value="title">Title</option>
                        <option value="category">Category</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                        style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-full)',
                            padding: '0.625rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    >
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                    </button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                }}>
                    {(['pending', 'completed', 'all'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            style={{
                                background: activeTab === tab ? 'var(--bg-elevated)' : 'transparent',
                                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                                border: activeTab === tab ? '1px solid var(--border-color)' : 'none',
                                borderRadius: 'var(--radius-full)',
                                padding: '0.625rem 1rem',
                                fontSize: '0.875rem',
                                fontWeight: activeTab === tab ? 600 : 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                textTransform: 'capitalize',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            {tab}
                            <span className="badge" style={{
                                background: activeTab === tab ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                                color: activeTab === tab ? 'white' : 'var(--text-secondary)'
                            }}>
                                {counts[tab]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Bulk Actions */}
                {selectedReminders.length > 0 && (
                    <div className="glass-panel" style={{
                        marginBottom: '1rem',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'var(--accent-primary)',
                        borderColor: 'var(--accent-primary)',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>
                            {selectedReminders.length} selected
                        </span>
                        <div style={{ flex: 1, minWidth: '1rem' }}></div>
                        {activeTab !== 'completed' && (
                            <button
                                onClick={handleBulkComplete}
                                style={{
                                    background: 'white',
                                    color: 'var(--accent-primary)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.5rem 0.875rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.8125rem',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Complete
                            </button>
                        )}
                        {activeTab === 'completed' && (
                            <button
                                onClick={handleBulkRevert}
                                style={{
                                    background: 'white',
                                    color: 'var(--accent-primary)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.5rem 0.875rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '0.8125rem',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                Revert
                            </button>
                        )}
                        <button
                            onClick={handleBulkDelete}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.5rem 0.875rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.8125rem',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            Delete
                        </button>
                    </div>
                )}

                {/* Results Info */}
                <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {visibleReminders.length} {visibleReminders.length === 1 ? 'result' : 'results'}
                </div>

                {/* Reminders List */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={paginatedReminders.map(r => r.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {paginatedReminders.map(rem => (
                                <SortableReminderCard
                                    key={rem.id}
                                    rem={rem}
                                    selectedReminders={selectedReminders}
                                    toggleSelection={toggleSelection}
                                    handleTogglePin={handleTogglePin}
                                    handleClone={handleClone}
                                    openEditModal={openEditModal}
                                    handleComplete={handleComplete}
                                    handleRevert={handleRevert}
                                    handleDelete={handleDelete}
                                />
                            ))}

                            {paginatedReminders.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                                    <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                        {searchQuery ? `No results for "${searchQuery}"` : 'No reminders found'}
                                    </p>
                                    <p style={{ fontSize: '0.9375rem' }}>
                                        {!searchQuery && activeTab === 'pending' && 'Create your first reminder to get started'}
                                    </p>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="btn-secondary"
                                        style={{
                                            padding: '0.5rem 1rem',
                                            opacity: currentPage === 1 ? 0.5 : 1,
                                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Previous
                                    </button>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500 }}>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="btn-secondary"
                                        style={{
                                            padding: '0.5rem 1rem',
                                            opacity: currentPage === totalPages ? 0.5 : 1,
                                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>

                {/* Modal */}
                {isModalOpen && (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }} className="fade-in">
                        <div className="glass-panel" style={{
                            width: '100%',
                            maxWidth: '540px',
                            padding: '2rem',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}>
                            <h2 style={{ marginBottom: '2rem', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {editingId ? 'Edit Reminder' : 'New Reminder'}
                            </h2>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Renew car insurance"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        style={{ width: '100%' }}
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                        Category
                                    </label>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setCategory(cat)}
                                                className="btn-secondary"
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    fontSize: '0.875rem',
                                                    background: category === cat ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                                                    color: category === cat ? 'white' : 'var(--text-primary)',
                                                    borderColor: category === cat ? 'var(--accent-primary)' : 'var(--border-color)'
                                                }}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                        Due Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                        Remind me before
                                    </label>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            value={remindValue}
                                            onChange={e => setRemindValue(parseInt(e.target.value) || 0)}
                                            style={{ flex: 1 }}
                                        />
                                        <select
                                            value={remindUnit}
                                            onChange={e => setRemindUnit(e.target.value)}
                                            style={{ flex: 1 }}
                                        >
                                            {UNITS.map(u => (
                                                <option key={u} value={u}>{u}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.875rem' }}>
                                        {editingId ? 'Save Changes' : 'Create Reminder'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="btn-secondary"
                                        style={{ flex: 1, padding: '0.875rem' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
``