import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { apiClient } from '../services/api/client';
import { Corridor } from '../types';

export const CorridorsPage: React.FC = () => {
  const [corridors, setCorridors] = useState<Corridor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCorridors() {
      try {
        setLoading(true);
        const data = await apiClient.getCorridors();
        setCorridors(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCorridors();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
          Railway Corridors & Track Sections
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Spatial topology of rail lines, station bounds, and line speed restrictions
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ color: 'var(--text-muted)' }}>Loading corridor topology...</div>
        ) : (
          corridors.map((c) => (
            <div key={c.corridor_id} style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MapPin size={22} style={{ color: 'var(--accent-primary)' }} />
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>{c.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      ID: {c.corridor_id} | {c.start_location} ──► {c.end_location} ({c.total_length_km} km)
                    </div>
                  </div>
                </div>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  color: 'var(--accent-success)',
                }}>
                  {c.track_configuration}
                </span>
              </div>

              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                Constituent Track Sections
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                {c.sections_json.map((sec) => (
                  <div key={sec.section_id} style={{
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '0.85rem',
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f8fafc' }}>{sec.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Length: {sec.distance_km} km | Max Speed: {sec.max_permissible_speed_kmh} km/h
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
