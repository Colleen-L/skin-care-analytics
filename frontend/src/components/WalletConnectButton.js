import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function WalletConnectButton({ size = 'default' }) {
    const { publicKey, connected } = useWallet();
    const { setVisible } = useWalletModal();
    const { connection } = useConnection();
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        if (publicKey && connected) {
            const fetchBalance = async () => {
                try {
                    const balance = await connection.getBalance(publicKey);
                    setBalance(balance / LAMPORTS_PER_SOL);
                } catch (error) {
                    console.error('Error fetching balance:', error);
                    setBalance(0);
                }
            };
            fetchBalance();
            const interval = setInterval(fetchBalance, 5000);
            return () => clearInterval(interval);
        } else {
            setBalance(0);
        }
    }, [publicKey, connected, connection]);

    const isLarge = size === 'lg';
    return (
        <div className={`flex items-center ${isLarge ? 'gap-4' : 'gap-3'}`}>
            {connected && publicKey && (
                <div className={isLarge ? 'text-base' : 'text-sm'} style={{ color: '#8B4367' }}>
                    <div className="font-semibold">{balance.toFixed(4)} SOL</div>
                    <div className={isLarge ? 'text-sm' : 'text-xs'} style={{ color: '#A67B8B' }}>
                        {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                    </div>
                </div>
            )}
            <button
                onClick={() => setVisible(true)}
                className={`rounded-xl font-semibold transition-colors ${isLarge ? 'px-6 py-3 text-base' : 'px-4 py-2'}`}
                style={
                    connected
                        ? { background: '#D4E8D4', color: '#5A8B5A' }
                        : { background: 'linear-gradient(135deg, #B8C6E6 0%, #A8B5D5 100%)', color: '#fff' }
                }
            >
                {connected ? 'Wallet Connected' : 'Connect Wallet'}
            </button>
        </div>
    );
}

