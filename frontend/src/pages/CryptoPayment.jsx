import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdArrowBack, MdContentCopy, MdCheckCircle, MdKey, MdOpenInNew } from 'react-icons/md';
import { useCart } from '../hooks/useCart';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { SiCoinbase, SiBinance, SiCashapp } from 'react-icons/si';
import { FaCreditCard } from 'react-icons/fa';
import { api } from '../services/api';

export default function CryptoPayment() {
  const { cartItems, subtotal } = useCart();
  const navigate = useNavigate();
  const [selectedCoin, setSelectedCoin] = useState('usdt_trc20');
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  useEffect(() => {
    // Load wallet address from backend; fall back gracefully if backend not running
    api.getWalletAddress(selectedCoin)
      .then(res => setWalletAddress(res?.data?.address || res?.address || ''))
      .catch(() => setWalletAddress('Configure wallet in .env'));
  }, [selectedCoin]);

  const total = subtotal + (subtotal > 0 ? 20.00 : 0) + (subtotal * 0.08);

  const coins = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC', network: 'Bitcoin', color: 'bg-orange-100 text-orange-600', border: 'border-orange-500' },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH', network: 'ERC20', color: 'bg-indigo-100 text-indigo-600', border: 'border-indigo-500' },
    { id: 'usdt_trc20', name: 'Tether (TRC20)', symbol: 'USDT', network: 'Tron', color: 'bg-teal-100 text-teal-600', border: 'border-teal-500' },
    { id: 'usdt_bep20', name: 'Tether (BEP20)', symbol: 'USDT', network: 'BSC', color: 'bg-yellow-100 text-yellow-600', border: 'border-yellow-500' },
    { id: 'sol', name: 'Solana', symbol: 'SOL', network: 'Solana', color: 'bg-purple-100 text-purple-600', border: 'border-purple-500' },
  ];

  const getActiveCoin = () => coins.find(c => c.id === selectedCoin);
  
  const getCryptoAmount = () => {
    if (selectedCoin.includes('usdt')) return total.toFixed(2);
    if (selectedCoin === 'btc') return (total / 65000).toFixed(6);
    if (selectedCoin === 'eth') return (total / 3500).toFixed(4);
    if (selectedCoin === 'sol') return (total / 150).toFixed(2);
    return '0.00';
  };

  const qrUrl = api.getWalletQR(selectedCoin);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress || 'Configure wallet in .env');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (!txHash.trim()) {
      setVerifyError('Please enter your Transaction Hash (TxID) before proceeding.');
      return;
    }
    if (!customerEmail.trim()) {
      setVerifyError('Please enter your email so we can send you an order confirmation.');
      return;
    }
    setVerifyError('');
    setIsVerifying(true);

    sessionStorage.setItem('psh_payment_method', selectedCoin);
    sessionStorage.setItem('psh_payment_ref', txHash);

    try {
      // Actually call the backend — this triggers the admin alert email with the TX hash + block explorer link
      await api.verifyCryptoTx(
        selectedCoin,
        txHash.trim(),
        total,
        customerEmail.trim()
      );
    } catch (err) {
      // Non-blocking: even if verify fails (e.g. test hash), we still let customer proceed
      console.warn('Crypto verify warning:', err?.response?.data?.message || err.message);
    } finally {
      setIsVerifying(false);
    }

    navigate('/delivery', {
      state: {
        paymentMethod: selectedCoin,
        paymentReference: txHash.trim(),
        currency: getActiveCoin()?.symbol || 'USD',
        customerEmail: customerEmail.trim(),
      }
    });
  };

  return (
    <div className="py-12 px-margin-mobile md:px-margin-desktop bg-background min-h-[calc(100vh-200px)] relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link to="/checkout" className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors font-label-lg mb-8">
          <MdArrowBack size={20} />
          <span>Back to Payment Methods</span>
        </Link>
        
        <div className="glass-panel rounded-3xl p-6 md:p-12 shadow-card border border-white/50">
          <div className="text-center mb-10">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Cryptocurrency Payment</h1>
            <p className="text-secondary text-body-md">Select your preferred cryptocurrency and send the exact amount.</p>
          </div>
          
          {/* Coin Selector Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {coins.map(coin => (
              <button
                key={coin.id}
                onClick={() => setSelectedCoin(coin.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  selectedCoin === coin.id 
                    ? `${coin.border} bg-white shadow-md transform -translate-y-1` 
                    : 'border-border-light bg-surface-subtle hover:border-primary/30 hover:bg-white'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${coin.color}`}>
                  <span className="font-bold">{coin.symbol[0]}</span>
                </div>
                <span className={`font-label-lg ${selectedCoin === coin.id ? 'text-on-surface' : 'text-secondary'}`}>{coin.symbol}</span>
                <span className="text-[10px] text-secondary mt-1">{coin.network}</span>
              </button>
            ))}
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center bg-white rounded-2xl p-4 sm:p-8 border border-border-light shadow-sm">
            {/* QR Code Column */}
            <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border-light pb-8 md:pb-0 md:pr-8">
              <div className="w-40 h-40 sm:w-48 sm:h-48 bg-surface-subtle border border-border-light rounded-xl flex items-center justify-center mb-6 relative overflow-hidden group">
                <img
                  src={qrUrl}
                  alt={`${selectedCoin.toUpperCase()} QR Code`}
                  className="w-44 h-44 object-contain"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="text-center">
                <p className="text-label-sm text-secondary mb-1">Send exact amount:</p>
                <div className="font-headline-lg text-[28px] text-on-surface">
                  {getCryptoAmount()} <span className="text-primary text-[20px]">{getActiveCoin()?.symbol}</span>
                </div>
                <p className="text-label-sm text-secondary mt-2">Network: <span className="font-bold text-on-surface">{getActiveCoin()?.network}</span></p>
              </div>
            </div>
            
            {/* Address Column */}
            <div className="flex flex-col justify-center pt-8 md:pt-0">
              <label className="font-label-lg text-on-surface-variant mb-2">Deposit Address</label>
              <div className="flex bg-surface-subtle p-1 rounded-xl border border-border-light mb-8 max-w-full">
                <input 
                  type="text" 
                  readOnly 
                  value={walletAddress || 'Loading...'}
                  className="flex-1 min-w-0 bg-transparent px-2 sm:px-4 font-mono text-xs sm:text-sm text-secondary outline-none truncate"
                />
                <button 
                  onClick={copyAddress}
                  className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-1 sm:gap-2 font-label-sm transition-all shrink-0 ${
                    copied ? 'bg-primary text-white' : 'bg-white border border-border-light text-on-surface hover:bg-surface'
                  }`}
                >
                  {copied ? <MdCheckCircle size={16} /> : <MdContentCopy size={16} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              
              <div className="bg-surface-container-low p-4 rounded-xl border border-primary/20 mb-6">
                <p className="text-label-sm text-primary flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] mt-0.5">info</span>
                  <span>Please send the exact amount via the {getActiveCoin()?.network} network only. Sending via other networks will result in permanent loss of funds.</span>
                </p>
              </div>
              
              <div className="space-y-4 mt-4">
                <Input
                  label="Your Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />

                <Input
                  label="Transaction Hash / TxID"
                  placeholder="Paste your transaction hash here"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  icon={MdKey}
                />

                {verifyError && (
                  <p style={{ color: '#dc2626', fontSize: '13px', margin: '4px 0 0' }}>{verifyError}</p>
                )}

                <div className="mt-2">
                  <Button fullWidth onClick={handleVerify} isLoading={isVerifying}>
                    I have paid — Confirm Payment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Where to buy crypto section */}
        <div className="mt-8 bg-blue-50/50 rounded-3xl p-6 md:p-8 border border-blue-100 shadow-sm relative z-10 mb-12">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-headline-md text-[20px] text-on-surface font-bold">Don't have Cryptocurrency?</h2>
          </div>
          <p className="text-secondary text-body-md mb-6">
            You can easily buy Bitcoin, USDT, or other cryptocurrencies using your credit card, debit card, or bank account from these trusted platforms:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'MoonPay', url: 'https://www.moonpay.com/buy', desc: 'Fastest with Card', Icon: FaCreditCard, iconColor: 'text-[#7A00F0]' },
              { name: 'Coinbase', url: 'https://www.coinbase.com', desc: 'Most Popular', Icon: SiCoinbase, iconColor: 'text-[#0052FF]' },
              { name: 'Binance', url: 'https://www.binance.com', desc: 'Lowest Fees', Icon: SiBinance, iconColor: 'text-[#F3BA2F]' },
              { name: 'Cash App', url: 'https://cash.app/bitcoin', desc: 'Easiest for BTC', Icon: SiCashapp, iconColor: 'text-[#00D632]' }
            ].map(platform => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white border border-border-light rounded-2xl hover:border-blue-400 hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-gray-50 mb-2 sm:mb-3 group-hover:scale-110 transition-transform ${platform.iconColor}`}>
                  <platform.Icon size={20} className="sm:w-6 sm:h-6 w-5 h-5" />
                </div>
                <span className="font-bold text-on-surface group-hover:text-blue-600 transition text-sm sm:text-base text-center">{platform.name}</span>
                <span className="text-[10px] sm:text-[11px] text-secondary mt-1 text-center">{platform.desc}</span>
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MdOpenInNew size={14} />
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
