import { QRCodeSVG } from "qrcode.react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SiEthereum, SiBitcoin, SiSolana } from "react-icons/si";

interface ReceiveModalProps {
  address: string;
  chain: string;
}

export default function ReceiveModal({ address, chain }: ReceiveModalProps) {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
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

  const getChainIcon = () => {
    switch (chain.toLowerCase()) {
      case 'ethereum':
        return <SiEthereum className="h-8 w-8 text-blue-600" />;
      case 'bitcoin':
        return <SiBitcoin className="h-8 w-8 text-orange-500" />;
      case 'solana':
        return <SiSolana className="h-8 w-8 text-purple-600" />;
      default:
        return null;
    }
  };

  const getChainInstructions = () => {
    switch (chain.toLowerCase()) {
      case 'ethereum':
        return "Send ETH or any ERC-20 tokens to this address from any Ethereum wallet or exchange.";
      case 'bitcoin':
        return "Send BTC to this address from any Bitcoin wallet or exchange.";
      case 'solana':
        return "Send SOL or any SPL tokens to this address from any Solana wallet or exchange.";
      default:
        return "";
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Receive {chain}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getChainIcon()}
            <span>Receive {chain}</span>
          </DialogTitle>
          <DialogDescription>
            {getChainInstructions()}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 p-4">
          <QRCodeSVG
            value={address}
            size={200}
            level="H"
            includeMargin
            className="bg-white p-2 rounded"
          />
          <div className="flex items-center gap-2">
            <code className="bg-muted px-4 py-2 rounded text-sm break-all">
              {address}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
