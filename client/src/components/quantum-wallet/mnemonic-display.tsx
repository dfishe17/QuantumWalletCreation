import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Wallet } from "lucide-react";
import { useState } from "react";

interface MnemonicDisplayProps {
  mnemonic: string;
  address: string;
  balance: string;
}

export default function MnemonicDisplay({ mnemonic, address, balance }: MnemonicDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertDescription>
          Store this mnemonic phrase safely. It cannot be recovered if lost!
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Mnemonic Phrase</span>
                <button
                  onClick={() => copyToClipboard(mnemonic)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {mnemonic.split(" ").map((word, i) => (
                  <Badge 
                    key={i} 
                    variant="outline" 
                    className="justify-center font-mono"
                  >
                    {`${i + 1}. ${word}`}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-2">Wallet Address</div>
              <code className="block p-2 bg-muted rounded-md text-sm break-all font-mono">
                {address}
              </code>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Wallet size={16} />
                <span>Balance</span>
              </div>
              <div className="p-2 bg-muted rounded-md text-sm font-mono">
                {balance}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}