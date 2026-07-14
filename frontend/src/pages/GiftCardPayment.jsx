import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowBack, MdCameraAlt, MdUploadFile, MdCheckCircle,
  MdWarning, MdClose, MdFlipCameraAndroid,
  MdCardGiftcard, MdCheck, MdStore, MdOpenInNew,
  MdKeyboard, MdPhotoCamera, MdInfo, MdLocalPlay,
  MdAdd
} from 'react-icons/md';
import { SiTarget, SiApple, SiG2A } from 'react-icons/si';
import { FaStore, FaGamepad, FaTag, FaMedkit } from 'react-icons/fa';
import { useCart } from '../hooks/useCart';
import { api } from '../services/api';
import Button from '../components/common/Button';
import ProgressStepper from '../components/checkout/ProgressStepper';

const CARD_BRANDS = [
  {
    id: 'apple',
    name: 'Apple Gift Card',
    image: '/apple_gift_card.jpg',
    scratchArea: 'Back of the card — silver scratch panel on the lower half',
    physicalStores: ['Walmart', 'Target', 'Best Buy', 'Apple Store', 'CVS', '7-Eleven'],
    g2a: 'https://www.g2a.com/search?query=apple+gift+card',
    eneba: 'https://www.eneba.com/store/gift-cards?search=apple',
  },
  {
    id: 'razer',
    name: 'Razer Gold',
    image: '/razer_gold_card.jpg',
    scratchArea: 'Back of the card — gold foil panel below the barcode',
    physicalStores: ['GameStop', 'Walmart', 'Best Buy', '7-Eleven', 'EB Games'],
    g2a: 'https://www.g2a.com/search?query=razer+gold',
    eneba: 'https://www.eneba.com/store/gift-cards?search=razer+gold',
  },
  {
    id: 'steam',
    name: 'Steam Gift Card',
    image: '/steam_gift_card.jpg',
    scratchArea: 'Back of the card — silver scratch strip below the barcode',
    physicalStores: ['Walmart', 'Target', 'GameStop', 'Best Buy', 'EB Games'],
    g2a: 'https://www.g2a.com/search?query=steam+gift+card',
    eneba: 'https://www.eneba.com/store/gift-cards?search=steam',
  },
];

const STEPS = ['Select Card', 'Where to Buy', 'Instructions', 'Submit Card', 'Confirm'];

export default function GiftCardPayment() {
  const { cartItems, subtotal, cartToken } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  // Cards state
  const [cards, setCards] = useState([]);
  const [isAddingCard, setIsAddingCard] = useState(true);
  
  const [submitMethod, setSubmitMethod] = useState(null); // 'photo' | 'code'
  const [captureMethod, setCaptureMethod] = useState(null); // 'camera' | 'upload'
  const [cardImage, setCardImage] = useState(null);
  const [cardCode, setCardCode] = useState('');
  const [cardAmount, setCardAmount] = useState('');
  
  const [checkedItems, setCheckedItems] = useState([false, false, false, false]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const shipping = subtotal > 0 ? 20.00 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;
  const runningTotal = cards.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const allConfirmed = checkedItems.every(Boolean);

  useEffect(() => {
    if (cards.length === 0) setIsAddingCard(true);
  }, [cards.length]);

  useEffect(() => {
    if (cartItems.length === 0) navigate('/cart');
  }, [cartItems, navigate]);

  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      alert('Could not access camera. Please allow camera permission or use the upload option.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const flipCamera = () => setFacingMode(f => f === 'environment' ? 'user' : 'environment');

  useEffect(() => {
    if (captureMethod === 'camera') startCamera();
  }, [captureMethod, facingMode]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setCardImage(canvas.toDataURL('image/jpeg'));
    stopCamera();
    setCaptureMethod(null);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    const newCards = files.map(file => ({
      type: 'photo',
      brand: selectedBrand,
      file: file,
      image: URL.createObjectURL(file), // Preview URL
      amount: parseFloat(cardAmount) || 0
    }));
    
    setCards(prev => [...prev, ...newCards]);
    setIsAddingCard(false);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
    setCardAmount('');
    setSubmitMethod(null);
  };

  const toggleCheck = (i) =>
    setCheckedItems(prev => prev.map((v, idx) => idx === i ? !v : v));

  const handleAddCard = () => {
    if (submitMethod === 'code') {
      const codes = cardCode.split('\n')
        .map(c => c.trim().toUpperCase().replace(/[^A-Z0-9\-\s]/g, ''))
        .filter(c => c.length >= 4);
      if (codes.length === 0) return;
      
      const newCards = codes.map(code => ({
        type: 'code',
        brand: selectedBrand,
        code: code,
        amount: parseFloat(cardAmount) || 0
      }));
      setCards(prev => [...prev, ...newCards]);
      setIsAddingCard(false);
    } else if (submitMethod === 'photo' && captureMethod === 'camera') {
      if (!cardImage) return;
      setCards(prev => [...prev, {
        type: 'photo',
        brand: selectedBrand,
        image: cardImage,
        amount: parseFloat(cardAmount) || 0
      }]);
      setIsAddingCard(false);
    }

    setCardCode('');
    setCardImage(null);
    setCardAmount('');
    setSubmitMethod(null);
    setCaptureMethod(null);
  };

  const handleRemoveCard = (index) => {
    setCards(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateCardAmount = (index, newAmount) => {
    setCards(prev => prev.map((c, i) => i === index ? { ...c, amount: parseFloat(newAmount) || 0 } : c));
  };

  const handleSubmit = async () => {
    if (!allConfirmed || cards.length === 0) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('cart_token', cartToken);
      formData.append('batch_total_amount', runningTotal);
      
      const cardsMeta = [];
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        if (card.type === 'code') {
          cardsMeta.push({ type: 'code', code: card.code, amount: card.amount, brand: card.brand });
        } else if (card.type === 'photo') {
          cardsMeta.push({ type: 'photo', amount: card.amount, brand: card.brand, image_index: formData.getAll('images').length });
          
          if (card.file) {
            formData.append('images', card.file);
          } else if (card.image) {
            const res = await fetch(card.image);
            const blob = await res.blob();
            formData.append('images', blob, `capture_${i}.jpg`);
          }
        }
      }
      
      formData.append('cards_meta', JSON.stringify(cardsMeta));

      const response = await api.submitGiftCard(formData);
      const submission = response.data || response;
      const submissionId = submission?.id || submission?.submission_id;

      sessionStorage.setItem('psh_payment_method', 'gift_card');
      sessionStorage.setItem('psh_payment_ref', submissionId);

      navigate('/delivery');
    } catch (error) {
      console.error('Failed to submit gift card:', error);
      alert('Failed to submit gift card. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    stopCamera();
    setCaptureMethod(null);
    if (step === 0) navigate('/checkout');
    else setStep(s => s - 1);
  };

  const brand = CARD_BRANDS.find(b => b.id === selectedBrand);

  return (
    <div className="py-12 md:py-20 px-4 md:px-8 bg-background min-h-screen">
      <div className="max-w-2xl mx-auto">
        <ProgressStepper currentStep={1} />

        {/* Back */}
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-8 text-sm font-medium"
        >
          <MdArrowBack size={18} /> {step === 0 ? 'Back to Checkout' : 'Previous Step'}
        </button>

        {/* Step pills */}
        <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1 whitespace-nowrap text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                i === step ? 'bg-primary text-white' :
                i < step ? 'bg-primary/10 text-primary' :
                'bg-surface-subtle text-secondary'
              }`}>
                {i < step && <MdCheck size={11} />}
                {s}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-4 shrink-0 rounded-full ${i < step ? 'bg-primary' : 'bg-border-light'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-border-light p-8">

          {/* ── STEP 0: Select Brand ── */}
          {step === 0 && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MdCardGiftcard size={28} className="text-primary" />
                <h1 className="text-2xl font-bold text-on-surface">Select Gift Card Type</h1>
              </div>
              <p className="text-secondary text-sm mb-8">
                Choose the brand of gift card you want to use. Don't have one yet? You'll see where to buy it on the next step.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {CARD_BRANDS.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBrand(b.id)}
                    className={`relative rounded-2xl overflow-hidden text-left transition-all border-2 shadow-sm hover:shadow-md ${
                      selectedBrand === b.id
                        ? 'border-primary shadow-lg scale-[1.02]'
                        : 'border-border-light hover:border-primary/40'
                    }`}
                  >
                    <div className="relative h-40 overflow-hidden bg-gray-100">
                      <img
                        src={b.image}
                        alt={b.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      {selectedBrand === b.id && (
                        <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
                          <MdCheckCircle size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-2.5 bg-white">
                      <p className="font-bold text-on-surface text-sm">{b.name}</p>
                    </div>
                  </button>
                ))}
              </div>

              <Button fullWidth size="lg" disabled={!selectedBrand} onClick={() => setStep(1)}>
                Continue →
              </Button>
            </div>
          )}

          {/* ── STEP 1: Where to Buy ── */}
          {step === 1 && brand && (
            <div>
              <h2 className="text-2xl font-bold text-on-surface mb-1">Where to Get Your {brand.name}</h2>
              <p className="text-secondary text-sm mb-6">
                You can purchase your {brand.name} either from a physical store or online as an eGift card.
              </p>

              {/* Card preview */}
              <div className="h-40 rounded-xl overflow-hidden border border-border-light mb-6">
                <img src={brand.image} alt={brand.name} className="w-full h-full object-cover" />
              </div>

              {/* Physical stores */}
              <div className="mb-5 p-5 bg-surface-subtle rounded-2xl border border-border-light">
                <div className="flex items-center gap-2 mb-3">
                  <MdStore size={20} className="text-primary" />
                  <h3 className="font-bold text-on-surface">Buy Physical Card from Stores</h3>
                </div>
                <p className="text-secondary text-sm mb-3">
                  Walk into any of these stores and purchase a physical {brand.name} from the gift card rack:
                </p>
                <div className="flex flex-wrap gap-2">
                  {brand.physicalStores.map(storeName => {
                    const storeMap = {
                      'Walmart': { icon: FaStore, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                      'Target': { icon: SiTarget, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                      'Best Buy': { icon: FaTag, color: 'text-blue-800', bg: 'bg-yellow-50', border: 'border-yellow-300' },
                      'Apple Store': { icon: SiApple, color: 'text-gray-800', bg: 'bg-gray-100', border: 'border-gray-300' },
                      'CVS': { icon: FaMedkit, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
                      '7-Eleven': { icon: FaStore, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
                      'GameStop': { icon: FaGamepad, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                      'EB Games': { icon: FaGamepad, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                    };
                    const details = storeMap[storeName] || { icon: MdStore, color: 'text-secondary', bg: 'bg-white', border: 'border-border-light' };
                    const Icon = details.icon;
                    
                    return (
                      <span
                        key={storeName}
                        className={`flex items-center gap-1.5 ${details.bg} ${details.border} border text-on-surface text-xs font-bold px-3 py-1.5 rounded-full`}
                      >
                        <Icon className={details.color} size={14} /> {storeName}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Buy online */}
              <div className="mb-6 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <MdOpenInNew size={20} className="text-blue-600" />
                  <h3 className="font-bold text-on-surface">Buy eGift Card Online (Instant Delivery)</h3>
                </div>
                <p className="text-secondary text-sm mb-4">
                  Purchase a digital {brand.name} online and get the code instantly via email — no scratching needed!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href={brand.g2a}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-4 bg-white border border-orange-200 rounded-2xl hover:border-orange-400 hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-50 mb-3 group-hover:scale-110 transition-transform text-[#FF5E00]">
                      <SiG2A size={24} />
                    </div>
                    <span className="font-bold text-on-surface group-hover:text-orange-600 transition">Buy on G2A.com</span>
                    <span className="text-[11px] text-secondary mt-1 text-center">Fast Delivery</span>
                    <div className="absolute top-3 right-3 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MdOpenInNew size={14} />
                    </div>
                  </a>
                  
                  <a
                    href={brand.eneba}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-4 bg-white border border-purple-200 rounded-2xl hover:border-purple-400 hover:shadow-md transition-all group relative overflow-hidden"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 mb-3 group-hover:scale-110 transition-transform text-[#5D38A4]">
                      <MdLocalPlay size={24} />
                    </div>
                    <span className="font-bold text-on-surface group-hover:text-purple-600 transition">Buy on Eneba.com</span>
                    <span className="text-[11px] text-secondary mt-1 text-center">Instant Code</span>
                    <div className="absolute top-3 right-3 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MdOpenInNew size={14} />
                    </div>
                  </a>
                </div>
                <div className="flex items-start gap-2 mt-3">
                  <MdInfo size={15} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-600">
                    When buying online, you'll receive a code by email. You can enter that code directly on the next steps — no photo needed!
                  </p>
                </div>
              </div>

              <Button fullWidth size="lg" onClick={() => setStep(2)}>
                I Have My Card — Continue →
              </Button>
            </div>
          )}

          {/* ── STEP 2: Instructions ── */}
          {step === 2 && brand && (
            <div>
              <h2 className="text-2xl font-bold text-on-surface mb-1">How to Scratch & Submit</h2>
              <p className="text-secondary text-sm mb-6">
                Follow these steps before submitting your {brand.name}.
              </p>

              {/* Scratch guide image */}
              <div className="mb-5 rounded-xl overflow-hidden border-2 border-primary/20">
                <div className="bg-primary/5 px-4 py-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  📸 How to scratch & snap your card
                </div>
                <img src="/scratch_guide.jpg" alt="How to scratch your gift card" className="w-full h-auto object-cover" />
              </div>

              <div className="space-y-3 mb-8">
                {[
                  { icon: '1️⃣', title: 'Find the scratch panel', desc: `${brand.scratchArea}.` },
                  { icon: '2️⃣', title: 'Scratch gently with a coin', desc: 'Scratch off the foil in one direction to reveal the code. Don\'t scratch too hard or you may damage the code.' },
                  { icon: '3️⃣', title: 'Submit photo OR type the code', desc: 'You can either take a photo of your scratched card, or simply type in the code if you bought an eGift card online.' },
                  { icon: '🚫', title: 'Do NOT send a used card', desc: 'Every submission is verified. Used or expired cards will result in immediate order cancellation.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-4 p-4 bg-surface-subtle rounded-xl border border-border-light">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <h4 className="font-semibold text-on-surface text-sm">{item.title}</h4>
                      <p className="text-secondary text-sm mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <MdWarning size={20} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-amber-800 text-sm">
                    <strong>Important:</strong> Fraudulent, expired, or already-redeemed cards will be rejected and reported.
                  </p>
                </div>
              </div>

              <Button fullWidth size="lg" onClick={() => setStep(3)}>
                I Understand — Submit My Card →
              </Button>
            </div>
          )}

          {/* ── STEP 3: Submit Card (Photo OR Code) ── */}
          {step === 3 && (
            <div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-on-surface mb-1">Submit Your {brand?.name}</h2>
                  <p className="text-secondary text-sm">
                    {isAddingCard ? "Choose how you'd like to submit this card." : "Review your added cards below."}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-secondary uppercase font-bold tracking-wider mb-1">Order Total</p>
                  <p className="text-xl font-bold text-primary">${total.toFixed(2)}</p>
                </div>
              </div>

              {cards.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-green-800">Added Cards ({cards.length})</h3>
                    <span className="font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-sm">
                      Total: ${runningTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className={`space-y-3 ${!isAddingCard ? 'mb-4' : ''}`}>
                    {cards.map((c, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3 rounded-lg border border-green-100 shadow-sm gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{c.type === 'photo' ? '📸' : '⌨️'}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 break-all">{c.type === 'photo' ? (c.file?.name || 'Camera Photo') : c.code}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <span className="text-sm font-bold text-gray-500">$</span>
                          <input 
                            type="number" 
                            min="0" 
                            step="0.01" 
                            value={c.amount || ''} 
                            onChange={(e) => handleUpdateCardAmount(i, e.target.value)}
                            className="w-24 border border-gray-300 rounded px-2 py-1 text-sm font-bold focus:outline-none focus:border-primary"
                            placeholder="Amount"
                          />
                          <button onClick={() => handleRemoveCard(i)} className="text-red-500 hover:text-red-700 p-1 ml-1" title="Remove">
                            <MdClose size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!isAddingCard && (
                    <Button variant="outline" onClick={() => setIsAddingCard(true)} className="w-full border-dashed border-2 bg-white hover:bg-green-100 border-green-300 text-green-800">
                      <MdAdd size={20} /> Add Another Card
                    </Button>
                  )}
                </div>
              )}

              {isAddingCard && (
                <div className={cards.length > 0 ? "border-t border-border-light pt-6" : ""}>
                  {cards.length > 0 && (
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-on-surface">Add a New Card</h3>
                      <button onClick={() => { setIsAddingCard(false); setSubmitMethod(null); }} className="text-secondary hover:text-red-500 text-sm font-bold flex items-center gap-1">
                        <MdClose size={16}/> Cancel
                      </button>
                    </div>
                  )}

                  {/* ── Always-visible tab switcher ── */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => { setSubmitMethod('photo'); setCardCode(''); }}
                  className={`flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all ${
                    submitMethod === 'photo'
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border-light hover:border-primary/40 hover:bg-surface-subtle'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    submitMethod === 'photo' ? 'bg-primary text-white' : 'bg-surface-subtle text-secondary'
                  }`}>
                    <MdPhotoCamera size={24} />
                  </div>
                  <div className="text-center">
                    <p className={`font-bold text-sm ${submitMethod === 'photo' ? 'text-primary' : 'text-on-surface'}`}>
                      📷 Send a Photo
                    </p>
                    <p className="text-xs text-secondary mt-0.5">Snap or upload your scratched card</p>
                  </div>
                  {submitMethod === 'photo' && (
                    <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-semibold">SELECTED</span>
                  )}
                </button>

                <button
                  onClick={() => { setSubmitMethod('code'); setCardImage(null); stopCamera(); setCaptureMethod(null); }}
                  className={`flex flex-col items-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all ${
                    submitMethod === 'code'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-border-light hover:border-blue-300 hover:bg-blue-50/30'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    submitMethod === 'code' ? 'bg-blue-500 text-white' : 'bg-surface-subtle text-secondary'
                  }`}>
                    <MdKeyboard size={24} />
                  </div>
                  <div className="text-center">
                    <p className={`font-bold text-sm ${submitMethod === 'code' ? 'text-blue-600' : 'text-on-surface'}`}>
                      ⌨️ Enter a Code
                    </p>
                    <p className="text-xs text-secondary mt-0.5">Type your eGift or scratch code</p>
                  </div>
                  {submitMethod === 'code' && (
                    <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-semibold">SELECTED</span>
                  )}
                </button>
              </div>

              {/* ── Photo method panel ── */}
              {submitMethod === 'photo' && (
                <div className="border-2 border-primary/20 rounded-2xl p-5 bg-primary/2 mb-4">
                  {/* Camera view */}
                  {captureMethod === 'camera' && (
                    <div className="mb-4">
                      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute inset-0 border-4 border-dashed border-white/50 m-6 rounded-xl pointer-events-none flex items-end justify-center pb-3">
                          <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                            Position the scratched code clearly in frame
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-3">
                        <Button variant="outline" onClick={() => { stopCamera(); setCaptureMethod(null); }} className="flex-1">
                          <MdClose size={18} /> Cancel
                        </Button>
                        <Button variant="secondary" onClick={flipCamera} className="shrink-0 px-4">
                          <MdFlipCameraAndroid size={20} />
                        </Button>
                        <Button onClick={capturePhoto} className="flex-1">
                          <MdCameraAlt size={18} /> Capture
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Image preview */}
                  {cardImage && !captureMethod && (
                    <div className="mb-4">
                      <div className="relative rounded-2xl overflow-hidden border-2 border-primary">
                        <img src={cardImage} alt="Gift Card" className="w-full object-cover max-h-64" />
                        <button
                          onClick={() => setCardImage(null)}
                          className="absolute top-3 right-3 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition"
                        >
                          <MdClose size={16} />
                        </button>
                      </div>
                      <p className="text-center text-sm text-primary font-medium mt-2 flex items-center justify-center gap-1">
                        <MdCheckCircle size={16} /> Photo looks great! You can retake if needed.
                      </p>
                    </div>
                  )}

                  {/* Camera / upload buttons */}
                  {!captureMethod && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => { setCardImage(null); setCaptureMethod('camera'); }}
                        className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-primary/40 rounded-xl hover:border-primary hover:bg-primary/5 transition text-sm font-semibold text-primary"
                      >
                        <MdCameraAlt size={20} /> Use Camera
                      </button>
                      <button
                        onClick={() => { setCardImage(null); fileInputRef.current?.click(); }}
                        className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-primary/40 rounded-xl hover:border-primary hover:bg-primary/5 transition text-sm font-semibold text-primary"
                      >
                        <MdUploadFile size={20} /> Upload File(s)
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                    </div>
                  )}

                  {!cardImage && !captureMethod && (
                    <p className="text-center text-xs text-secondary mt-3">
                      You can select multiple files at once. Make sure the PIN is visible!
                    </p>
                  )}
                </div>
              )}

              {/* ── Code method panel ── */}
              {submitMethod === 'code' && (
                <div className="border-2 border-blue-200 rounded-2xl p-5 bg-blue-50/40 mb-4">
                  <label className="block text-sm font-bold text-on-surface mb-2">
                    🔑 Gift Card Code(s)
                  </label>
                  <p className="text-xs text-secondary mb-3">Paste multiple codes below (one per line).</p>
                  <textarea
                    value={cardCode}
                    onChange={e => setCardCode(e.target.value.toUpperCase().replace(/[^A-Z0-9\-\s\n]/g, ''))}
                    placeholder="XXXX-XXXX-XXXX-XXXX&#10;YYYY-YYYY-YYYY-YYYY"
                    rows={4}
                    className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 font-mono text-base text-on-surface tracking-widest focus:outline-none focus:border-blue-500 transition bg-white mb-3"
                  />
                </div>
              )}
              
              {/* Common Amount Input (Only for manual additions via Camera or Code) */}
              {submitMethod && (submitMethod === 'code' || captureMethod === 'camera') && (
                <div className="border-2 border-gray-200 rounded-2xl p-5 bg-gray-50 mb-6">
                  <label className="block text-sm font-bold text-on-surface mb-2">
                    💵 Default Amount ($)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={cardAmount}
                    onChange={e => setCardAmount(e.target.value)}
                    placeholder="Optional: Auto-fill amount for these cards"
                    className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg font-bold text-on-surface focus:outline-none focus:border-primary transition bg-white"
                  />
                </div>
              )}

              {submitMethod && (submitMethod === 'code' || captureMethod === 'camera') && (
                <Button
                  fullWidth
                  variant="outline"
                  size="lg"
                  disabled={(submitMethod === 'code' && cardCode.trim().length < 4) || (submitMethod === 'photo' && !cardImage)}
                  onClick={handleAddCard}
                  className="mb-4 border-dashed border-2 bg-gray-50 hover:bg-gray-100"
                >
                  <MdAdd size={20} /> Add To Order
                </Button>
              )}
              </div>
              )}

              <div className="pt-4 border-t border-border-light flex gap-3">
                <Button
                  fullWidth
                  size="lg"
                  disabled={cards.length === 0}
                  onClick={() => setStep(4)}
                >
                  Proceed to Review & Confirm →
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Confirm ── */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-on-surface mb-1">Review & Confirm</h2>
              <p className="text-secondary text-sm mb-6">Review your submission carefully before sending.</p>

              <div className="space-y-4 mb-6">
                {/* Brand */}
                <div className="flex gap-4 p-4 bg-surface-subtle rounded-xl border border-border-light items-center">
                  <div className="w-16 h-14 rounded-lg overflow-hidden shrink-0 border border-border-light">
                    <img src={brand?.image} alt={brand?.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs text-secondary uppercase tracking-wider">Card Brand</p>
                    <p className="font-bold text-on-surface mt-0.5">{brand?.name}</p>
                  </div>
                </div>

                {/* Submissions */}
                <div className="bg-surface-subtle rounded-xl p-4 border border-border-light">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-secondary uppercase tracking-wider">Your Submitted Cards</p>
                    <span className="text-xs font-bold bg-primary text-white px-2 py-0.5 rounded-full">{cards.length} Cards</span>
                  </div>
                  <div className="space-y-3">
                    {cards.map((c, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-border-light shadow-sm">
                        <div>
                          <p className="text-sm font-bold text-gray-800 flex items-center gap-1">
                            {c.type === 'photo' ? <><MdPhotoCamera size={14}/> Photo</> : <><MdKeyboard size={14}/> {c.code}</>}
                          </p>
                        </div>
                        <p className="font-bold text-primary">${c.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center bg-surface-subtle rounded-xl p-4 border border-border-light">
                  <div>
                    <p className="text-xs text-secondary uppercase tracking-wider mb-1">Total Card Value</p>
                    <p className="font-bold text-green-600 text-xl">${runningTotal.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-secondary uppercase tracking-wider mb-1">Amount Due</p>
                    <p className="font-bold text-primary text-xl">${total.toFixed(2)}</p>
                  </div>
                </div>
                
                {runningTotal < total && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                    <MdWarning size={18} className="shrink-0" />
                    <strong>Note:</strong> Your cards total (${runningTotal.toFixed(2)}) is less than the order amount (${total.toFixed(2)}).
                  </div>
                )}
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 mb-6">
                <p className="text-sm font-semibold text-on-surface">Please confirm all of the following:</p>
                {[
                  'The gift cards submitted are correct and complete.',
                  'These cards have NOT been previously used or redeemed.',
                  'I am the legitimate owner of these gift cards.',
                  'I understand that submitting fraudulent cards will result in order cancellation and may be reported.',
                ].map((text, i) => (
                  <button
                    key={i}
                    onClick={() => toggleCheck(i)}
                    className="flex items-start gap-3 w-full text-left group"
                  >
                    <div className={`w-5 h-5 shrink-0 mt-0.5 rounded border-2 flex items-center justify-center transition-all ${
                      checkedItems[i] ? 'bg-primary border-primary' : 'border-border-light group-hover:border-primary/50'
                    }`}>
                      {checkedItems[i] && <MdCheck size={12} className="text-white" />}
                    </div>
                    <span className="text-sm text-secondary">{text}</span>
                  </button>
                ))}
              </div>

              {!allConfirmed && (
                <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-amber-700 text-sm">
                  <MdWarning size={18} className="shrink-0 mt-0.5" />
                  Please tick all boxes above before submitting.
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="shrink-0">← Back</Button>
                <Button
                  fullWidth
                  size="lg"
                  disabled={!allConfirmed}
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
                >
                  Submit Cards →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
