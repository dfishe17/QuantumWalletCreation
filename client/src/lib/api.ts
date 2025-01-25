interface WalletResponse {
  mnemonic: string;
  address: string;
}

export async function generateWallet(chain: string): Promise<WalletResponse> {
  const response = await fetch('/api/wallet/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chain }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate wallet');
  }

  return response.json();
}
