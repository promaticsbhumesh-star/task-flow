import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, isOverdue }) {
  if (isOverdue) return <span className="badge badge-overdue">overdue</span>;
  return <span className={`badge badge-${status}`}>{status}</span>;
}

// ─── Create Task Modal (Admin) ────────────────────────────────────────────────
function CreateTaskModal({ onClose, onSave }) {
  const [form, setForm]         = useState({ title: '', description: '', projectId: '', assignedTo: '', dueDate: '', priority: 'medium' });
  const [projects, setProjects] = useState([]);
  const [members, setMembers]   = useState([]);
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    api.get('/projects').then((r) => setProjects(r.data.projects));
  }, []);

  // When project changes, update member list
  useEffect(() => {
    if (!form.projectId) { setMembers([]); return; }
    const proj = projects.find((p) => p._id === form.projectId);
    setMembers(proj?.members || []);
    setForm((f) => ({ ...f, assignedTo: '' }));
  }, [form.projectId, projects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const r = await api.post('/tasks', form);
      onSave(r.data.task);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <p className="modal-title">Create Task</p>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label>Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Task title" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional details..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Project *</label>
              <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} required>
                <option value="">Select project...</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Assign To</label>
              <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} disabled={!form.projectId}>
                <option value="">Unassigned</option>
                {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Update Status Modal (Member) ─────────────────────────────────────────────
function UpdateStatusModal({ task, onClose, onUpdate }) {
  const [status, setStatus] = useState(task.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await api.put(`/tasks/${task._id}`, { status });
      onUpdate(r.data.task);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
        <p className="modal-title">Update Status</p>
        <p className="text-muted" style={{ marginTop: -8, fontSize: '0.85rem' }}>{task.title}</p>
        <div className="form-group">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Tasks Page ──────────────────────────────────────────────────────────
export default function Tasks() {
  const { user }  = useAuth();
  const isAdmin   = user?.role === 'admin';
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filterStatus, setFilter] = useState('');
  const [modal, setModal]       = useState(null);

  const load = () => {
    const params = filterStatus ? `?status=${filterStatus}` : '';
    api.get(`/tasks${params}`)
      .then((r) => setTasks(r.data.tasks))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    setTasks((t) => t.filter((x) => x._id !== id));
  };

  const handleCreate = (task) => setTasks((t) => [task, ...t]);
  const handleUpdate = (updated) => setTasks((t) => t.map((x) => x._id === updated._id ? updated : x));

  if (loading) return <div className="spinner" />;

  return (
    <>
      <div className="flex-between mb-24">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Tasks</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={filterStatus} onChange={(e) => setFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setModal('create')}>+ New Task</button>
          )}
        </div>
      </div>

      <div className="card">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '2rem' }}>✦</p>
            <p>No tasks found.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => {
                  const overdue = t.dueDate && t.status !== 'done' && new Date() > new Date(t.dueDate);
                  return (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 600, maxWidth: 200 }}>{t.title}</td>
                      <td className="text-muted">{t.project?.name || '—'}</td>
                      <td>{t.assignedTo?.name || <span className="text-muted">Unassigned</span>}</td>
                      <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                      <td><StatusBadge status={t.status} isOverdue={overdue} /></td>
                      <td className="text-muted" style={{ fontSize: '0.82rem' }}>
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {/* Member can update their own task status */}
                          {!isAdmin && t.assignedTo?._id === user._id && (
                            <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'status', task: t })}>
                              Update
                            </button>
                          )}
                          {/* Admin can update any task status */}
                          {isAdmin && (
                            <>
                              <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'status', task: t })}>
                                Status
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === 'create' && (
        <CreateTaskModal onClose={() => setModal(null)} onSave={handleCreate} />
      )}
      {modal?.type === 'status' && (
        <UpdateStatusModal task={modal.task} onClose={() => setModal(null)} onUpdate={handleUpdate} />
      )}
    </>
  );
}
