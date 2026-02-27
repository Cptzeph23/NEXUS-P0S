'use client';

import { useEffect, useState } from 'react';

export default function POSPage() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    fetch('/api/test-db')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDbStatus('connected');
          setProductCount(data.sampleProducts?.length || 0);
        } else {
          setDbStatus('error');
        }
      })
      .catch(() => setDbStatus('error'));
  }, []);

  return (
    <div className="flex items-center justify-center h-screen flex-col gap-4" style={{ backgroundColor: '#07070f', color: '#e8e0f8' }}>
      <div className="text-5xl font-bold" style={{ color: '#7c3aed' }}>NEXUS</div>
      <div className="text-2xl font-bold tracking-tight">Point of Sale</div>
      
      <div className="mt-8 flex flex-col gap-2 items-center">
        <div className="text-sm" style={{ color: '#6b6b8a' }}>Phase 2: Supabase Setup</div>
        
        <div className="flex items-center gap-2 mt-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{
              backgroundColor: dbStatus === 'connected' ? '#22c55e' : 
                              dbStatus === 'error' ? '#ef4444' : '#f59e0b'
            }}
          />
          <span style={{ color: dbStatus === 'connected' ? '#86efac' : '#6b6b8a' }}>
            {dbStatus === 'checking' && 'Checking database...'}
            {dbStatus === 'connected' && `Connected! ${productCount} products loaded`}
            {dbStatus === 'error' && 'Connection failed - check .env.local'}
          </span>
        </div>
      </div>
      
      <div className="text-xs mt-8" style={{ color: '#3a3a55' }}>
        Next: Phase 3 - Core Types & Offline Storage
      </div>
    </div>
  );
}