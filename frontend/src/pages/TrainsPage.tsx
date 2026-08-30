import React, { useEffect, useState } from 'react';
import { Train, AlertCircle } from 'lucide-react';
import { apiClient } from '../services/api/client';
import { TrainMovement } from '../types';

export const TrainsPage: React.FC = () => {
  const [trains, setTrains] = useState<TrainMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTrains() {
      try {
        setLoading(true);
        const data = await apiClient.getTrains();
        setTrains(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load train movements');
      } finally {
        setLoading(false);
      }
    }
    loadTrains();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
          Train Movement Timetables & Freight Forecasts
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Passenger train timetables and forecasted goods train movements along monitored corridors
        </p>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)', borderRadius: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading trains...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-sidebar)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.85rem 1rem' }}>Train ID</th>
                <th style={{ padding: '0.85rem 1rem' }}>Train Name / Number</th>
                <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Direction</th>
                <th style={{ padding: '0.85rem 1rem' }}>Entry Time</th>
                <th style={{ padding: '0.85rem 1rem' }}>Exit Time</th>
                <th style={{ padding: '0.85rem 1rem' }}>Priority Rank</th>
                <th style={{ padding: '0.85rem 1rem' }}>Live Delay</th>
              </tr>
            </thead>
            <tbody>
              {trains.map((trn) => (
                <tr key={trn.train_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-primary)' }}>
                    {trn.train_id}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#f8fafc' }}>
                    {trn.train_name} ({trn.train_number})
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {trn.train_type}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: trn.direction === 'UP' ? 'var(--accent-primary)' : 'var(--accent-warning)' }}>
                    {trn.direction} Line
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {new Date(trn.scheduled_entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                    {new Date(trn.scheduled_exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                    Cat {trn.priority_category}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: trn.delay_minutes > 0 ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
                    {trn.delay_minutes > 0 ? `+${trn.delay_minutes} mins` : 'On Time'}
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
