import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import type { UserResponse, DeveloperKeysResponse } from "@/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  Key,
  RotateCw,
  Copy,
  X,
  Loader2,
  Code,
  Shield,
  Network
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {ScrollArea} from "@/components/ui/scroll-area";

const API_DOCS = [
  {
    endpoint: "/api/v1/wallet/generate",
    method: "POST",
    description: "Generate a new quantum-resistant wallet with advanced configuration",
    parameters: {
      chain: "string (required) - Blockchain to generate wallet for (ethereum, bitcoin, or solana)",
      network: "string (optional) - Network type ('mainnet' or 'testnet', default: 'mainnet')",
      walletType: "string (optional) - Wallet type ('default', 'hardware', or 'multi-sig', default: 'default')",
      encryption: "string (optional) - Encryption type ('quantum' or 'standard', default: 'quantum')",
      derivationPath: "string (optional) - Custom derivation path for the wallet",
      mnemonicStrength: "number (optional) - Mnemonic strength (128-512 bits, default: 256)",
      quantumAlgorithm: "string (optional) - Quantum algorithm ('dilithium', 'falcon', or 'sphincs', default: 'dilithium')"
    },
    response: {
      success: true,
      address: "Generated wallet address",
      mnemonic: "Backup phrase for wallet recovery",
      chain: "Selected blockchain",
      network: "Selected network",
      walletType: "Type of wallet generated",
      encryption: "Encryption method used",
      quantumAlgorithm: "Quantum algorithm used"
    }
  },
  {
    endpoint: "/api/v1/transaction/send",
    method: "POST",
    description: "Send a transaction from one address to another",
    parameters: {
      chain: "string (required) - Blockchain to send on",
      fromAddress: "string (required) - Sender's wallet address",
      toAddress: "string (required) - Recipient's wallet address",
      amount: "string (required) - Amount to send",
      network: "string (optional) - Network type ('mainnet' or 'testnet', default: 'mainnet')"
    },
    response: {
      success: true,
      transactionHash: "Transaction hash",
      chain: "Blockchain used",
      network: "Network used",
      from: "Sender address",
      to: "Recipient address",
      amount: "Transaction amount",
      status: "Transaction status"
    }
  },
  {
    endpoint: "/api/v1/address/receive",
    method: "POST",
    description: "Get receive address information with QR code",
    parameters: {
      chain: "string (required) - Blockchain to receive on",
      walletId: "number (required) - ID of the wallet",
      network: "string (optional) - Network type ('mainnet' or 'testnet', default: 'mainnet')"
    },
    response: {
      success: true,
      address: "Wallet address for receiving funds",
      chain: "Blockchain",
      network: "Network",
      qrCode: "URL to QR code image"
    }
  }
];

const WALLET_TYPES = [
  { value: 'default', label: 'Standard Wallet', description: 'Single-signature wallet with quantum protection' },
  { value: 'hardware', label: 'Hardware Wallet', description: 'Compatible with hardware security modules' },
  { value: 'multi-sig', label: 'Multi-Signature', description: 'Requires multiple signatures for transactions' }
];

const QUANTUM_ALGORITHMS = [
  { value: 'dilithium', label: 'CRYSTALS-Dilithium', description: 'Lattice-based digital signature scheme' },
  { value: 'falcon', label: 'FALCON', description: 'Fast-Fourier lattice-based compact signatures' },
  { value: 'sphincs', label: 'SPHINCS+', description: 'Stateless hash-based signature scheme' }
];

export default function DeveloperDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState("");
  const [, setLocation] = useLocation();
  const [walletConfig, setWalletConfig] = useState({
    chain: 'ethereum',
    network: 'mainnet',
    walletType: 'default',
    encryption: 'quantum',
    mnemonicStrength: 256,
    quantumAlgorithm: 'dilithium'
  });

  const { data: user, isLoading: isUserLoading } = useQuery<UserResponse>({
    queryKey: ['/api/user'],
    retry: false,
  });

  const { data: apiResponse, isLoading: isKeysLoading } = useQuery<DeveloperKeysResponse>({
    queryKey: ['/api/developer/keys'],
    enabled: !!user?.isDeveloper,
  });

  const keys = apiResponse?.keys || [];

  const enableDeveloperAccount = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/developer/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: "Personal",
          website: "example.com",
          useCase: "Testing"
        }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Success",
        description: "Developer account enabled",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createKey = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/developer/keys'] });
      setNewKeyName("");
      toast({
        title: "Success",
        description: "New API key created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disableKey = useMutation({
    mutationFn: async (keyId: number) => {
      const res = await fetch(`/api/developer/keys/${keyId}/disable`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/developer/keys'] });
      toast({
        title: "Success",
        description: "API key disabled",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "API key copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for your API key",
        variant: "destructive",
      });
      return;
    }
    createKey.mutate(newKeyName);
  };

  const WalletConfigurationSection = () => {
    const { toast } = useToast();

    const handleTestConfiguration = async () => {
      try {
        const response = await fetch('/api/developer/test-wallet-config', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(walletConfig),
          credentials: 'include'
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        const result = await response.json();

        toast({
          title: "Configuration Test Successful",
          description: "Wallet generated successfully with provided parameters",
        });

        // Create and show test results
        const resultDisplay = document.createElement('div');
        resultDisplay.id = 'test-result';
        resultDisplay.className = 'mt-4 p-4 bg-green-50 border border-green-200 rounded-lg';
        resultDisplay.innerHTML = `
          <h4 class="font-semibold text-green-900 mb-2">Test Results</h4>
          <pre class="bg-white p-2 rounded text-sm overflow-x-auto">
            ${JSON.stringify(result.testResults, null, 2)}
          </pre>
        `;

        // Remove previous test results if they exist
        const existingResult = document.getElementById('test-result');
        if (existingResult) {
          existingResult.remove();
        }

        // Append new results
        const cardContent = document.querySelector('.space-y-6');
        if (cardContent) {
          cardContent.appendChild(resultDisplay);
        }

      } catch (error) {
        console.error('Configuration test error:', error);
        toast({
          title: "Configuration Test Failed",
          description: error instanceof Error ? error.message : "Failed to test configuration",
          variant: "destructive"
        });
      }
    };

    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Wallet Configuration Testing
          </CardTitle>
          <CardDescription>
            Test different wallet configurations with quantum parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScrollArea className="w-full rounded-md border">
            <div className="flex space-x-6 p-4" style={{ minWidth: '1200px', width: '100%' }}>
              <div className="space-y-2" style={{ width: '200px' }}>
                <Label>Blockchain</Label>
                <Select
                  value={walletConfig.chain}
                  onValueChange={(value) => setWalletConfig(prev => ({ ...prev, chain: value }))}
                >
                  <SelectTrigger style={{ width: '200px' }}>
                    <SelectValue placeholder="Select blockchain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="bitcoin">Bitcoin</SelectItem>
                    <SelectItem value="solana">Solana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2" style={{ width: '200px' }}>
                <Label>Network</Label>
                <Select
                  value={walletConfig.network}
                  onValueChange={(value) => setWalletConfig(prev => ({ ...prev, network: value }))}
                >
                  <SelectTrigger style={{ width: '200px' }}>
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mainnet">Mainnet</SelectItem>
                    <SelectItem value="testnet">Testnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2" style={{ width: '200px' }}>
                <Label>Wallet Type</Label>
                <Select
                  value={walletConfig.walletType}
                  onValueChange={(value) => setWalletConfig(prev => ({ ...prev, walletType: value }))}
                >
                  <SelectTrigger style={{ width: '200px' }}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WALLET_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span>{type.label}</span>
                          <span className="text-xs text-muted-foreground">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2" style={{ width: '200px' }}>
                <Label>Quantum Algorithm</Label>
                <Select
                  value={walletConfig.quantumAlgorithm}
                  onValueChange={(value) => setWalletConfig(prev => ({ ...prev, quantumAlgorithm: value }))}
                >
                  <SelectTrigger style={{ width: '200px' }}>
                    <SelectValue placeholder="Select algorithm" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUANTUM_ALGORITHMS.map(algo => (
                      <SelectItem key={algo.value} value={algo.value}>
                        <div className="flex flex-col">
                          <span>{algo.label}</span>
                          <span className="text-xs text-muted-foreground">{algo.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2" style={{ width: '200px' }}>
                <Label>Mnemonic Strength</Label>
                <Select
                  value={String(walletConfig.mnemonicStrength)}
                  onValueChange={(value) => setWalletConfig(prev => ({ ...prev, mnemonicStrength: Number(value) }))}
                >
                  <SelectTrigger style={{ width: '200px' }}>
                    <SelectValue placeholder="Select strength" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128 bits (12 words)</SelectItem>
                    <SelectItem value="256">256 bits (24 words)</SelectItem>
                    <SelectItem value="512">512 bits (48 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2" style={{ width: '200px' }}>
                <Label>Encryption</Label>
                <Select
                  value={walletConfig.encryption}
                  onValueChange={(value) => setWalletConfig(prev => ({ ...prev, encryption: value }))}
                >
                  <SelectTrigger style={{ width: '200px' }}>
                    <SelectValue placeholder="Select encryption" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quantum">Quantum-Enhanced</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </ScrollArea>

          <Button
            className="w-full"
            onClick={handleTestConfiguration}
          >
            <Shield className="mr-2 h-4 w-4" />
            Test Configuration
          </Button>

          <Alert className="mt-4">
            <Network className="h-4 w-4" />
            <AlertTitle>Network Configuration</AlertTitle>
            <AlertDescription>
              <div className="mt-2 space-y-2">
                <p>Current configuration:</p>
                <pre className="bg-muted p-2 rounded-lg text-sm">
                  {JSON.stringify(walletConfig, null, 2)}
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Developer Access Required</CardTitle>
            <CardDescription>
              Please register as a developer to access the developer dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => setLocation("/developer/auth")}
            >
              Register as Developer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user.isDeveloper) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Enable Developer Access</CardTitle>
            <CardDescription>
              Enable developer access to create API keys and integrate Quantum Wallet into your applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => enableDeveloperAccount.mutate()}
              disabled={enableDeveloperAccount.isPending}
            >
              {enableDeveloperAccount.isPending ? (
                <RotateCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Key className="mr-2 h-4 w-4" />
              )}
              Enable Developer Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-6 w-6" />
              API Documentation
            </CardTitle>
            <CardDescription>
              Integrate quantum-resistant wallets into your applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {API_DOCS.map((endpoint, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{endpoint.method}</Badge>
                      <code className="text-sm font-mono">{endpoint.endpoint}</code>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Description</h4>
                          <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Parameters</h4>
                          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                            {JSON.stringify(endpoint.parameters, null, 2)}
                          </pre>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Example Response</h4>
                          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                            {JSON.stringify(endpoint.response, null, 2)}
                          </pre>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Example Usage</h4>
                          <pre className="bg-blue-100 p-4 rounded-lg text-sm text-blue-900 overflow-x-auto">
                            {`fetch('${endpoint.endpoint}', {
                              method: '${endpoint.method}',
                              headers: {
                                'Content-Type': 'application/json',
                                'x-api-key': 'YOUR_API_KEY'
                              },
                              body: JSON.stringify(${JSON.stringify(endpoint.parameters, null, 2)})
                            })`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
        <WalletConfigurationSection />
        <Card>
          <CardHeader>
            <CardTitle>Generate New API Key</CardTitle>
            <CardDescription>
              Create an API key to integrate Quantum Wallet into your applications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="keyName">API Key Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="keyName"
                    placeholder="e.g., Production API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    disabled={createKey.isPending}
                  />
                  <Button
                    type="submit"
                    disabled={!newKeyName.trim() || createKey.isPending}
                  >
                    {createKey.isPending ? (
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Key className="mr-2 h-4 w-4" />
                    )}
                    Generate
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Your API keys carry many privileges, keep them secure! Do not share your API keys in publicly accessible areas.
                </AlertDescription>
              </Alert>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your API Keys</CardTitle>
            <CardDescription>
              Manage your existing API keys
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isKeysLoading ? (
              <div className="flex justify-center py-4">
                <RotateCw className="h-6 w-6 animate-spin" />
              </div>
            ) : keys.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No API keys yet. Generate your first key above.
              </div>
            ) : (
              <div className="space-y-4">
                {keys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{key.name}</div>
                      <div className="text-sm text-muted-foreground font-mono">
                        {key.apiKey}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={key.enabled ? "default" : "destructive"}>
                          {key.enabled ? "Active" : "Disabled"}
                        </Badge>
                        {key.lastUsed && (
                          <Badge variant="outline">
                            Last used: {new Date(key.lastUsed).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(key.apiKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {key.enabled && (
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => disableKey.mutate(key.id)}
                          disabled={disableKey.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}