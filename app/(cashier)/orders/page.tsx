import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Orders - Nexus POS' };

export default function OrdersPage() {
  return (
    <div className="p-8 text-surface-500">
      <h1 className="text-xl text-brand-400 mb-2">Orders</h1>
      <p>Implementation in Phase 5</p>
    </div>
  );
}