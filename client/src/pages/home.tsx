import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import WalletForm from "@/components/quantum-wallet/wallet-form";
import SecurityWarning from "@/components/quantum-wallet/security-warning";
import Navbar from "@/components/layout/navbar";
import { Shield, Lock, Cpu, Download, Chrome, Code, Atom, Radio, Waves, Zap } from "lucide-react";
import { SiEthereum, SiBitcoin, SiSolana } from "react-icons/si";
import { Button } from "@/components/ui/button";

export default function Home() {
  const downloadExtension = () => {
    const link = document.createElement('a');
    link.href = '/extension.zip';
    link.download = 'quantum-wallet-extension.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <div className="w-full bg-black py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-48 h-48 mb-8 relative flex items-center justify-center bg-black/50 rounded-lg p-4">
              <img
                src="/quantum-portal-logo.png"
                alt="Quantum Portal Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Failed to load logo:', e);
                  // Don't fallback to SVG since user specifically wants PNG
                }}
                loading="eager"
                style={{ 
                  imageRendering: 'auto',
                  maxWidth: '100%',
                  maxHeight: '100%'
                }}
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                Quantum Portal
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Next-Generation Quantum-Enhanced Security
            </p>
            <p className="mt-4 text-gray-400 max-w-3xl">
              Generate cryptographically secure wallets using quantum entropy for unparalleled security
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-12">
          {/* Quantum Computing Section */}
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Quantum-Enhanced Security</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card className="border-2 border-black/10 hover:border-black transition-colors">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Radio className="w-12 h-12 mx-auto text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Quantum Entropy</h3>
                  <p className="text-sm text-muted-foreground">
                    Utilizes quantum mechanics for true random number generation
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-black/10 hover:border-black transition-colors">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Waves className="w-12 h-12 mx-auto text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Advanced Architecture</h3>
                  <p className="text-sm text-muted-foreground">
                    Leverages quantum properties for enhanced cryptographic security
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-black/10 hover:border-black transition-colors">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <Zap className="w-12 h-12 mx-auto text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Real-Time Security</h3>
                  <p className="text-sm text-muted-foreground">
                    Continuous quantum-enhanced protection for your digital assets
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Atom className="w-12 h-12" />}
              title="Quantum-Enhanced"
              description="True random number generation using quantum mechanical processes"
            />
            <FeatureCard
              icon={<Shield className="w-12 h-12" />}
              title="Post-Quantum Security"
              description="Combines quantum entropy with post-quantum cryptographic algorithms"
            />
            <FeatureCard
              icon={<Cpu className="w-12 h-12" />}
              title="Multi-Chain Support"
              description="Quantum-secured wallets for multiple blockchain networks"
            />
            <FeatureCard
              icon={<Lock className="w-12 h-12" />}
              title="Superior Entropy"
              description="Quantum-grade randomness for maximum security"
            />
          </div>

          {/* Supported Chains */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">Quantum-Enhanced Blockchains</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ChainCard
                icon={<SiEthereum className="w-12 h-12" />}
                name="Ethereum"
                description="Generate Ethereum wallets with quantum-enhanced security"
              />
              <ChainCard
                icon={<SiBitcoin className="w-12 h-12" />}
                name="Bitcoin"
                description="Bitcoin wallets secured by quantum randomness"
              />
              <ChainCard
                icon={<SiSolana className="w-12 h-12" />}
                name="Solana"
                description="High-speed Solana wallets with quantum-enhanced security"
              />
            </div>
          </div>

          {/* Technical Details */}
          <div className="max-w-3xl mx-auto">
            <Card className="border-2 border-black/10">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Quantum Processing Details
                </CardTitle>
                <CardDescription className="text-center">
                  How quantum mechanics enhances wallet security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-4">Quantum Security Process</h3>
                  <ul className="list-disc list-inside space-y-2 text-blue-800">
                    <li>Quantum uncertainty for true randomness</li>
                    <li>Quantum state superposition for enhanced entropy</li>
                    <li>Quantum entanglement properties for security</li>
                    <li>Real-time quantum measurements for seed generation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wallet Generator */}
          <div className="max-w-3xl mx-auto">
            <SecurityWarning />
            <Card className="mt-8 border-2 border-black">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-center">
                  Generate Quantum Wallet
                </CardTitle>
                <CardDescription className="text-center">
                  Create a new wallet secured by quantum entropy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WalletForm />
              </CardContent>
            </Card>
          </div>

          {/* Developer Access Section */}
          <div className="max-w-3xl mx-auto text-center">
            <Card className="border-2 border-black/10 hover:border-black transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Quantum API Integration
                </CardTitle>
                <CardDescription>
                  Access quantum-enhanced security through our API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <Code className="w-24 h-24 text-gray-600" />
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-4">Quantum API Features</h3>
                    <ul className="list-disc list-inside space-y-2 text-left text-blue-800">
                      <li>Direct access to quantum random generation</li>
                      <li>Real-time quantum entropy generation</li>
                      <li>Quantum-enhanced key derivation</li>
                      <li>Multi-chain quantum security integration</li>
                    </ul>
                  </div>
                  <Button
                    onClick={() => window.location.href = '/developer/auth'}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                  >
                    <Code className="w-5 h-5 mr-2" />
                    Access Quantum Developer Portal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Extension Section */}
          <div className="max-w-3xl mx-auto text-center">
            <Card className="border-2 border-black/10 hover:border-black transition-colors">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Quantum Wallet Extension
                </CardTitle>
                <CardDescription>
                  Access quantum-enhanced wallets directly from your browser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <Chrome className="w-24 h-24 text-gray-600" />
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-4">Installation Guide</h3>
                    <ol className="list-decimal list-inside space-y-4 text-left max-w-md mx-auto text-blue-800">
                      <li className="flex flex-col gap-2">
                        <span>Download the quantum-enhanced extension</span>
                        <Button
                          onClick={downloadExtension}
                          className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          Download Quantum Extension
                        </Button>
                      </li>
                      <li className="flex flex-col gap-1">
                        <span>Open Chrome Extensions</span>
                        <code className="bg-blue-100 px-2 py-1 rounded text-sm block">
                          chrome://extensions
                        </code>
                      </li>
                      <li className="flex flex-col gap-1">
                        <span>Enable Developer Mode</span>
                        <span className="text-sm text-blue-600">Toggle switch in top right</span>
                      </li>
                      <li className="flex flex-col gap-1">
                        <span>Load the Extension</span>
                        <span className="text-sm text-blue-600">Click "Load unpacked" and select the folder</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Features</h4>
                    <ul className="list-disc list-inside space-y-2 text-left text-yellow-700">
                      <li>Real-time quantum entropy generation</li>
                      <li>Quantum-enhanced key management</li>
                      <li>Multi-chain support with quantum security</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="border-2 border-black/10 hover:border-black transition-colors">
      <CardContent className="pt-6">
        <div className="mb-4 text-black">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function ChainCard({ icon, name, description }: { icon: React.ReactNode; name: string; description: string }) {
  return (
    <Card className="border-2 border-black/10 hover:border-black transition-colors">
      <CardContent className="pt-6">
        <div className="mb-4 text-black">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}