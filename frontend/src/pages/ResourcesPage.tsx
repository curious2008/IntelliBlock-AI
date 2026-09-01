import React, { useState } from 'react';
import { ArrowRight, Users } from 'lucide-react';
import { useScenario } from '../context/ScenarioContext';
import { Resource } from '../types';
import { ResourceDetailDrawer } from '../components/drawers/ResourceDetailDrawer';

export const ResourcesPage: React.FC = () => {
  const { resources } = useScenario();
  const [selected, setSelected]     = useState<Resource | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dept, setDept]             = useState('ALL');

  const depts = ['ALL', ...Array.from(new Set(resources.map(r => r.department)))];
  const filtered = dept === 'ALL' ? resources : resources.filter(r => r.department === dept);

  // Resource uses `status` field (not availability_status)
  const available   = resources.filter(r => r.status === 'AVAILABLE').length;
  const allocated   = resources.filter(r => r.status === 'ALLOCATED').length;
  const unavailable = resources.filter(r => r.status === 'UNAVAILABLE').length;
  const utilPct     = resources.length > 0 ? Math.round((allocated / resources.length) * 100) : 0;

  const deptStats = ['ENGG', 'TRD', 'ST'].map(d => {
    const dRes = resources.filter(r => r.department === d);
    return {
      dept: d,
      total:     dRes.length,
      available: dRes.filter(r => r.status === 'AVAILABLE').length,
      allocated: dRes.filter(r => r.status === 'ALLOCATED').length,
    };
  });

  const getStatusBadge = (status: string) =>
    status === 'AVAILABLE' ? 'badge-green'
    : status === 'ALLOCATED' ? 'badge-amber'
    : 'badge-red';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Summary Strip */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap', boxShadow: 'var(--shadow-xs)' }}>
        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginRight: '1rem' }}>Resource Fleet</span>
        {[
          { label: 'Total Units', value: resources.length,  color: 'var(--text-primary)' },
          { label: 'Available',   value: available,         color: 'var(--accent-success)' },
          { label: 'Allocated',   value: allocated,         color: 'var(--accent-warning)' },
          { label: 'Unavailable', value: unavailable,       color: 'var(--accent-danger)' },
          { label: 'Utilization', value: `${utilPct}%`,     color: 'var(--accent-ai)' },
        ].map((item, i) => (
          <React.Fragment key={item.label}>
            {i > 0 && <span style={{ width: '1px', height: '28px', background: 'var(--border-color)', margin: '0 0.85rem' }} />}
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{item.label}</div>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Department Utilization Bars */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={14} color="var(--accent-primary)" /> Departmental Resource Utilization
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {deptStats.map(ds => (
            <div key={ds.dept} style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ds.dept}</span>
                  <span className="badge badge-gray">{ds.total} units</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {ds.total > 0 ? Math.round((ds.allocated / ds.total) * 100) : 0}% allocated
                </span>
              </div>
              <div className="progress-track" style={{ height: '8px' }}>
                <div className="progress-fill" style={{
                  width: `${ds.total > 0 ? (ds.available / ds.total) * 100 : 0}%`,
                  backgroundColor: 'var(--accent-success)',
                }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '4px', fontSize: '0.65rem', color: 'var(--text-faint)' }}>
                <span><span style={{ color: 'var(--accent-success)', fontWeight: 700 }}>{ds.available}</span> available</span>
                <span><span style={{ color: 'var(--accent-warning)', fontWeight: 700 }}>{ds.allocated}</span> allocated</span>
                <span><span style={{ color: 'var(--accent-danger)', fontWeight: 700 }}>{ds.total - ds.available - ds.allocated}</span> other</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'var(--bg-subtle)', padding: '0.2rem', borderRadius: '5px' }}>
          {depts.map(d => (
            <button key={d} onClick={() => setDept(d)} style={{
              padding: '0.3rem 0.75rem', borderRadius: '4px', border: 'none', fontSize: '0.75rem', fontWeight: 600,
              backgroundColor: dept === d ? 'var(--accent-primary)' : 'transparent',
              color: dept === d ? 'var(--text-on-accent)' : 'var(--text-muted)',
            }}>{d}</button>
          ))}
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} resources</span>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="ops-table">
            <thead>
              <tr>
                <th>Resource ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Department</th>
                <th>Capability</th>
                <th>Status</th>
                <th>Home Depot</th>
                <th>Current Location</th>
                <th style={{ textAlign: 'right' }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(res => (
                <tr key={res.resource_id} style={{ cursor: 'pointer' }}
                  onClick={() => { setSelected(res); setDrawerOpen(true); }}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.73rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {res.resource_id}
                  </td>
                  <td style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {res.resource_name}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{res.resource_type}</td>
                  <td>
                    <span className={`badge ${res.department === 'ENGG' ? 'badge-blue' : res.department === 'TRD' ? 'badge-amber' : 'badge-green'}`}>
                      {res.department}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {res.capability || '—'}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(res.status)}`}>{res.status}</span>
                  </td>
                  <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {res.home_depot_location || '—'}
                  </td>
                  <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {res.current_location_section_id || '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost" style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem' }}
                      onClick={e => { e.stopPropagation(); setSelected(res); setDrawerOpen(true); }}>
                      Inspect <ArrowRight size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ResourceDetailDrawer resource={selected} isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};
