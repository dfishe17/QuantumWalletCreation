import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Shield } from "lucide-react";

export default function SecurityWarning() {
  return (
    <Alert>
      <Shield className="h-4 w-4" />
      <AlertTitle>Quantum-Resistant Security</AlertTitle>
      <AlertDescription>
        This wallet generator uses quantum-enhanced entropy and post-quantum cryptography to create wallets that are resistant to quantum computer attacks. 
        Always store your mnemonic phrase in a secure offline location.
      </AlertDescription>
    </Alert>
  );
}