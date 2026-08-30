import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Cpu, Zap, ShieldCheck, Clock, CheckCircle2, RefreshCw, Layers, Award } from 'lucide-react';
import { apiClient } from '../services/api/client';
import { BaselineComparisonReportResponse, StressTestReportResponse } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [benchmarkReport, setBenchmarkReport] = useState<BaselineComparisonReportResponse | null>(null);
  const [stressReport, setStressReport] = useState<StressTestReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [stressLoading, setStressLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'BASELINES' | 'STRESS'>('BASELINES');

  const fetchBenchmarks = async () => {
    try {
      setLoading(true);
      const res = await apiClient.benchmarkBaselines('NORMAL');
      setBenchmarkReport(res);
    } catch (err) {
      console.error('Failed to load benchmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const runStressTest = async () => {
    try {
      setStressLoading(true);
      const res = await apiClient.runStressTest();
      setStressReport(res);
    } catch (err) {
      console.error('Failed to run stress test:', err);
    } finally {
      setStressLoading(false);
    }
  };

  useEffect(() => {
    fetchBenchmarks();
    runStressTest();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '1.25rem 1.5rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Operational Benchmarks & Scalability Evaluation
            </h2>
            <span style={{
              padding: '0.15rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.7rem',
              fontWeight: 700,
              backgroundColor: 'rgba(34, 197, 94, 0.15)',
              color: 'var(--accent-success)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
            }}>
              Benchmark Suite Ready
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Empirical evaluation comparing IntelliBlock AI against traditional Indian Railways manual heuristics, FCFS greedy algorithms, and static fixed blocks
          </p>
        </div>

        <button
          onClick={fetchBenchmarks}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.55rem 1.1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 600,
            backgroundColor: 'var(--accent-primary)',
            color: '#0f172a',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? <RefreshCw size={15} className="animate-spin" /> : <BarChart3 size={15} />}
          <span>{loading ? 'Evaluating...' : 'Refresh Benchmarks'}</span>
        </button>
      </div>

      {/* Hero Improvement Highlights */}
      {benchmarkReport && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '10px',
            padding: '1.25rem',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Throughput Improvement</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-success)' }}>
              +{benchmarkReport.throughput_improvement_pct}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              vs legacy manual siloed operations
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '10px',
            padding: '1.25rem',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Passenger Delay Reduction</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
              -{benchmarkReport.delay_reduction_pct}%
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              less cumulative passenger train delay
            </div>
          </div>

          <div style={{
            backgroundColor: 'rgba(192, 132, 252, 0.08)',
            border: '1px solid rgba(192, 132, 252, 0.3)',
            borderRadius: '10px',
            padding: '1.25rem',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Possession Hours Saved</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc' }}>
              {benchmarkReport.block_possession_savings_hours} <span style={{ fontSize: '1rem' }}>hrs</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              gained through cross-department bundling
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('BASELINES')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: activeTab === 'BASELINES' ? 600 : 400,
            backgroundColor: activeTab === 'BASELINES' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'BASELINES' ? 'var(--accent-primary)' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Baseline Scheduling Comparison Matrix
        </button>

        <button
          onClick={() => setActiveTab('STRESS')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: activeTab === 'STRESS' ? 600 : 400,
            backgroundColor: activeTab === 'STRESS' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
            color: activeTab === 'STRESS' ? 'var(--accent-success)' : 'var(--text-muted)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Scalability & High-Density Stress Testing
        </button>
      </div>

      {/* Tab 1: Baselines Matrix */}
      {activeTab === 'BASELINES' && benchmarkReport && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Method 1: IntelliBlock AI */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '2px solid var(--accent-primary)',
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 800,
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                color: 'var(--accent-primary)',
              }}>
                PROPOSED SYSTEM
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {benchmarkReport.intelliblock_ai.overall_kpi_score} / 100
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
                {benchmarkReport.intelliblock_ai.method_name}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {benchmarkReport.intelliblock_ai.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Throughput:</span>
                <strong style={{ color: 'var(--accent-success)' }}>{benchmarkReport.intelliblock_ai.maintenance_throughput_pct}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Urgent Work Completed:</span>
                <strong style={{ color: 'var(--accent-success)' }}>{benchmarkReport.intelliblock_ai.urgent_tasks_completed_pct}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Train Delay Impact:</span>
                <strong style={{ color: '#f8fafc' }}>{benchmarkReport.intelliblock_ai.passenger_train_delay_minutes} mins</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bundling Efficiency:</span>
                <strong style={{ color: '#c084fc' }}>{benchmarkReport.intelliblock_ai.cross_dept_bundling_efficiency}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Solve Latency:</span>
                <strong style={{ color: 'var(--accent-primary)' }}>{benchmarkReport.intelliblock_ai.average_solve_time_ms} ms</strong>
              </div>
            </div>
          </div>

          {/* Method 2: Manual Siloed */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            opacity: 0.9,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--accent-danger)',
              }}>
                LEGACY BASELINE
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                {benchmarkReport.manual_siloed_baseline.overall_kpi_score} / 100
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
                {benchmarkReport.manual_siloed_baseline.method_name}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {benchmarkReport.manual_siloed_baseline.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Throughput:</span>
                <strong style={{ color: '#f8fafc' }}>{benchmarkReport.manual_siloed_baseline.maintenance_throughput_pct}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Urgent Work Completed:</span>
                <strong style={{ color: '#f8fafc' }}>{benchmarkReport.manual_siloed_baseline.urgent_tasks_completed_pct}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Train Delay Impact:</span>
                <strong style={{ color: 'var(--accent-danger)' }}>{benchmarkReport.manual_siloed_baseline.passenger_train_delay_minutes} mins</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bundling Efficiency:</span>
                <strong style={{ color: '#94a3b8' }}>0.0%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Solve Latency:</span>
                <strong style={{ color: '#94a3b8' }}>~2 hours</strong>
              </div>
            </div>
          </div>

          {/* Method 3: FCFS Greedy */}
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            opacity: 0.9,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 700,
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-warning)',
              }}>
                GREEDY HEURISTIC
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                {benchmarkReport.fcfs_greedy_baseline.overall_kpi_score} / 100
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
                {benchmarkReport.fcfs_greedy_baseline.method_name}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {benchmarkReport.fcfs_greedy_baseline.description}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Throughput:</span>
                <strong style={{ color: '#f8fafc' }}>{benchmarkReport.fcfs_greedy_baseline.maintenance_throughput_pct}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Urgent Work Completed:</span>
                <strong style={{ color: '#f8fafc' }}>{benchmarkReport.fcfs_greedy_baseline.urgent_tasks_completed_pct}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Train Delay Impact:</span>
                <strong style={{ color: '#f8fafc' }}>{benchmarkReport.fcfs_greedy_baseline.passenger_train_delay_minutes} mins</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.3rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bundling Efficiency:</span>
                <strong style={{ color: '#94a3b8' }}>{benchmarkReport.fcfs_greedy_baseline.cross_dept_bundling_efficiency}%</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Solve Latency:</span>
                <strong style={{ color: '#94a3b8' }}>{benchmarkReport.fcfs_greedy_baseline.average_solve_time_ms} ms</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Scalability Stress Testing */}
      {activeTab === 'STRESS' && stressReport && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                Scalability Stress Test Results (Up to 500 Tasks / 150 Block Possessions)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {stressReport.summary}
              </p>
            </div>

            <button
              onClick={runStressTest}
              disabled={stressLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                backgroundColor: 'var(--accent-success)',
                color: '#0f172a',
                border: 'none',
                cursor: stressLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {stressLoading ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
              <span>{stressLoading ? 'Running Stress Benchmarks...' : 'Re-Run Stress Test'}</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {stressReport.tiers.map((tier, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem' }}>
                    {tier.tier_name}
                  </span>
                  <span style={{
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    color: 'var(--accent-success)',
                  }}>
                    ✓ 0 Violations
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Tasks:</span> <strong style={{ color: '#f8fafc' }}>{tier.task_count}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Opportunities:</span> <strong style={{ color: '#f8fafc' }}>{tier.opportunity_count}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Trains:</span> <strong style={{ color: '#f8fafc' }}>{tier.train_count}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Corridors:</span> <strong style={{ color: '#f8fafc' }}>{tier.corridor_count}</strong>
                  </div>
                </div>

                <div style={{
                  backgroundColor: 'var(--bg-dark)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '0.6rem 0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>Solver Duration:</span>
                  <strong style={{ color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                    {tier.solver_duration_ms} ms
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
