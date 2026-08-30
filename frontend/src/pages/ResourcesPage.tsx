import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { apiClient } from '../services/api/client';
import { Resource } from '../types';

export const ResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRes() {
      try {
        setLoading(true);
        const data = await apiClient.getResources();
        setResources(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadRes();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
          Resource Management & Heavy Machinery
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Availability and depot tracking of tamping machines, tower cars, and specialized crews
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading resources...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Resource ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Resource Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Dept</th>
                <th style={{ padding: '0.85rem 1rem' }}>Capability</th>
                <th style={{ padding: '0.85rem 1rem' }}>Home Depot</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((res) => (
                <tr key={res.resource_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {res.resource_id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#f8fafc' }}>
                    {res.resource_name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {res.resource_type}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: res.department === 'ENGG' ? 'rgba(56, 189, 248, 0.2)' : res.department === 'ST' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: res.department === 'ENGG' ? 'var(--accent-primary)' : res.department === 'ST' ? 'var(--accent-success)' : 'var(--accent-warning)',
                    }}>
                      {res.department}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {res.capability}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {res.home_depot_location}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      color: 'var(--accent-success)',
                    }}>
                      {res.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
