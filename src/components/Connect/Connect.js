import React, { useState, useEffect } from 'react';
import ReactModal from 'react-modal';

const Connect = ({ isDropdown = false }) => {
    const [connectedWallet, setConnectedWallet] = useState(null);
    const [walletAddress, setWalletAddress] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [solBalance, setSolBalance] = useState(null);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);

    useEffect(() => {
        // Check for existing connections to maintain connection across app navigation
        const savedWallet = localStorage.getItem('connectedWallet');
        const savedAddress = localStorage.getItem('walletAddress');
        if (savedWallet && savedAddress) {
            setConnectedWallet(savedWallet);
            setWalletAddress(savedAddress);
        }
        
        // Set up wallet event listeners
        const setupWalletListeners = () => {
            // Phantom wallet listeners
            if (window.solana && window.solana.isPhantom) {
                window.solana.on('accountChanged', (publicKey) => {
                    if (publicKey) {
                        setWalletAddress(publicKey.toString());
                        // Update localStorage to maintain connection state
                        localStorage.setItem('walletAddress', publicKey.toString());
                    } else {
                        disconnectWallet();
                    }
                });
                
                window.solana.on('disconnect', () => {
                    disconnectWallet();
                });
            }
            
            // Add similar listeners for other wallets as needed
        };
        
        setupWalletListeners();
        
        // Cleanup function
        return () => {
            // Remove event listeners if needed
            if (window.solana && window.solana.isPhantom) {
                // Phantom doesn't provide a removeListener method, but we handle cleanup in disconnect
            }
        };
    }, []);

    // Fetch SOL balance
    const fetchSolBalance = async (address) => {
        if (!address) return;
        
        setIsLoadingBalance(true);
        try {
            // Using a public RPC endpoint - you might want to use your own
            const response = await fetch('https://api.mainnet-beta.solana.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'getBalance',
                    params: [address]
                })
            });
            
            const data = await response.json();
            if (data.result) {
                // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
                const solAmount = data.result.value / 1000000000;
                setSolBalance(solAmount);
            }
        } catch (error) {
            console.error('Error fetching SOL balance:', error);
            setSolBalance(null);
        } finally {
            setIsLoadingBalance(false);
        }
    };

    // Fetch balance when wallet is connected
    useEffect(() => {
        if (connectedWallet && walletAddress) {
            fetchSolBalance(walletAddress);
        } else {
            setSolBalance(null);
        }
    }, [connectedWallet, walletAddress]);

    const wallets = [
        {
            name: 'Phantom',
            type: 'phantom',
            icon: '/ph.png',
            isInstalled: () => window.solana && window.solana.isPhantom,
            downloadUrl: 'https://phantom.app/',
            description: 'Most popular Solana wallet',
            color: 'from-purple-500 to-purple-600'
        },
        {
            name: 'Solflare',
            type: 'solflare',
            icon: '/sol.png',
            isInstalled: () => window.solflare || (window.solana && window.solana.isSolflare),
            downloadUrl: 'https://solflare.com/',
            description: 'Advanced features & staking',
            color: 'from-orange-500 to-yellow-500'
        },
        {
            name: 'Backpack',
            type: 'backpack',
            icon: '/bp.png',
            isInstalled: () => window.backpack || window.xnft,
            downloadUrl: 'https://backpack.app/',
            description: 'Modern crypto wallet',
            color: 'from-gray-800 to-black'
        },
        {
            name: 'Coinbase Wallet',
            type: 'coinbase',
            icon: '/cb.jpg',
            isInstalled: () => window.coinbaseSolana || window.coinbaseWalletExtension || (window.solana && window.solana.isCoinbaseWallet),
            downloadUrl: 'https://www.coinbase.com/wallet',
            description: 'Trusted & secure',
            color: 'from-blue-500 to-blue-600'
        },
    ];

    // Helper function to check if popup was blocked
    const checkPopupBlocked = () => {
        // Simple check for popup blocker
        const popup = window.open('', '_blank', 'width=1,height=1');
        if (popup) {
            popup.close();
            return false;
        }
        return true;
    };

    // Connect wallet logic
    const connectWallet = async (type) => {
        setIsConnecting(true);
        setError('');
        
        // Find the wallet configuration
        const walletConfig = wallets.find(w => w.type === type);
        if (!walletConfig) {
            setError('Unsupported wallet type');
            setIsConnecting(false);
            return;
        }
        
        // Check if wallet extension is installed
        if (!walletConfig.isInstalled()) {
            setError(`${walletConfig.name} wallet extension not found. Please install it from ${walletConfig.downloadUrl} and refresh the page.`);
            setIsConnecting(false);
            return;
        }
        
        // Check for popup blockers
        if (checkPopupBlocked()) {
            setError('Please allow popups for this site and try again. Wallets need popups to show login/signup screens.');
            setIsConnecting(false);
            return;
        }
        
        try {
            let address = '';
            
            // Force disconnect first to ensure fresh authentication prompt
            try {
                switch (type) {
                    case 'phantom':
                        if (window.solana && window.solana.isConnected) {
                            await window.solana.disconnect();
                        }
                        break;
                    case 'solflare':
                        const solflareProvider = window.solflare || window.solana;
                        if (solflareProvider && solflareProvider.isConnected) {
                            await solflareProvider.disconnect();
                        }
                        break;
                    case 'backpack':
                        const backpackProvider = window.backpack || window.xnft?.solana;
                        if (backpackProvider && backpackProvider.isConnected) {
                            await backpackProvider.disconnect();
                        }
                        break;
                    case 'coinbase':
                        const coinbaseProvider = window.coinbaseSolana || window.coinbaseWalletExtension || 
                                               (window.solana?.isCoinbaseWallet ? window.solana : null);
                        if (coinbaseProvider && coinbaseProvider.isConnected) {
                            await coinbaseProvider.disconnect();
                        }
                        break;
                }
            } catch (disconnectError) {
                // Ignore disconnect errors, proceed with connection
                console.log('Disconnect error (proceeding):', disconnectError);
            }
            
            // Small delay to ensure disconnect is processed
            await new Promise(resolve => setTimeout(resolve, 500));
            
            switch (type) {
                case 'phantom':
                    // Always require user authentication - force wallet unlock/PIN prompt
                    const phantomResponse = await window.solana.connect({ onlyIfTrusted: false });
                    // Additional check to ensure user interaction
                    if (!phantomResponse.publicKey) {
                        throw new Error('Connection cancelled or failed');
                    }
                    address = phantomResponse.publicKey.toString();
                    break;
                    
                case 'solflare':
                    // Use the best available provider for Solflare
                    const solflareProvider = window.solflare || window.solana;
                    const solflareResponse = await solflareProvider.connect({ onlyIfTrusted: false });
                    if (!solflareResponse.publicKey) {
                        throw new Error('Connection cancelled or failed');
                    }
                    address = solflareResponse.publicKey.toString();
                    break;
                    
                case 'backpack':
                    // Backpack may use xnft provider
                    const backpackProvider = window.backpack || window.xnft?.solana;
                    const backpackResponse = await backpackProvider.connect({ onlyIfTrusted: false });
                    if (!backpackResponse.publicKey) {
                        throw new Error('Connection cancelled or failed');
                    }
                    address = backpackResponse.publicKey.toString();
                    break;
                    
                case 'coinbase':
                    // Use the best available Coinbase provider
                    const coinbaseProvider = window.coinbaseSolana || window.coinbaseWalletExtension || 
                                           (window.solana?.isCoinbaseWallet ? window.solana : null);
                    const coinbaseResponse = await coinbaseProvider.connect({ onlyIfTrusted: false });
                    if (!coinbaseResponse.publicKey) {
                        throw new Error('Connection cancelled or failed');
                    }
                    address = coinbaseResponse.publicKey.toString();
                    break;
                    address = coinbaseResponse.publicKey.toString();
                    break;
                    
                case 'walletconnect':
                    // For WalletConnect, create a simple mock connection for now
                    // In production, you'd integrate with @walletconnect/client
                    setError('WalletConnect integration coming soon. Please use a browser extension wallet for now.');
                    setIsConnecting(false);
                    return;
                    
                default:
                    setError('Unsupported wallet type');
                    setIsConnecting(false);
                    return;
            }
            
            setConnectedWallet(type);
            setWalletAddress(address);
            // Save to localStorage to maintain connection across app navigation
            localStorage.setItem('connectedWallet', type);
            localStorage.setItem('walletAddress', address);
            setIsOpen(false);
            setShowModal(false);
            
            // Fetch balance after connection
            fetchSolBalance(address);
                        
        } catch (err) {
            console.error('Wallet connection error:', err);
            if (err.code === 4001 || err.message?.includes('rejected') || err.message?.includes('denied')) {
                setError('Connection cancelled by user. No worries - you can try again anytime!');
            } else if (err.message?.includes('not installed') || err.message?.includes('not found')) {
                setError(`Wallet not found. Please install the wallet and refresh the page.`);
            } else if (err.message) {
                setError(`Connection failed: ${err.message}`);
            } else {
                setError('Connection failed. Please try again or use a different wallet.');
            }
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = async () => {
        try {
            // Disconnect from the specific wallet
            switch (connectedWallet) {
                case 'phantom':
                    if (window.solana && window.solana.isPhantom) {
                        await window.solana.disconnect();
                    }
                    break;
                case 'solflare':
                    const solflareProvider = window.solflare || window.solana;
                    if (solflareProvider && solflareProvider.disconnect) {
                        await solflareProvider.disconnect();
                    }
                    break;
                case 'backpack':
                    const backpackProvider = window.backpack || window.xnft?.solana;
                    if (backpackProvider && backpackProvider.disconnect) {
                        await backpackProvider.disconnect();
                    }
                    break;
                case 'coinbase':
                    const coinbaseProvider = window.coinbaseSolana || window.coinbaseWalletExtension || 
                                           (window.solana?.isCoinbaseWallet ? window.solana : null);
                    if (coinbaseProvider && coinbaseProvider.disconnect) {
                        await coinbaseProvider.disconnect();
                    }
                    break;
            }
        } catch (err) {
            console.error('Error disconnecting wallet:', err);
            // Don't show error to user for disconnect - just proceed with cleanup
        }
        
        // Clear local state and storage
        setConnectedWallet(null);
        setWalletAddress('');
        setSolBalance(null);
        localStorage.removeItem('connectedWallet');
        localStorage.removeItem('walletAddress');
        setIsOpen(false);
        setShowModal(false);
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Only show Connect if logged in
    const isLoggedIn = !!localStorage.getItem('authToken');
    if (!isLoggedIn) return null;

    if (isDropdown) {
        return (
            <>
                <div className="relative">
                    <button 
                        className='buttonn mbtns transform hover:scale-105 transition-all duration-200'
                        onClick={() => {
                            if (connectedWallet) {
                                setIsOpen(!isOpen);
                            } else {
                                setShowModal(true);
                            }
                        }}
                    >
                        <span className="hoverEffect">
                            <div></div>
                        </span>
                        {connectedWallet ? `${formatAddress(walletAddress)}` : 'Connect Wallet'}
                    </button>
                    
                    {/* Connected Wallet Dropdown */}
                    {connectedWallet && isOpen && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Connected Wallet</h3>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                                            <img 
                                                src={wallets.find(w => w.type === connectedWallet)?.icon} 
                                                alt={connectedWallet}
                                                className="w-6 h-6 rounded-full"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <span className="text-white text-xs font-bold hidden capitalize">
                                                {connectedWallet.charAt(0)}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-800 dark:text-gray-200 capitalize">
                                                {connectedWallet}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                                                {formatAddress(walletAddress)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">SOL Balance</span>
                                            <div className="text-right">
                                                {isLoadingBalance ? (
                                                    <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-4 w-16 rounded"></div>
                                                ) : solBalance !== null ? (
                                                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                                                        {solBalance.toFixed(4)} SOL
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">--</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <button
                                    onClick={disconnectWallet}
                                    className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>Disconnect</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* PancakeSwap-style Wallet Selection Modal */}
                <ReactModal
                    isOpen={showModal}
                    onRequestClose={() => setShowModal(false)}
                    contentLabel="Wallet Selection Modal"
                    overlayClassName="modal-overlay"
                    className="modal-content"
                    style={{
                        overlay: {
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                            zIndex: 50,
                            backdropFilter: 'blur(8px)'
                        },
                        content: {
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            right: 'auto',
                            bottom: 'auto',
                            marginRight: '-50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'transparent',
                            overflow: 'auto',
                            WebkitOverflowScrolling: 'touch',
                            borderRadius: '0px',
                            outline: 'none',
                            border: 'none',
                            padding: '20px',
                            zIndex: 51
                        }
                    }}
                >
                    <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Connect</h2>
                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Choose how you want to connect your Solana wallet
                                </p>
                        </div>

                        {/* Wallet List */}
                        <div className="p-6">
                            <div className="space-y-3">
                                {wallets.map((wallet, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => wallet.isInstalled() ? connectWallet(wallet.type) : window.open(wallet.downloadUrl, '_blank')}
                                        disabled={isConnecting}
                                        className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 border-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                            wallet.isInstalled() 
                                                ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                                                : 'border-orange-200 dark:border-orange-700 hover:border-orange-300 dark:hover:border-orange-600 bg-orange-50 dark:bg-orange-900/20'
                                        }`}
                                    >
                                        <div className="flex items-center flex-1">
                                            <div className="w-12 h-12 rounded-full mr-4 flex items-center justify-center bg-gradient-to-r ${wallet.color} shadow-lg">
                                                <img 
                                                    src={wallet.icon} 
                                                    alt={wallet.name}
                                                    className="w-8 h-8 rounded-full"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'block';
                                                    }}
                                                    />
                                                    <span className="text-white text-lg font-bold hidden">
                                                        {wallet.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="text-left flex-1">
                                                    <div className="font-semibold text-gray-900 dark:text-white flex items-center">
                                                        {wallet.name}
                                                        {wallet.isInstalled() && (
                                                            <div className="ml-2 w-2 h-2 bg-green-500 rounded-full"></div>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {wallet.isInstalled() ? wallet.description : 'Not installed - Click to install'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-3">
                                                {wallet.isInstalled() ? (
                                                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                            </div>

                            {/* Loading State */}
                            {isConnecting && (
                                <div className="mt-6 text-center">
                                    <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-blue-700 dark:text-blue-300 font-medium">Connecting...</span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        Check your wallet for connection prompt
                                    </p>
                                </div>
                            )}

                            {/* Error State */}
                            {error && (
                                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <div className="flex">
                                        <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ReactModal>
            </>
        );
    }

    // Default non-dropdown view for standalone usage
    return (
        <div className="flex flex-col items-center">
            {!connectedWallet ? (
                <div className="w-full">
                    <label htmlFor="wallet-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Select Solana Wallet</label>
                    <select
                        id="wallet-select"
                        className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
                        onChange={e => connectWallet(e.target.value)}
                        defaultValue=""
                        disabled={isConnecting}
                    >
                        <option value="" disabled>Select a wallet...</option>
                        {wallets.map((wallet, idx) => (
                            <option key={idx} value={wallet.type}>{wallet.name}</option>
                        ))}
                    </select>
                    {error && <div className="mt-2 text-sm text-red-600 dark:text-red-300">{error}</div>}
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="mb-2 text-green-700 dark:text-green-300 font-medium">Connected: {connectedWallet}</div>
                    <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">{formatAddress(walletAddress)}</div>
                    <button
                        onClick={disconnectWallet}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
};

export default Connect;
