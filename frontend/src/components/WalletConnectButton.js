import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export default function WalletConnectButton() {
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

    return (
        <div className="flex items-center gap-4">
            {connected && publicKey && (
                <div className="text-sm text-gray-600">
                    <div className="font-semibold">{balance.toFixed(4)} SOL</div>
                    <div className="text-xs text-gray-500">
                        {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                    </div>
                </div>
            )}
            <button
                onClick={() => setVisible(true)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                    connected
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
            >
                {connected ? 'Wallet Connected' : 'Connect Wallet'}
            </button>
        </div>
    );
}

