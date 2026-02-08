import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/createClient';
import { Complaint } from '../types';
import { AlertTriangle, Search, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Blacklist: React.FC = () => {
  const [blacklistedWallets, setBlacklistedWallets] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBlacklistedWallets();
  }, []);

  const fetchBlacklistedWallets = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('is_blacklisted', true);
      
      if (error) {
        throw error;
      }
      
      const blacklisted = data as Complaint[];
      
      setBlacklistedWallets(blacklisted);
    } catch (error) {
      console.error("Error fetching blacklisted wallets:", error);
      toast.error("Failed to load blacklisted wallets");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromBlacklist = async (complaint: Complaint) => {
    try {
      setProcessingId(complaint.id);
      
      const { error } = await supabase
        .from('reports')
        .update({ is_blacklisted: false })
        .eq('id', complaint.id);
      
      if (error) {
        throw error;
      }
      
      toast.success('Wallet address removed from blacklist');
      fetchBlacklistedWallets();
    } catch (error) {
      console.error("Error removing from blacklist:", error);
      toast.error("Failed to remove from blacklist");
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (timestamp: string | number) => {
    const date = typeof timestamp === 'number' 
      ? new Date(timestamp) 
      : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const filteredWallets = blacklistedWallets.filter(wallet => 
    wallet.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-400 mb-6">Blacklisted Wallets</h1>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md py-2"
            placeholder="Search wallet address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button
          onClick={fetchBlacklistedWallets}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {filteredWallets.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredWallets.map((wallet) => (
                  <li key={wallet.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {wallet.wallet_address}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Blacklisted
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {wallet.status && (
                              <span className={`mr-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${wallet.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                  wallet.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'}`}>
                                {wallet.status.charAt(0).toUpperCase() + wallet.status.slice(1)}
                              </span>
                            )}
                            {wallet.category && (
                              <span className="mr-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                {wallet.category.charAt(0).toUpperCase() + wallet.category.slice(1)}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            {/* Reported on <time dateTime={new Date(wallet.createdAt).toISOString()}>
                              {formatDate(wallet.createdAt)}
                            </time> */}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button
                          onClick={() => handleRemoveFromBlacklist(wallet)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          disabled={processingId === wallet.id}
                        >
                          {processingId === wallet.id ? (
                            <span className="flex items-center">
                              <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                              Processing...
                            </span>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Remove from Blacklist
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
              <p className="text-gray-500">No blacklisted wallets found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Blacklist;