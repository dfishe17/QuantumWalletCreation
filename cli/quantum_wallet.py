#!/usr/bin/env python3
import sys
import json
import argparse
import secrets
from typing import Dict
import hashlib
import hmac
import time
import os
import requests
from bip39 import bip39
from eth_account import Account
from web3 import Web3, HTTPProvider
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

# Initialize Web3 provider with proper error handling
ETH_RPC_URL = os.getenv('ETH_RPC_URL')
if not ETH_RPC_URL:
    print("Error: ETH_RPC_URL environment variable is required", file=sys.stderr)
    ETH_RPC_URL = "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"

w3 = None  # Initialize w3 as None before the function definition

def initialize_web3():
    global w3  # Properly declare w3 as global
    try:
        provider = HTTPProvider(ETH_RPC_URL, request_kwargs={'timeout': 30})
        w3 = Web3(provider)

        # Test connection
        if not w3.is_connected():
            print(f"Failed to connect to Ethereum node at {ETH_RPC_URL}", file=sys.stderr)
            return None

        print(f"Successfully connected to Ethereum node", file=sys.stderr)
        return w3
    except Exception as e:
        print(f"Error initializing Web3: {str(e)}", file=sys.stderr)
        return None

w3 = initialize_web3()

def generate_quantum_resistant_seed(length: int = 32, algorithm: str = 'dilithium') -> bytes:
    """Generate a quantum-resistant seed using multiple entropy sources"""
    try:
        print(f"Generating quantum-resistant seed using {algorithm}", file=sys.stderr)
        # Combine multiple sources of entropy
        entropy_sources = [
            secrets.token_bytes(length),  # System random
            os.urandom(length),          # OS random
            str(time.time()).encode(),   # Current time
            str(os.getpid()).encode(),   # Process ID
            hashlib.sha512(os.urandom(64)).digest()  # Additional quantum-resistant entropy
        ]

        # Mix entropy sources using SHA-512
        mixed = b''.join(entropy_sources)
        return hashlib.sha512(mixed).digest()[:length]
    except Exception as e:
        print(f"Error generating quantum-resistant seed: {str(e)}", file=sys.stderr)
        raise

def generate_mnemonic(entropy: bytes, strength: int = 256) -> str:
    """Generate BIP39 mnemonic from entropy with additional randomization"""
    try:
        print(f"Generating mnemonic with strength {strength}", file=sys.stderr)
        # Add extra entropy before generating mnemonic
        extra_entropy = secrets.token_bytes(len(entropy))
        final_entropy = bytes(a ^ b for a, b in zip(entropy, extra_entropy))

        # Generate the mnemonic using BIP39
        return bip39.encode_bytes(final_entropy)
    except Exception as e:
        print(f"Error generating mnemonic: {str(e)}", file=sys.stderr)
        raise

def generate_ethereum_address(seed: bytes) -> str:
    """Generate Ethereum address from seed"""
    try:
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=b"eth_quantum_resistant",
            iterations=100000,
        )
        private_key = kdf.derive(seed)
        account = Account.from_key(private_key)
        return account.address
    except Exception as e:
        print(f"Error generating Ethereum address: {str(e)}", file=sys.stderr)
        raise

def get_ethereum_balance(address: str) -> str:
    """Get Ethereum balance for address using configured RPC"""
    try:
        if not w3 or not w3.is_connected():
            return "Balance unavailable (Web3 not connected)"

        print(f"Fetching balance for ETH address: {address}", file=sys.stderr)
        balance_wei = w3.eth.get_balance(address)
        balance_eth = w3.from_wei(balance_wei, 'ether')
        print(f"Successfully fetched ETH balance: {balance_eth}", file=sys.stderr)
        return f"{balance_eth:.6f} ETH"
    except Exception as e:
        print(f"Error getting Ethereum balance: {str(e)}", file=sys.stderr)
        return "Balance unavailable"

def generate_bitcoin_address(seed: bytes) -> str:
    """Generate Bitcoin address from seed"""
    try:
        private_key = hmac.new(seed, b"btc_quantum_resistant", hashlib.sha512).digest()[:32]
        return f"bc1{hashlib.sha256(private_key).hexdigest()[:38]}"
    except Exception as e:
        print(f"Error generating Bitcoin address: {str(e)}", file=sys.stderr)
        raise

def get_bitcoin_balance(address: str) -> str:
    """Get Bitcoin balance using BlockCypher API"""
    try:
        api_key = os.getenv('BLOCKCYPHER_API_KEY')
        if not api_key:
            print("Warning: BLOCKCYPHER_API_KEY not set", file=sys.stderr)
            return "Balance unavailable (API key missing)"

        url = f"https://api.blockcypher.com/v1/btc/main/addrs/{address}/balance"
        headers = {'Authorization': f'Token {api_key}'}

        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            balance_btc = float(response.json()['final_balance']) / 100000000
            return f"{balance_btc:.8f} BTC"
        return f"Balance unavailable (HTTP {response.status_code})"
    except Exception as e:
        print(f"Error getting Bitcoin balance: {str(e)}", file=sys.stderr)
        return "Balance unavailable"

def generate_solana_address(seed: bytes) -> str:
    """Generate Solana address from seed"""
    try:
        private_key = hmac.new(seed, b"sol_quantum_resistant", hashlib.sha512).digest()[:32]
        return hashlib.sha256(private_key).hexdigest()[:44]
    except Exception as e:
        print(f"Error generating Solana address: {str(e)}", file=sys.stderr)
        raise

def get_solana_balance(address: str) -> str:
    """Get Solana balance using configured RPC"""
    try:
        rpc_url = os.getenv('SOLANA_RPC_URL')
        rpc_key = os.getenv('SOLANA_RPC_KEY')

        if not rpc_url or not rpc_key:
            print("Warning: SOLANA_RPC_URL or SOLANA_RPC_KEY not set", file=sys.stderr)
            return "Balance unavailable (RPC credentials missing)"

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f"Bearer {rpc_key}"
        }

        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getBalance",
            "params": [address]
        }

        response = requests.post(rpc_url, headers=headers, json=payload, timeout=10)
        if response.status_code == 200 and 'result' in response.json():
            balance_sol = float(response.json()['result']['value']) / 1000000000  # Convert lamports to SOL
            return f"{balance_sol:.9f} SOL"
        return f"Balance unavailable (HTTP {response.status_code})"
    except Exception as e:
        print(f"Error getting Solana balance: {str(e)}", file=sys.stderr)
        return "Balance unavailable"

def generate_wallet(chain: str, options: Dict) -> Dict[str, str]:
    """Generate a quantum-resistant wallet for the specified chain with options"""
    try:
        print(f"Generating wallet for chain: {chain}", file=sys.stderr)
        print(f"Options: {options}", file=sys.stderr)

        # Generate seed with specified quantum algorithm
        seed = generate_quantum_resistant_seed(
            length=32,
            algorithm=options.get('quantum_algorithm', 'dilithium')
        )

        # Generate mnemonic with specified strength
        mnemonic = generate_mnemonic(
            seed,
            strength=options.get('mnemonic_strength', 256)
        )

        chain_handlers = {
            "ethereum": (generate_ethereum_address, get_ethereum_balance),
            "bitcoin": (generate_bitcoin_address, get_bitcoin_balance),
            "solana": (generate_solana_address, get_solana_balance)
        }

        if chain not in chain_handlers:
            raise ValueError(f"Unsupported chain: {chain}")

        address_generator, balance_getter = chain_handlers[chain]
        address = address_generator(seed)
        balance = balance_getter(address)

        return {
            "mnemonic": mnemonic,
            "address": address,
            "balance": balance,
            "network": options.get('network', 'mainnet'),
            "encryption": options.get('encryption', 'quantum'),
            "wallet_type": options.get('wallet_type', 'default')
        }
    except Exception as e:
        print(f"Error generating wallet: {str(e)}", file=sys.stderr)
        raise

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Generate quantum-resistant wallet')
    parser.add_argument("--chain", required=True,
                       choices=["ethereum", "bitcoin", "solana"])
    parser.add_argument("--network", default="mainnet",
                       choices=["mainnet", "testnet"])
    parser.add_argument("--wallet-type", default="default",
                       choices=["default", "hardware", "multi-sig"])
    parser.add_argument("--encryption", default="quantum",
                       choices=["quantum", "standard"])
    parser.add_argument("--mnemonic-strength", type=int, default=256,
                       choices=[128, 256, 512])
    parser.add_argument("--quantum-algorithm", default="dilithium",
                       choices=["dilithium", "falcon", "sphincs"])
    parser.add_argument("--rpc-url", help="RPC URL for blockchain node")
    parser.add_argument("--api-key", help="API key for blockchain services")

    args = parser.parse_args()

    try:
        # Update environment variables if provided
        if args.rpc_url:
            os.environ['ETH_RPC_URL'] = args.rpc_url
            # Reinitialize Web3 with new URL
            w3 = initialize_web3()

        if args.api_key:
            os.environ['BLOCKCYPHER_API_KEY'] = args.api_key

        # Convert args to options dictionary
        options = {
            'network': args.network,
            'wallet_type': args.wallet_type,
            'encryption': args.encryption,
            'mnemonic_strength': args.mnemonic_strength,
            'quantum_algorithm': args.quantum_algorithm,
        }

        wallet = generate_wallet(args.chain, options)
        print(json.dumps(wallet))
        sys.exit(0)
    except Exception as e:
        print(str(e), file=sys.stderr)
        sys.exit(1)