import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function StatCard({ label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-num" style={{ color }}>{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const isOverdue = status === 'overdue';
  const cls = isOverdue ? 'badge-overdue' : `badge-${status}`;
  return <span className={`badge ${cls}`}>{status}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const { stats, recentTasks } = data;

  return (
    <>
      <div className="flex-between mb-24">
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>
            Hello, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-muted">Here's what's happening in your workspace.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="card-grid stat-grid mb-24">
        <StatCard label="Total Tasks"    value={stats.totalTasks}    color="var(--text)" />
        <StatCard label="Completed"      value={stats.completedTasks} color="var(--success)" />
        <StatCard label="In Progress"    value={stats.inProgressTasks} color="var(--info)" />
        <StatCard label="Pending"        value={stats.pendingTasks}  color="var(--warning)" />
        <StatCard label="Overdue"        value={stats.overdueTasks}  color="var(--danger)" />
        <StatCard label="Projects"       value={stats.totalProjects} color="var(--accent2)" />
        {stats.totalUsers !== null && (
          <StatCard label="Total Users" value={stats.totalUsers} color="var(--muted)" />
        )}
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <div className="flex-between mb-16">
          <p className="section-title" style={{ marginBottom: 0 }}>Recent Tasks</p>
          <Link to="/tasks" className="btn btn-ghost btn-sm">View all</Link>
        </div>

        {recentTasks.length === 0 ? (
          <p className="empty-state">No tasks yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((t) => {
                  const overdue = t.dueDate && t.status !== 'done' && new Date() > new Date(t.dueDate);
                  return (
                    <tr key={t._id}>
                      <td>{t.title}</td>
                      <td className="text-muted">{t.project?.name || '—'}</td>
                      <td>
                        <StatusBadge status={overdue ? 'overdue' : t.status} />
                      </td>
                      <td className="text-muted">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
