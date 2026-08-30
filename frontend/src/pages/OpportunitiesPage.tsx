import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { apiClient } from '../services/api/client';
import { BlockOpportunity } from '../types';

export const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<BlockOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOpp() {
      try {
        setLoading(true);
        const data = await apiClient.getBlockOpportunities();
        setOpportunities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadOpp();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
          Candidate Block Opportunities
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Discovered low-density traffic windows where track access can physically occur
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading opportunities...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Opportunity ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Section</th>
                <th style={{ padding: '0.85rem 1rem' }}>Window Start</th>
                <th style={{ padding: '0.85rem 1rem' }}>Window End</th>
                <th style={{ padding: '0.85rem 1rem' }}>Max Duration</th>
                <th style={{ padding: '0.85rem 1rem' }}>OHE Power Block</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((opp) => (
                <tr key={opp.opportunity_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {opp.opportunity_id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#f8fafc' }}>
                    {opp.track_section_id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {new Date(opp.window_start).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {new Date(opp.window_end).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--accent-warning)' }}>
                    {opp.maximum_duration_mins} mins
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: opp.is_power_block_available ? 'var(--accent-success)' : 'var(--text-muted)' }}>
                    {opp.is_power_block_available ? 'Available' : 'Unavailable'}
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
                      {opp.availability_status}
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
