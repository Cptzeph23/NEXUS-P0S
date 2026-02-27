import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'POS Terminal - Nexus POS',
};

export default function POSPage() {
  return (
    <div className="flex items-center justify-center h-screen flex-col gap-4 bg-surface-950 text-surface-50">
      <div className="text-5xl font-bold text-brand-600">NEXUS</div>
      <div className="text-2xl font-bold tracking-tight">Point of Sale</div>
      <div className="text-sm text-surface-500">Phase 1 Complete - Structure Ready</div>
      <div className="text-xs text-surface-700 mt-4">
        Next: Phase 2 - Supabase Setup
      </div>
    </div>
  );
}