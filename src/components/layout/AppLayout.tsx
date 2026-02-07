import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useWallet } from '@/contexts/WalletContext';
import { ConnectWalletScreen } from '@/components/auth/ConnectWalletScreen';

export function AppLayout() {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return <ConnectWalletScreen />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Outlet />
      <BottomNav />
    </div>
  );
}
