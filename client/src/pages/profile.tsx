import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Plus, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { SiEthereum, SiBitcoin, SiSolana } from "react-icons/si";
import { useState } from "react";
import ReceiveModal from "@/components/quantum-wallet/receive-modal";

interface Wallet {
  id: number;
  address: string;
  chain: string;
  balance?: string;
}

export default function Profile() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [deletingWallets, setDeletingWallets] = useState<Set<number>>(new Set());

  const { data: wallets, isLoading } = useQuery<{ wallets: Wallet[] }>({
    queryKey: ['/api/wallet'],
    retry: false,
  });

  const deleteWallet = useMutation({
    mutationFn: async (walletId: number) => {
      const response = await fetch(`/api/wallet/${walletId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (_, walletId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      setDeletingWallets(prev => {
        const next = new Set(prev);
        next.delete(walletId);
        return next;
      });
      toast({
        title: "Success",
        description: "Wallet removed successfully",
      });
    },
    onError: (error, walletId) => {
      setDeletingWallets(prev => {
        const next = new Set(prev);
        next.delete(walletId);
        return next;
      });
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove wallet",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Success",
        description: "Address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy address",
        variant: "destructive",
      });
    }
  };

  const getChainIcon = (chain: string) => {
    switch (chain.toLowerCase()) {
      case 'ethereum':
        return <SiEthereum className="h-5 w-5" />;
      case 'bitcoin':
        return <SiBitcoin className="h-5 w-5" />;
      case 'solana':
        return <SiSolana className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const handleDelete = async (wallet: Wallet) => {
    const balance = parseFloat(wallet.balance || '0');

    if (balance > 0) {
      toast({
        title: "Cannot Delete Wallet",
        description: "Only wallets with zero balance can be deleted. Please transfer out any remaining funds first.",
        variant: "destructive",
      });
      return;
    }

    if (deletingWallets.has(wallet.id)) {
      return; // Prevent multiple delete attempts
    }

    try {
      setDeletingWallets(prev => new Set([...prev, wallet.id]));
      await deleteWallet.mutateAsync(wallet.id);
    } catch (error) {
      console.error('Error deleting wallet:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Your Quantum Wallets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Button
              onClick={() => setLocation('/wallet/new')}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Generate New Quantum Wallet
            </Button>

            <div className="grid gap-4">
              {wallets?.wallets.map((wallet) => (
                <Card key={wallet.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getChainIcon(wallet.chain)}
                      <div>
                        <p className="font-semibold capitalize">{wallet.chain}</p>
                        <p className="text-sm text-muted-foreground break-all">
                          {wallet.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="text-sm text-muted-foreground">
                        Balance: {wallet.balance || '0'}
                      </p>
                      <div className="flex gap-2">
                        <ReceiveModal 
                          address={wallet.address} 
                          chain={wallet.chain}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(wallet.address)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {(parseFloat(wallet.balance || '0') === 0) && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(wallet)}
                            className="text-red-500 hover:text-red-600"
                            disabled={deletingWallets.has(wallet.id)}
                          >
                            {deletingWallets.has(wallet.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {(!wallets?.wallets || wallets.wallets.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No wallets found. Generate your first quantum wallet!</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}