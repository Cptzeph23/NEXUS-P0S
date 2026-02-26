import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Inventory - Nexus POS' };

export default function InventoryPage() {
  return (
    <div className="p-8 text-surface-500">
      <h1 className="text-xl text-brand-400 mb-2">Inventory</h1>
      <p>Implementation in Phase 7</p>
    </div>
  );
}