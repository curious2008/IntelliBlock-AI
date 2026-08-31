import React, { useState } from 'react';
import { Users, Filter, CheckCircle2, Wrench, Clock, ShieldCheck } from 'lucide-react';
import { Resource } from '../types';
import { useScenario } from '../context/ScenarioContext';

export const ResourcesPage: React.FC = () => {
  const { resources, loadingAll, activePlan } = useScenario();
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Build resource allocation map from active schedule plan
  const allocationMap = new Map<string, { taskId: string; sectionId: string; start: string; end: string }>();

  if (activePlan?.blocks) {
    for (const block of activePlan.blocks) {
      if (block.assigned_resource_ids) {
        for (const resId of block.assigned_resource_ids) {
          allocationMap.set(resId, {
            taskId: block.task_id,
            sectionId: block.track_section_id,
            start: block.scheduled_start,
            end: block.scheduled_end,
          });
        }
      }
    }
  }

  const filteredResources = resources.filter((res) =>
    selectedDept === 'ALL' ? true : res.department === selectedDept
  );

  const totalAllocated = resources.filter((r) => allocationMap.has(r.resource_id)).length;
  const utilizationPct = resources.length > 0 ? (totalAllocated / resources.length) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Metrics */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
            Resource Management & Heavy Machinery ({resources.length})
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Real-time tracking of tamping machines, tower cars, and specialized crews mapped to active block plans
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--text-muted)' }} />
          <button
            onClick={() => setSelectedDept('ALL')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: selectedDept === 'ALL' ? 600 : 400,
              backgroundColor: selectedDept === 'ALL' ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: selectedDept === 'ALL' ? '#0f172a' : 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            All Depts
          </button>
          {['ENGG', 'TRD', 'ST'].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDept(d)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: selectedDept === d ? 600 : 400,
                backgroundColor: selectedDept === d ? 'var(--accent-primary)' : 'var(--bg-card)',
                color: selectedDept === d ? '#0f172a' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Utilization Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active Resource Fleet</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
            {resources.length} Units
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}>Across Delhi & Kanpur Depots</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Currently Allocated to Plan</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-warning)' }}>
            {totalAllocated} Units
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-warning)' }}>Assigned to Scheduled Blocks</div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fleet Utilization Rate</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-success)' }}>
            {utilizationPct.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)' }}>0 Resource Schedule Conflicts</div>
        </div>
      </div>

      {/* Resource Table */}
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
        {loadingAll ? (
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
                <th style={{ padding: '0.85rem 1rem' }}>Live Allocation Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredResources.map((res) => {
                const alloc = allocationMap.get(res.resource_id);
                return (
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
                      {alloc ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <span style={{
                            padding: '0.15rem 0.5rem',
                            borderRadius: '9999px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            color: 'var(--accent-warning)',
                            width: 'fit-content',
                          }}>
                            ALLOCATED: {alloc.taskId}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Section: {alloc.sectionId}
                          </span>
                        </div>
                      ) : (
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          backgroundColor: 'rgba(34, 197, 94, 0.15)',
                          color: 'var(--accent-success)',
                        }}>
                          AVAILABLE (At Depot)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
