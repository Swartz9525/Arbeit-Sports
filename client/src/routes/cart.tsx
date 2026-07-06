import { createRoute, Link, useNavigate } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addToCart, removeFromCart, clearCart } from '../features/cart/store/cartSlice';
import { Trash2, ShoppingBag, ArrowRight, Loader2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useQuery } from '@tanstack/react-query';

import { MapPin, CreditCard, Wallet, Landmark } from 'lucide-react';

interface AddressData {
  _id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

function Cart() {
  const cart = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Saved Address Selection State
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  // Address State
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('USA');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'PayPal' | 'COD'>('Card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Fetch saved addresses if logged in
  const { data: savedAddresses } = useQuery({
    queryKey: ['myAddresses'],
    queryFn: async () => {
      const res = await api.get('/addresses');
      return res.data as AddressData[];
    },
    enabled: isAuthenticated,
  });

  // Auto-select default address on load
  useEffect(() => {
    if (savedAddresses && savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find(a => a.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
        setAddress(`${defaultAddr.fullName}, ${defaultAddr.addressLine1}${defaultAddr.addressLine2 ? ', ' + defaultAddr.addressLine2 : ''}`);
        setCity(defaultAddr.city);
        setPostalCode(defaultAddr.postalCode);
        setCountry(defaultAddr.country);
      }
    }
  }, [savedAddresses]);

  const handleSelectSavedAddress = (addr: AddressData) => {
    setSelectedAddressId(addr._id);
    setAddress(`${addr.fullName}, ${addr.addressLine1}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}`);
    setCity(addr.city);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
  };

  const handleUseCustomAddress = () => {
    setSelectedAddressId('custom');
    setAddress('');
    setCity('');
    setPostalCode('');
    setCountry('USA');
  };

  const handleQtyChange = (item: any, qty: number) => {
    dispatch(addToCart({ ...item, qty }));
  };

  const handleRemove = (product: string, size?: string, color?: string) => {
    dispatch(removeFromCart({ product, size, color }));
  };

  const handleCheckout = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!isAuthenticated) {
      navigate({ to: '/login' });
      return;
    }

    if (!isCheckingOut) {
      setIsCheckingOut(true);
      return;
    }

    // Validation
    if (!address || !city || !postalCode || !country) {
      alert('Please fill out all shipping fields.');
      return;
    }

    if (paymentMethod === 'Card') {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        alert('Please fill out card payment details.');
        return;
      }
    }

    setCheckoutLoading(true);
    try {
      const orderPayload = {
        orderItems: cart.items,
        shippingAddress: {
          address,
          city,
          postalCode,
          country,
        },
        paymentMethod,
        itemsPrice: cart.itemsPrice,
        taxPrice: cart.taxPrice,
        shippingPrice: cart.shippingPrice,
        totalPrice: cart.totalPrice,
      };

      const res = await api.post('/orders', orderPayload);
      alert(`Order placed successfully! Order ID: ${res.data._id}`);
      dispatch(clearCart());
      // Redirect to track orders page with order ID
      navigate({ to: '/orders/track', search: { id: res.data._id } });
    } catch (err: any) {
      alert(`Checkout failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="p-4 bg-white/5 rounded-full border border-white/10">
          <ShoppingBag className="w-12 h-12 text-zinc-500" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold text-white uppercase">YOUR BAG IS EMPTY</h2>
          <p className="text-zinc-400 text-sm max-w-xs">Looks like you haven't added any high performance gear to your bag yet.</p>
        </div>
        <Link to="/shop" className="px-6 py-3 btn-neon font-black text-xs rounded-xl tracking-widest uppercase">
          START SHOPPING
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
          {isCheckingOut ? 'SECURE CHECKOUT' : 'ATHLETIC BAG'}
        </h1>
        {isCheckingOut && (
          <button
            onClick={() => setIsCheckingOut(false)}
            className="text-xs text-zinc-400 hover:text-white font-bold uppercase tracking-wider"
          >
            &larr; BACK TO BAG
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Items list or Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {!isCheckingOut ? (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={`${item.product}-${item.size || ''}-${item.color || ''}`}
                  className="flex flex-col sm:flex-row items-center gap-6 glass-panel border border-white/5 p-5 rounded-2xl"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow text-center sm:text-left space-y-1.5">
                    <h3 className="text-base font-bold text-white uppercase">{item.name}</h3>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-zinc-400 font-semibold">
                      {item.size && (
                        <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded">SIZE: {item.size}</span>
                      )}
                      {item.color && (
                        <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded">COLOR: {item.color}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Select & Actions */}
                  <div className="flex items-center gap-6">
                    <select
                      value={item.qty}
                      onChange={(e) => handleQtyChange(item, Number(e.target.value))}
                      className="px-2.5 py-1.5 bg-white/5 border border-white/10 text-white rounded-lg text-xs font-bold focus:outline-none"
                    >
                      {[...Array(Math.min(item.stock, 10)).keys()].map((x) => (
                        <option key={x + 1} value={x + 1} className="bg-[#0b0b0f]">
                          {x + 1}
                        </option>
                      ))}
                    </select>

                    <div className="text-base font-bold text-white">₹{(item.price * item.qty).toFixed(2)}</div>

                    <button
                      onClick={() => handleRemove(item.product, item.size, item.color)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={handleCheckout} className="space-y-6">
              {/* Shipping Address Section */}
              <div className="glass-panel border border-white/10 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3 justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-violet-400" />
                    <h3 className="text-base font-black uppercase text-white tracking-wide">SHIPPING ADDRESS</h3>
                  </div>
                  {savedAddresses && savedAddresses.length > 0 && selectedAddressId !== 'custom' && (
                    <button
                      type="button"
                      onClick={handleUseCustomAddress}
                      className="text-xs text-violet-400 hover:underline font-bold uppercase tracking-wider"
                    >
                      Use Custom Address
                    </button>
                  )}
                </div>

                {savedAddresses && savedAddresses.length > 0 ? (
                  <div className="space-y-4">
                    {/* Saved address grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr._id;
                        return (
                          <div
                            key={addr._id}
                            onClick={() => handleSelectSavedAddress(addr)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-3 relative ${
                              isSelected
                                ? 'border-violet-500 bg-violet-600/10 text-white shadow-lg shadow-violet-500/5'
                                : 'border-white/5 bg-white/5 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold uppercase tracking-wider block text-white">
                                  {addr.fullName}
                                </span>
                                {isSelected && <Check className="w-4 h-4 text-violet-400" />}
                              </div>
                              <div className="text-[11px] leading-relaxed font-semibold">
                                <p>{addr.addressLine1}</p>
                                {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                                <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Render inputs if custom selected */}
                    {selectedAddressId === 'custom' && (
                      <div className="space-y-4 pt-3 border-t border-white/5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">STREET ADDRESS</label>
                          <input
                            type="text"
                            placeholder="123 Elite Athlete Way"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500/50"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">CITY</label>
                            <input
                              type="text"
                              placeholder="Los Angeles"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">POSTAL CODE</label>
                            <input
                              type="text"
                              placeholder="90001"
                              value={postalCode}
                              onChange={(e) => setPostalCode(e.target.value)}
                              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">COUNTRY</label>
                            <input
                              type="text"
                              placeholder="USA"
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">STREET ADDRESS</label>
                      <input
                        type="text"
                        placeholder="123 Elite Athlete Way"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500/50"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">CITY</label>
                        <input
                          type="text"
                          placeholder="Los Angeles"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">POSTAL CODE</label>
                        <input
                          type="text"
                          placeholder="90001"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">COUNTRY</label>
                        <input
                          type="text"
                          placeholder="USA"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Methods Section */}
              <div className="glass-panel border border-white/10 p-6 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <CreditCard className="w-5 h-5 text-violet-400" />
                  <h3 className="text-base font-black uppercase text-white tracking-wide">PAYMENT DETAILS</h3>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`py-3 rounded-xl border text-xs font-black uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'Card'
                        ? 'border-violet-500 bg-violet-600/10 text-white shadow-lg shadow-violet-500/5'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    CARD
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PayPal')}
                    className={`py-3 rounded-xl border text-xs font-black uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'PayPal'
                        ? 'border-violet-500 bg-violet-600/10 text-white shadow-lg shadow-violet-500/5'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    PAYPAL
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`py-3 rounded-xl border text-xs font-black uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'COD'
                        ? 'border-violet-500 bg-violet-600/10 text-white shadow-lg shadow-violet-500/5'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Landmark className="w-4 h-4" />
                    C.O.D.
                  </button>
                </div>

                {/* Conditional Form fields based on Payment Method */}
                {paymentMethod === 'Card' && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">CARD NUMBER</label>
                      <input
                        type="text"
                        placeholder="•••• •••• •••• ••••"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">EXPIRY DATE</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'PayPal' && (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center text-xs font-semibold text-zinc-400">
                    You will be redirected to PayPal to authorize the transaction after clicking Place Order.
                  </div>
                )}

                {paymentMethod === 'COD' && (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-center text-xs font-semibold text-zinc-400">
                    Pay in cash upon delivery of your products.
                  </div>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Right Side: Order Summary */}
        <div className="glass-panel border border-white/10 p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-extrabold uppercase text-white tracking-wide">ORDER SUMMARY</h3>
          
          <div className="space-y-3 text-sm font-semibold text-zinc-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white">₹{cart.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-white">
                {cart.shippingPrice === 0 ? 'FREE' : `₹${cart.shippingPrice.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (15%)</span>
              <span className="text-white">₹{cart.taxPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-white pt-4 border-t border-white/5">
              <span>Total Price</span>
              <span className="text-violet-400 text-lg">₹{cart.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => isCheckingOut ? handleCheckout() : setIsCheckingOut(true)}
            disabled={checkoutLoading}
            className="w-full py-4 btn-neon font-black text-xs rounded-xl flex items-center justify-center gap-2 tracking-widest uppercase transition-all cursor-pointer"
          >
            {checkoutLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isCheckingOut ? 'PLACE ORDER' : 'PROCEED TO CHECKOUT'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: Cart,
});
