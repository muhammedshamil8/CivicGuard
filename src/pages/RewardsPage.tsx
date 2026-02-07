import { motion } from 'framer-motion';
import { Gift, Star, Trophy, Zap, Lock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const rewards = [
  {
    id: 1,
    name: 'Community Guardian',
    description: 'Submit 5 verified reports',
    points: 500,
    progress: 60,
    current: 3,
    total: 5,
    icon: Star,
    unlocked: false,
  },
  {
    id: 2,
    name: 'First Reporter',
    description: 'Submit your first report',
    points: 100,
    progress: 100,
    current: 1,
    total: 1,
    icon: Zap,
    unlocked: true,
  },
  {
    id: 3,
    name: 'Vigilant Citizen',
    description: 'Submit 10 verified reports',
    points: 1000,
    progress: 30,
    current: 3,
    total: 10,
    icon: Trophy,
    unlocked: false,
  },
];

const leaderboard = [
  { rank: 1, address: '0x7a3B...4E2F', points: 2450, badge: '🏆' },
  { rank: 2, address: '0x9C1D...8A3B', points: 2180, badge: '🥈' },
  { rank: 3, address: '0x2E4F...1C9A', points: 1920, badge: '🥉' },
  { rank: 4, address: '0x5F8E...3D2C', points: 1650, badge: '' },
  { rank: 5, address: '0x1A2B...7E4D', points: 1420, badge: '' },
];

export default function RewardsPage() {
  const userPoints = 350;
  const userRank = 47;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 py-4 border-b border-border/50">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold">Rewards</h1>
          <p className="text-sm text-muted-foreground">Earn points for verified reports</p>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {/* Points Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-6 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Gift className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Points</p>
                    <p className="text-3xl font-bold gradient-text">{userPoints}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Community Rank</span>
                  <Badge variant="secondary">#{userRank}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">ACHIEVEMENTS</h3>
          <div className="space-y-3">
            {rewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + index * 0.05 }}
              >
                <Card className={`glass-card ${reward.unlocked ? 'border-primary/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        reward.unlocked 
                          ? 'bg-gradient-to-br from-primary to-accent' 
                          : 'bg-secondary'
                      }`}>
                        {reward.unlocked ? (
                          <reward.icon className="w-6 h-6 text-primary-foreground" />
                        ) : (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{reward.name}</h4>
                          <Badge variant={reward.unlocked ? "default" : "secondary"} className="text-xs">
                            +{reward.points} pts
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{reward.description}</p>
                        <div className="flex items-center gap-2">
                          <Progress value={reward.progress} className="h-1.5 flex-1" />
                          <span className="text-xs text-muted-foreground">
                            {reward.current}/{reward.total}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">TOP REPORTERS</h3>
          <Card className="glass-card">
            <CardContent className="p-4 space-y-3">
              {leaderboard.map((user, index) => (
                <div 
                  key={user.rank}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    index < 3 ? 'bg-secondary/50' : ''
                  }`}
                >
                  <span className="w-6 text-center text-sm font-medium">
                    {user.badge || user.rank}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-mono">{user.address}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">{user.points} pts</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Info */}
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">How to earn points?</p>
              <p className="text-xs text-muted-foreground">
                Submit accurate reports that get verified by authorities
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
