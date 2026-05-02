import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// ─── Modal: Create / Edit Project ────────────────────────────────────────────
function ProjectModal({ project, onClose, onSave }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'active',
  });
  const [error, setError]     = useState('');
  const [saving, setSaving]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (project) {
        const r = await api.put(`/projects/${project._id}`, form);
        onSave(r.data.project, 'edit');
      } else {
        const r = await api.post('/projects', form);
        onSave(r.data.project, 'add');
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <p className="modal-title">{project ? 'Edit Project' : 'New Project'}</p>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label>Project Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Jan Awaaz" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What is this project about?" />
          </div>
          {project && (
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal: Manage Members ────────────────────────────────────────────────────
function MembersModal({ project, onClose, onUpdate }) {
  const [allUsers, setAllUsers]   = useState([]);
  const [members, setMembers]     = useState(project.members || []);
  const [selectedId, setSelected] = useState('');
  const [error, setError]         = useState('');

  useEffect(() => {
    api.get('/auth/users').then((r) => setAllUsers(r.data.users));
  }, []);

  const nonMembers = allUsers.filter((u) => !members.some((m) => m._id === u._id));

  const addMember = async () => {
    if (!selectedId) return;
    try {
      const r = await api.post(`/projects/${project._id}/members`, { userId: selectedId });
      setMembers(r.data.project.members);
      onUpdate(r.data.project);
      setSelected('');
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
  };

  const removeMember = async (userId) => {
    try {
      const r = await api.delete(`/projects/${project._id}/members/${userId}`);
      setMembers(r.data.project.members);
      onUpdate(r.data.project);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <p className="modal-title">Manage Members — {project.name}</p>
        {error && <p className="error-msg">{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <select value={selectedId} onChange={(e) => setSelected(e.target.value)} style={{ flex: 1 }}>
            <option value="">Select user to add...</option>
            {nonMembers.map((u) => (
              <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={addMember}>Add</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {members.map((m) => (
            <div key={m._id} className="flex-between" style={{ padding: '8px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.name}</span>
                <span className="text-muted" style={{ marginLeft: 8 }}>{m.email}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge badge-${m.role}`}>{m.role}</span>
                <button className="btn btn-danger btn-sm" onClick={() => removeMember(m._id)}>✕</button>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Projects Page ───────────────────────────────────────────────────────
export default function Projects() {
  const { user }    = useAuth();
  const isAdmin     = user?.role === 'admin';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null); // null | 'create' | {type:'edit'|'members', project}

  const load = () => {
    api.get('/projects')
      .then((r) => setProjects(r.data.projects))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = (saved, type) => {
    if (type === 'add') setProjects((p) => [saved, ...p]);
    else setProjects((p) => p.map((x) => x._id === saved._id ? saved : x));
  };

  const handleUpdate = (updated) => {
    setProjects((p) => p.map((x) => x._id === updated._id ? updated : x));
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    await api.delete(`/projects/${id}`);
    setProjects((p) => p.filter((x) => x._id !== id));
  };

  if (loading) return <div className="spinner" />;

  return (
    <>
      <div className="flex-between mb-24">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Projects</h1>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setModal('create')}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card empty-state">
          <p style={{ fontSize: '2rem' }}>📁</p>
          <p>No projects yet.{isAdmin && ' Create your first one!'}</p>
        </div>
      ) : (
        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))' }}>
          {projects.map((p) => (
            <div key={p._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="flex-between">
                <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{p.name}</h3>
                <span className={`badge badge-${p.status === 'active' ? 'in-progress' : p.status === 'completed' ? 'done' : 'pending'}`}>
                  {p.status}
                </span>
              </div>

              {p.description && (
                <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{p.description}</p>
              )}

              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 6 }}>
                  {p.members.length} member{p.members.length !== 1 ? 's' : ''}
                </p>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {p.members.slice(0, 5).map((m) => (
                    <div key={m._id} title={m.name} style={{
                      width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                    }}>
                      {m.name[0].toUpperCase()}
                    </div>
                  ))}
                  {p.members.length > 5 && (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--muted)' }}>
                      +{p.members.length - 5}
                    </div>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '0.73rem', color: 'var(--muted)' }}>
                Created by {p.createdBy?.name} · {new Date(p.createdAt).toLocaleDateString()}
              </p>

              {isAdmin && (
                <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'members', project: p })}>
                    👥 Members
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal({ type: 'edit', project: p })}>
                    ✏️ Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>
                    🗑 Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {modal === 'create' && (
        <ProjectModal onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal?.type === 'edit' && (
        <ProjectModal project={modal.project} onClose={() => setModal(null)} onSave={handleSave} />
      )}
      {modal?.type === 'members' && (
        <MembersModal project={modal.project} onClose={() => setModal(null)} onUpdate={handleUpdate} />
      )}
    </>
  );
}
