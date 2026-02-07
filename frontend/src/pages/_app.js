import "@/styles/globals.css";
import { useMemo, useEffect, useState } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

// Dynamic import for wallet adapters (SSR compatibility)
let PhantomWalletAdapter, CoinbaseWalletAdapter;

if (typeof window !== 'undefined') {
  try {
    // Only import on client side to avoid SSR issues
    const walletAdapters = require('@solana/wallet-adapter-wallets');
    PhantomWalletAdapter = walletAdapters.PhantomWalletAdapter;
    CoinbaseWalletAdapter = walletAdapters.CoinbaseWalletAdapter;
  } catch (error) {
    console.error('Error loading wallet adapters:', error);
  }
}

export default function App({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => 'https://api.devnet.solana.com', []);

  // Only create wallets on client side (SSR compatibility)
  const wallets = useMemo(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    return [
      new PhantomWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ];
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering wallet providers until mounted
  if (!mounted) {
    return (
      <div>
        <Component {...pageProps} />
      </div>
    );
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
