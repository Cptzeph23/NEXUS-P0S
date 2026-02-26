import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard - Nexus POS' };

export default function DashboardPage() {
  return (
    <div className="p-8 text-surface-500">
      <h1 className="text-xl text-brand-400 mb-2">Admin Dashboard</h1>
      <p>Implementation in Phase 8</p>
    </div>
  );
}