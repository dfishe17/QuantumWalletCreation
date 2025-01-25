import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import ChainSelect from "./chain-select";
import MnemonicDisplay from "./mnemonic-display";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface WalletFormValues {
  chain: string;
}

interface WalletData {
  mnemonic: string;
  address: string;
  balance: string;
  chain: string;
}

export default function WalletForm() {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<WalletFormValues>({
    defaultValues: {
      chain: "ethereum"
    }
  });

  const checkBalance = async (address: string, chain: string) => {
    try {
      setIsCheckingBalance(true);
      const response = await fetch('/api/wallet/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address, chain }),
        credentials: 'include'
      });

      if (!response.ok) {
        console.warn('Balance check failed, defaulting to 0');
        return '0';
      }

      const result = await response.json();
      return result.balance || '0';
    } catch (error) {
      console.error('Balance check error:', error);
      return '0';
    } finally {
      setIsCheckingBalance(false);
    }
  };

  const onSubmit = async (values: WalletFormValues) => {
    try {
      const response = await fetch('/api/wallet/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
        credentials: 'include'
      });

      if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please log in to generate quantum-enhanced wallets",
          variant: "destructive"
        });
        setLocation('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      if (result.success) {
        const balance = await checkBalance(result.address, values.chain);
        setWalletData({
          ...result,
          balance,
          chain: values.chain
        });
        toast({
          title: "Success",
          description: "Quantum-enhanced wallet generated successfully",
        });
      } else {
        throw new Error(result.message || 'Failed to generate wallet');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate wallet. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ChainSelect control={form.control} />

        <Button 
          type="submit" 
          className="w-full"
          disabled={form.formState.isSubmitting || isCheckingBalance}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Quantum-Enhanced Wallet...
            </>
          ) : isCheckingBalance ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking Balance...
            </>
          ) : (
            "Generate Wallet"
          )}
        </Button>

        {walletData && (
          <MnemonicDisplay 
            mnemonic={walletData.mnemonic}
            address={walletData.address}
            balance={walletData.balance}
            chain={walletData.chain}
          />
        )}
      </form>
    </Form>
  );
}