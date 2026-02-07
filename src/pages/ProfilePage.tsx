import { motion } from 'framer-motion';
import { Copy, ExternalLink, LogOut, Shield, FileWarning, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';

const recentReports = [
  {
    id: 1,
    type: 'Drug Dealing',
    location: 'Beach Road Area',
    date: '2024-01-15',
    status: 'verified',
  },
  {
    id: 2,
    type: 'Suspicious Activity',
    location: 'Market Junction',
    date: '2024-01-12',
    status: 'pending',
  },
  {
    id: 3,
    type: 'Public Consumption',
    location: 'Railway Station',
    date: '2024-01-08',
    status: 'verified',
  },
];

export default function ProfilePage() {
  const { address, shortAddress, disconnect } = useWallet();
  const { toast } = useToast();

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-success/20 text-success border-0">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 py-4 border-b border-border/50">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold">Profile</h1>
          <p className="text-sm text-muted-foreground">Your anonymous identity</p>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Wallet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-effect">
                    <Shield className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Anonymous Identity</p>
                    <p className="text-lg font-semibold font-mono">{shortAddress}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={copyAddress}
                    className="flex-1"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Address
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">3</p>
              <p className="text-xs text-muted-foreground">Reports</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">2</p>
              <p className="text-xs text-muted-foreground">Verified</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">350</p>
              <p className="text-xs text-muted-foreground">Points</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">YOUR REPORTS</h3>
          <div className="space-y-3">
            {recentReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
              >
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileWarning className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">{report.type}</span>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{report.location}</p>
                    <p className="text-xs text-muted-foreground">{report.date}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Disconnect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button 
            variant="outline" 
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={disconnect}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect Wallet
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
