'use client';

import { useState, useEffect } from 'react';
import { DigitalAsset, AssetType } from '@/domain/asset';
import {
    getAssetsAction,
    submitAssetAction,
    updateAssetAction,
    deleteAssetAction,
    reorderAssetsAction
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

const ASSET_TYPES: AssetType[] = ['Domain', 'Subscription', 'License', 'Warranty', 'Certificate', 'Other'];

// Sortable Asset Card
function SortableAssetCard({
    asset,
    onEdit,
    onDelete
}: {
    asset: DigitalAsset;
    onEdit: (asset: DigitalAsset) => void;
    onDelete: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: asset.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const typeIcons: Record<AssetType, string> = {
        Domain: '🌐',
        Subscription: '♻️',
        License: '🔑',
        Warranty: '🛡️',
        Certificate: '📜',
        Other: '📦'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="glass-panel card-hover"
        >
            <div style={{
                padding: '1.25rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                cursor: isDragging ? 'grabbing' : 'auto'
            }}>
                <div
                    {...attributes}
                    {...listeners}
                    style={{
                        cursor: 'grab',
                        color: 'var(--text-muted)',
                        fontSize: '1.25rem',
                        touchAction: 'none'
                    }}
                >
                    ⋮⋮
                </div>

                <div style={{
                    fontSize: '2rem',
                    background: 'var(--bg-elevated)',
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    {typeIcons[asset.type]}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{asset.title}</h3>
                        <span className="badge" style={{ fontSize: '0.7rem' }}>{asset.type}</span>
                    </div>
                    {asset.identifier && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                            {asset.identifier}
                        </div>
                    )}
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {asset.expiresAt ? `Expires: ${new Date(asset.expiresAt).toLocaleDateString()}` : 'No expiry date'}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => onEdit(asset)} className="btn-secondary" style={{ padding: '0.5rem' }}>✏️</button>
                    <button onClick={() => onDelete(asset.id)} className="btn-secondary" style={{ padding: '0.5rem', color: 'var(--accent-danger)' }}>🗑️</button>
                </div>
            </div>
        </div>
    );
}

export default function AssetDashboard() {
    const [assets, setAssets] = useState<DigitalAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<DigitalAsset | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        type: 'Domain' as AssetType,
        category: 'Personal',
        identifier: '',
        metadata: '',
        expiresAt: '',
        remindAt: ''
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const data = await getAssetsAction();
            setAssets(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = assets.findIndex(a => a.id === active.id);
            const newIndex = assets.findIndex(a => a.id === over.id);
            const newItems = arrayMove(assets, oldIndex, newIndex);
            setAssets(newItems);
            try {
                await reorderAssetsAction(newItems.map(a => a.id));
            } catch (err) {
                console.error(err);
                loadData();
            }
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            if (editingAsset) {
                await updateAssetAction(editingAsset.id, formData.title, formData.type, formData.category, formData.identifier, formData.metadata, formData.expiresAt, formData.remindAt);
            } else {
                await submitAssetAction(formData.title, formData.type, formData.category, formData.identifier, formData.metadata, formData.expiresAt, formData.remindAt);
            }
            setIsModalOpen(false);
            setEditingAsset(null);
            resetForm();
            loadData();
        } catch (err) {
            console.error(err);
        }
    }

    function resetForm() {
        setFormData({
            title: '',
            type: 'Domain',
            category: 'Personal',
            identifier: '',
            metadata: '',
            expiresAt: '',
            remindAt: ''
        });
    }

    function openEditModal(asset: DigitalAsset) {
        setEditingAsset(asset);
        setFormData({
            title: asset.title,
            type: asset.type,
            category: asset.category,
            identifier: asset.identifier || '',
            metadata: asset.metadata || '',
            expiresAt: asset.expiresAt ? new Date(asset.expiresAt).toISOString().split('T')[0] : '',
            remindAt: asset.remindAt ? new Date(asset.remindAt).toISOString().split('T')[0] : ''
        });
        setIsModalOpen(true);
    }

    async function handleDelete(id: string) {
        if (confirm('Delete this asset?')) {
            await deleteAssetAction(id);
            loadData();
        }
    }

    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '0.5rem' }}>Digital Assets</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Store and track your high-value digital belongings.</p>
            </header>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                <button
                    onClick={() => { resetForm(); setEditingAsset(null); setIsModalOpen(true); }}
                    className="btn-primary"
                    style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-lg)' }}
                >
                    + Add New Asset
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>Loading assets...</div>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={assets.map(a => a.id)} strategy={verticalListSortingStrategy}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {assets.map(asset => (
                                <SortableAssetCard
                                    key={asset.id}
                                    asset={asset}
                                    onEdit={openEditModal}
                                    onDelete={handleDelete}
                                />
                            ))}
                            {assets.length === 0 && (
                                <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No assets tracked yet. Click "Add New Asset" to start.
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {isModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: 'var(--radius-xl)' }}>
                        <h2 style={{ marginBottom: '2rem' }}>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label>Asset Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Portfolio Domain"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type</label>
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as AssetType })}>
                                        {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Personal" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Identifier (Domain/Serial/URL)</label>
                                <input type="text" value={formData.identifier} onChange={e => setFormData({ ...formData, identifier: e.target.value })} placeholder="e.g. example.com" />
                            </div>

                            <div className="form-group">
                                <label>Account Metadata / Notes</label>
                                <textarea
                                    value={formData.metadata}
                                    onChange={e => setFormData({ ...formData, metadata: e.target.value })}
                                    placeholder="e.g. Linked email, purchase date, recurring cost..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Expiry Date</label>
                                    <input type="date" value={formData.expiresAt} onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Remind Date</label>
                                    <input type="date" value={formData.remindAt} onChange={e => setFormData({ ...formData, remindAt: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="submit" className="btn-primary" style={{ flex: 1, height: '3.5rem' }}>Save Asset</button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary" style={{ flex: 1, height: '3.5rem' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
