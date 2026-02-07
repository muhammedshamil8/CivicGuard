import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/createClient';
import { useAuth } from '../lib/useAuth';
import { Complaint } from '../types';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Search,
  Loader,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [Loding2, setLoding2] = useState(false);
  useEffect(() => {
    fetchComplaints();
  }, [filterStatus]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const fetchedComplaints = data as Complaint[];

      setComplaints(fetchedComplaints);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  // Check if complaint has an image parameter

  const handleConfirm = async (complaint: Complaint, rewardAmount: number) => {
    try {
      setLoding2(true);
      setProcessingId(complaint.id);

      const { error } = await supabase
        .from('reports')
        .update({
          status: 'confirmed',
          reward_type: 'positive',
          reward_amount: rewardAmount,
        })
        .eq('id', complaint.id);

      if (error) {
        throw error;
      }

      if (complaint.image_url) {
        // First, fetch the image from the URL
        // const imageResponse = await fetch(complaint.image_url);
        // const imageBlob = await imageResponse.blob();

        // Create FormData and append the blob as a file
        // const formData = new FormData();
        // formData.append('textData', complaint.description);
        // formData.append('url', complaint.image_url); // Add a filename

        const response = await fetch(
          'https://safespot-blockchain.vercel.app/upload-link-and-report',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              textData: complaint.description,
              url: complaint.image_url,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to upload image and report');
        }
      } else {
        // If no image, use the upload-report endpoint
        const response = await fetch(
          'https://safespot-blockchain.vercel.app/upload-report',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              textData: complaint.description,
            }),
          }
        );

        if (!response.ok) {
          throw new Error('Failed to upload report');
        }
      }

      toast.success('Complaint confirmed and reward assigned');
      fetchComplaints();
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error confirming complaint:', error);
      toast.error('Failed to confirm complaint');
    } finally {
      setProcessingId(null);
      setLoding2(false);
    }
  };

  const handleReject = async (complaint: Complaint) => {
    try {
      setProcessingId(complaint.id);

      const { error } = await supabase
        .from('reports')
        .update({
          status: 'rejected',
          reward_type: 'negative',
          reward_amount: 0,
        })
        .eq('id', complaint.id);

      if (error) {
        throw error;
      }

      toast.success('Complaint rejected');
      fetchComplaints();
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error rejecting complaint:', error);
      toast.error('Failed to reject complaint');
    } finally {
      setProcessingId(null);
    }
  };

  const handleBlacklist = async (complaint: Complaint) => {
    try {
      setProcessingId(complaint.id);

      const { error } = await supabase
        .from('reports')
        .update({
          is_blacklisted: true,
        })
        .eq('id', complaint.id);

      if (error) {
        throw error;
      }

      toast.success('Wallet address blacklisted');
      fetchComplaints();
      setSelectedComplaint(null);
    } catch (error) {
      console.error('Error blacklisting wallet:', error);
      toast.error('Failed to blacklist wallet');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (timestamp: string | number) => {
    const date =
      typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const filteredComplaints = complaints.filter(
    (complaint) =>
      complaint.wallet_address
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (complaint.description &&
        complaint.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (complaint.location &&
        complaint.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Complaints Management
      </h1>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
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

          <select
            className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Complaints</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <button
          onClick={fetchComplaints}
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
          {filteredComplaints.length > 0 ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredComplaints.map((complaint) => (
                  <li key={complaint.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {complaint.wallet_address}
                          </p>
                          {complaint.is_blacklisted && (
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Blacklisted
                            </span>
                          )}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              complaint.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : complaint.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {complaint.status.charAt(0).toUpperCase() +
                              complaint.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {complaint.category && (
                              <span className="mr-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                {complaint.category.charAt(0).toUpperCase() +
                                  complaint.category.slice(1)}
                              </span>
                            )}
                            {complaint.image_url && (
                              <img
                                src={complaint.image_url}
                                className="max-h-[160px] max-w-[160px] rounded"
                              />
                            )}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Reported on{' '}
                            <time
                              dateTime={new Date(
                                complaint?.created_at
                              ).toISOString()}
                            >
                              {formatDate(complaint?.created_at)}
                            </time>
                          </p>
                        </div>
                      </div>
                      {complaint.description && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            {complaint.description}
                          </p>
                        </div>
                      )}
                      {complaint.status === 'pending' && (
                        <div className="mt-3 flex space-x-2 justify-end">
                          <button
                            onClick={() => setSelectedComplaint(complaint)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={processingId === complaint.id}
                          >
                            Review
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
              <p className="text-gray-500">
                No complaints found matching your criteria
              </p>
            </div>
          )}
        </>
      )}

      {/* Complaint Review Modal */}
      {selectedComplaint && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Review Complaint
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Wallet Address: {selectedComplaint.wallet_address}
                      </p>
                      {selectedComplaint.description && (
                        <p className="mt-2 text-sm text-gray-500">
                          Description: {selectedComplaint.description}
                        </p>
                      )}
                      {selectedComplaint.image_url && (
                        <img
                          src={selectedComplaint.image_url}
                          className="mx-auto max-w-[200px] max-h-[200px]"
                        />
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        Date: {formatDate(selectedComplaint.created_at)}
                      </p>

                      {/* <div className="mt-4">
                        <label
                          htmlFor="rewardAmount"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Reward Amount (if confirming)
                        </label>
                        <input
                          type="number"
                          id="rewardAmount"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Enter reward amount"
                          defaultValue={10}
                          min={0}
                        />
                      </div> */}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm items-center"
                  onClick={() => {
                    const rewardInput = document.getElementById(
                      'rewardAmount'
                    ) as HTMLInputElement;
                    const rewardAmount = rewardInput
                      ? parseFloat(rewardInput.value)
                      : 10;
                    handleConfirm(selectedComplaint, rewardAmount);
                  }}
                  disabled={processingId === selectedComplaint.id}
                >
                  {!Loding2 ? (
                    <span className="flex items-center justify-center gap-1">
                      {' '}
                      <CheckCircle className="h-4 w-4 mr-1" /> Confirm
                    </span>
                  ) : (
                    <Loader className="animate-spin" />
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleReject(selectedComplaint)}
                  disabled={processingId === selectedComplaint.id}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleBlacklist(selectedComplaint)}
                  disabled={processingId === selectedComplaint.id}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Blacklist
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedComplaint(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
