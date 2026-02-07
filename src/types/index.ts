export interface Complaint {
  id: string;
  wallet_address: string;
  description: string;
  location: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'rejected';
  is_blacklisted : boolean;
  rewardAmount?: number;
  rewardType?: 'positive' | 'negative';
  evidence?: string;
  category?: 'dealer' | 'user';
  image_url?: string;
  created_at?: string
}

export interface User {
  id: string;
  email?: string;
  role?: 'admin' | 'authority';
  name?: string;
  department?: string;
  createdAt?: string;
}