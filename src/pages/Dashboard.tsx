import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/createClient';
import { useAuth } from '../lib/useAuth';
import { Complaint } from '../types';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    rejected: 0,
    blacklisted: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('reports').select('*');

        const complaints = data as Complaint[];

        const pendingCount = complaints.filter(
          (c) => c.status === 'pending'
        ).length;
        const confirmedCount = complaints.filter(
          (c) => c.status === 'confirmed'
        ).length;
        const rejectedCount = complaints.filter(
          (c) => c.status === 'rejected'
        ).length;
        const blacklistedCount = complaints.filter(
          (c) => c.is_blacklisted 
        ).length;

        setStats({
          total: complaints.length,
          pending: pendingCount,
          confirmed: confirmedCount,
          rejected: rejectedCount,
          blacklisted: blacklistedCount,
        });

        // Get 5 most recent complaints
        const sortedComplaints = [...complaints].sort(
          (a, b) => b.timestamp - a.timestamp
        );
        setRecentComplaints(sortedComplaints.slice(0, 5));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Complaints
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.confirmed}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                  <XCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Blacklisted
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.blacklisted}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Complaints
              </h3>
            </div>

            {recentComplaints.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Wallet Address
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      {/* <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Category
                      </th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentComplaints.map((complaint) => (
                      <tr key={complaint.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {complaint?.wallet_address?.substring(0, 8)}...
                          {complaint?.wallet_address?.substring(
                            complaint?.wallet_address.length - 6
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(complaint?.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              complaint?.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : complaint?.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {complaint?.status?.charAt(0).toUpperCase() +
                              complaint?.status?.slice(1)}
                          </span>
                        </td>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {complaint?.category
                            ? complaint?.category?.charAt(0).toUpperCase() +
                              complaint?.category?.slice(1)
                            : 'N/A'}
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-6 py-4 text-center text-sm text-gray-500">
                No complaints found
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
