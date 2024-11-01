'use client';

import { Suspense } from 'react';
import { writeDaimoPayOrderID } from "@daimo/common";
import { hexToBigInt, keccak256 } from "viem";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getChainExplorerTxUrl } from "@daimo/contract";

interface StatusResponse {
  status: 'success' | 'pending' | 'error';
  message: string;
  submissionId: string;
  orderId?: string;
  transactionHash?: string;
  transactionUrl?: string;
}

function generateOrderId(idempotencyKey: string, apiKey: string) {
  const id = new TextEncoder().encode(`${apiKey}-${idempotencyKey}`);
  return hexToBigInt(keccak256(new Uint8Array(id)));
}

function StatusPageContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const submissionId = searchParams.get('submissionId');
      const apiKey = searchParams.get('apiKey');
      
      if (!submissionId || !apiKey) {
        setStatus({
          status: 'error',
          message: 'Missing submissionId or apiKey',
          submissionId: submissionId || '',
          orderId: ''
        });
        setLoading(false);
        return;
      }

      try {
        const orderId = writeDaimoPayOrderID(generateOrderId(submissionId, apiKey));
        const response = await fetch(`https://pay.daimo.com/api/payment/${orderId}`);
        const data = await response.json();

        if (response.status !== 200) {
          setStatus({
            status: 'error',
            message: 'Not Found',
            submissionId,
            orderId: orderId.toString()
          });
        } else {
          const mode = data.order.mode;
          const intentStatus = data.order.intentStatus;
          const transactionHash = mode === "hydrated" && intentStatus === "successful" 
            ? (data.order.destFastFinishTxHash || data.order.destClaimTxHash)
            : undefined;
          
          const transactionUrl = transactionHash && data.order.destFinalCallTokenAmount?.token.chainId
            ? getChainExplorerTxUrl(data.order.destFinalCallTokenAmount.token.chainId, transactionHash)
            : undefined;

          setStatus({
            status: mode === "hydrated" && intentStatus === "successful" ? 'success' : 'pending',
            message: mode === "hydrated" && intentStatus === "successful" ? 'Payment Successful' : 'Payment Pending',
            submissionId,
            orderId: orderId.toString(),
            transactionHash,
            transactionUrl
          });
        }
      } catch (error) {
        console.error('Error fetching status:', error);
        setStatus({
          status: 'error',
          message: 'Error checking payment status',
          submissionId: submissionId || '',
          orderId: ''
        });
      } finally {
        setLoading(false);
      }
    };

    const interval = setInterval(checkStatus, 5000); // Poll every 5 seconds
    checkStatus(); // Initial check

    return () => clearInterval(interval);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const statusColors = {
    success: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Status</h1>
        
        {status && (
          <>
            <div className={`rounded-md p-4 mb-4 ${statusColors[status.status]}`}>
              <p className="text-lg font-medium">{status.message}</p>
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="text-sm text-gray-600">
                <span className="block mb-1">Submission ID:</span>
                <span className="font-mono break-all">{status.submissionId}</span>
              </div>
              {status.orderId && (
                <div className="text-sm text-gray-600">
                  <span className="block mb-1">Daimo Pay ID:</span>
                  <span className="font-mono break-all">{status.orderId}</span>
                </div>
              )}
              {status.status === 'success' && status.transactionHash && (
                <div className="text-sm text-gray-600">
                  <span className="block mb-1">Transaction:</span>
                  {status.transactionUrl ? (
                    <a 
                      href={status.transactionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="font-mono text-blue-600 hover:text-blue-800 hover:underline break-all"
                    >
                      {status.transactionHash}
                    </a>
                  ) : (
                    <span className="font-mono break-all">{status.transactionHash}</span>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    }>
      <StatusPageContent />
    </Suspense>
  );
}