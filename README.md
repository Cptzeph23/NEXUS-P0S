# Nexus POS - Offline-First Point of Sale System

A modern, offline-first POS system built with Next.js, Supabase, and IndexedDB.

## Features

✅ **Offline-First**: Works completely offline, syncs when online
✅ **Multi-Branch**: Support for multiple locations
✅ **Real-time Sync**: Background synchronization
✅ **Customer Management**: Track customers and loyalty points
✅ **Inventory Tracking**: Real-time stock updates
✅ **Sales Analytics**: Dashboard with reports
✅ **Keyboard Shortcuts**: Fast cashier workflows
✅ **Barcode Scanner**: USB barcode scanner support
✅ **PWA**: Install as desktop/mobile app
✅ **Multi-Payment**: Cash, card, mobile payments
✅ **Receipt Printing**: Thermal printer support

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Offline Storage**: IndexedDB (Dexie)
- **State Management**: Zustand
- **PWA**: next-pwa

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd nexus-pos
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## Keyboard Shortcuts

- `F1` - Show shortcuts panel
- `F2` - Focus search
- `F3` - Clear cart
- `F9` - Open payment
- `Ctrl+D` - Dashboard
- `Ctrl+L` - Logout
- `Esc` - Close modals

## Default Credentials

**Branch Codes**: DT01, UT01, BK01

**Cashier PINs**:
- 0000 - Admin
- 1111 - John Rivera (Cashier)
- 2222 - Sarah Chen (Cashier)

## Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## License

MIT

## Support

For support, email support@nexuspos.com