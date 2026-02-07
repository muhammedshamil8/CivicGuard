import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/contexts/WalletContext';

const features = [
  {
    icon: Shield,
    title: 'Anonymous',
    description: 'Your identity is protected by blockchain technology',
  },
  {
    icon: Lock,
    title: 'Secure',
    description: 'Reports are encrypted and tamper-proof',
  },
  {
    icon: Eye,
    title: 'Verified',
    description: 'Cryptographic verification ensures integrity',
  },
];

export function ConnectWalletScreen() {
  const { connect, isConnecting } = useWallet();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md mx-auto relative z-10"
      >
        {/* Logo/Shield */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-effect"
        >
          <Shield className="w-10 h-10 text-primary-foreground" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-3">
          <span className="gradient-text">CivicGuard</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          Kozhikode Anonymous Reporting
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Report drug-related activities safely and anonymously. Your identity is protected.
        </p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-secondary flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-medium mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Connect Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={connect}
            disabled={isConnecting}
            size="lg"
            className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity glow-effect"
          >
            <Wallet className="w-5 h-5 mr-2" />
            {isConnecting ? 'Connecting...' : 'Connect with MetaMask'}
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            By connecting, you agree to the anonymous reporting terms.
            No personal data is collected.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
