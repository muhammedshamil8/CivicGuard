import { motion } from 'framer-motion';
import { Shield, FileWarning, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWallet } from '@/contexts/WalletContext';

const stats = [
  { label: 'Reports Filed', value: '2,847', icon: FileWarning },
  { label: 'Cases Resolved', value: '1,203', icon: Shield },
  { label: 'Active Alerts', value: '18', icon: AlertTriangle },
];

export default function HomePage() {
  const { shortAddress } = useWallet();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 py-4 border-b border-border/50">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-sm">CivicGuard</h1>
              <p className="text-xs text-muted-foreground font-mono">{shortAddress}</p>
            </div>
          </div>
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="text-xl font-bold mb-2">
                  Make Kozhikode Safer
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Report suspicious drug activities anonymously. Your identity is protected by blockchain encryption.
                </p>
                <Link to="/report">
                  <Button className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 font-semibold">
                    <FileWarning className="w-4 h-4 mr-2" />
                    Submit Anonymous Report
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {stats.map((stat, index) => (
            <Card key={stat.label} className="glass-card">
              <CardContent className="p-4 text-center">
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">HOW IT WORKS</h3>
          <Card className="glass-card">
            <CardContent className="p-4 space-y-4">
              {[
                { step: '01', title: 'Submit Report', desc: 'Describe the activity with optional photo evidence' },
                { step: '02', title: 'Verification', desc: 'Cryptographic hash ensures report integrity' },
                { step: '03', title: 'Authority Alert', desc: 'Verified reports trigger instant alerts' },
              ].map((item, index) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{item.step}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Rewards teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/rewards">
            <Card className="glass-card border-primary/30 hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Earn Rewards</p>
                    <p className="text-xs text-muted-foreground">Get points for verified reports</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
