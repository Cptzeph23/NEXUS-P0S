import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Login - Nexus POS' };

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-surface-950">
      <div className="text-surface-500">
        <h1 className="text-xl text-brand-400 mb-2">Login</h1>
        <p>Implementation in Phase 4</p>
      </div>
    </div>
  );
}