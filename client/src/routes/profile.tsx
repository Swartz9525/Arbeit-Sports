import { useState } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as rootRoute } from './__root';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import { User, Plus, Trash2, MapPin, Loader2, Phone, Briefcase, Mail, Pencil, Check, X, Lock } from 'lucide-react';

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

function Profile() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Password Change States
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Address Form / Edit States
  const [showAddForm, setShowAddForm] = useState(false);
  const [editAddressId, setEditAddressId] = useState<string | null>(null);

  // Address Form Fields States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('USA');
  const [isDefault, setIsDefault] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-32 space-y-4">
        <h2 className="text-3xl font-black text-white uppercase">ACCESS DENIED</h2>
        <p className="text-zinc-400 text-sm">Please sign in to view your profile and manage saved addresses.</p>
        <button
          onClick={() => navigate({ to: '/login' })}
          className="px-6 py-3 bg-violet-600 hover:bg-violet-700 font-bold text-xs rounded-xl tracking-wider uppercase text-white cursor-pointer"
        >
          GO TO LOGIN
        </button>
      </div>
    );
  }

  // Fetch saved addresses
  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['myAddresses'],
    queryFn: async () => {
      const res = await api.get('/addresses');
      return res.data as AddressData[];
    },
  });

  // Mutation: Change Password
  const changePasswordMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put('/users/change-password', payload);
      return res.data;
    },
    onSuccess: () => {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      alert('Password updated successfully!');
    },
    onError: (err: any) => {
      alert(`Failed to update password: ${err.response?.data?.message || err.message}`);
    },
  });

  // Mutation: Add / Edit Address
  const submitAddressMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editAddressId) {
        return api.put(`/addresses/${editAddressId}`, payload);
      } else {
        return api.post('/addresses', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
      resetAddressForm();
      alert(editAddressId ? 'Address updated successfully!' : 'Address saved successfully!');
    },
    onError: (err: any) => {
      alert(`Failed to save address: ${err.response?.data?.message || err.message}`);
    },
  });

  // Mutation: Delete address
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAddresses'] });
      alert('Address deleted successfully!');
    },
    onError: (err: any) => {
      alert(`Failed to delete address: ${err.response?.data?.message || err.message}`);
    },
  });

  const resetAddressForm = () => {
    setFullName('');
    setPhone('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setStateName('');
    setPostalCode('');
    setCountry('USA');
    setIsDefault(false);
    setEditAddressId(null);
    setShowAddForm(false);
  };

  const handleEditAddressClick = (addr: AddressData) => {
    setEditAddressId(addr._id);
    setFullName(addr.fullName);
    setPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city);
    setStateName(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
    setIsDefault(addr.isDefault);
    setShowAddForm(true);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('All fields are required.');
      return;
    }
    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    if (newPassword === oldPassword) {
      alert('New password cannot be the same as the old password.');
      return;
    }

    changePasswordMutation.mutate({ oldPassword, newPassword });
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !addressLine1 || !city || !stateName || !postalCode || !country) {
      alert('All required fields must be filled.');
      return;
    }

    submitAddressMutation.mutate({
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state: stateName,
      postalCode,
      country,
      isDefault,
      type: 'shipping',
    });
  };

  return (
    <div className="space-y-12">
      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">ATHLETE PROFILE</h1>
        <p className="text-zinc-400 text-xs font-semibold">MANAGE YOUR PROFILE DETAILS AND SAVED SHIPPING ADDRESSES</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: User Profile Info Card & Change Password Portal */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="glass-panel border border-white/10 p-6 rounded-2xl space-y-6">
            <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-white/5 relative">
              <div className="w-20 h-20 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase">{user.name}</h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-violet-500/15 border border-violet-500/25 text-violet-400 uppercase tracking-widest block w-fit mx-auto mt-1">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm font-semibold text-zinc-400">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-zinc-500" />
                <div>
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase block tracking-wider">EMAIL ADDRESS</span>
                  <span className="text-white">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-zinc-500" />
                <div>
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase block tracking-wider">ACCOUNT ROLE</span>
                  <span className="text-white capitalize">{user.role} Portal Access</span>
                </div>
              </div>

              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="w-full mt-2 py-2.5 bg-white/5 border border-white/10 text-white font-bold text-xs rounded-xl tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all hover:bg-white/10 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-violet-400" />
                  CHANGE PASSWORD
                </button>
              )}
            </div>
          </div>

          {/* Change Password Block */}
          {isChangingPassword && (
            <div className="glass-panel border border-violet-500/20 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-extrabold text-violet-400 uppercase tracking-widest">UPDATE PASSWORD</span>
                <button
                  onClick={() => {
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setIsChangingPassword(false);
                  }}
                  className="text-zinc-500 hover:text-white font-bold text-xs"
                >
                  CLOSE
                </button>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">CURRENT PASSWORD</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500/50"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">NEW PASSWORD</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500/50"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">CONFIRM NEW PASSWORD</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500/50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {changePasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  UPDATE PASSWORD
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Address Management Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black uppercase text-white tracking-wide">SAVED ADDRESSES</h3>
            {!showAddForm && (
              <button
                onClick={() => {
                  setEditAddressId(null);
                  setShowAddForm(true);
                }}
                className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-black rounded-xl tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-violet-500/10"
              >
                <Plus className="w-4 h-4" />
                ADD NEW
              </button>
            )}
          </div>

          {/* Add / Edit Address Form */}
          {showAddForm && (
            <div className="glass-panel border border-violet-500/25 p-6 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <span className="text-sm font-black text-white uppercase tracking-wider">
                  {editAddressId ? 'EDIT SHIPPING ADDRESS' : 'NEW SHIPPING ADDRESS'}
                </span>
                <button
                  onClick={resetAddressForm}
                  className="text-xs text-zinc-500 hover:text-white font-bold"
                >
                  CANCEL
                </button>
              </div>

              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">FULL NAME</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none focus:border-violet-500/50"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">PHONE NUMBER</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ADDRESS LINE 1</label>
                    <input
                      type="text"
                      placeholder="123 Elite Athlete Way"
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ADDRESS LINE 2 (OPTIONAL)</label>
                    <input
                      type="text"
                      placeholder="Suite 500"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">CITY</label>
                    <input
                      type="text"
                      placeholder="Los Angeles"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">STATE</label>
                    <input
                      type="text"
                      placeholder="CA"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none"
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
                      className="w-full px-4 py-2.5 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none"
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
                      className="w-full px-4 py-2.5 bg-[#0b0b0f] border border-white/10 text-white rounded-xl text-sm focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded accent-violet-500 cursor-pointer"
                  />
                  <label htmlFor="isDefault" className="text-xs font-semibold text-zinc-300 cursor-pointer select-none">
                    Set as default shipping address
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitAddressMutation.isPending}
                  className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  {submitAddressMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {editAddressId ? 'SAVE CHANGES' : 'SAVE ADDRESS'}
                </button>
              </form>
            </div>
          )}

          {/* Saved Addresses list */}
          {addressesLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
          ) : !addresses || addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white/5 border border-white/5 p-8 rounded-2xl space-y-4">
              <MapPin className="w-10 h-10 text-zinc-500" />
              <div className="text-center space-y-1">
                <h4 className="text-sm font-bold text-white uppercase">NO SAVED ADDRESSES</h4>
                <p className="text-zinc-500 text-xs">Save shipping addresses here to checkout faster during your next order.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  className={`glass-panel p-5 rounded-2xl border flex flex-col justify-between gap-4 relative transition-all ${
                    address.isDefault ? 'border-violet-500/40 bg-violet-500/5' : 'border-white/5'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-bold text-white uppercase">{address.fullName}</h4>
                      {address.isDefault && (
                        <span className="text-[9px] bg-violet-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">
                          DEFAULT
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-zinc-400 font-semibold space-y-1">
                      <p>{address.addressLine1}</p>
                      {address.addressLine2 && <p>{address.addressLine2}</p>}
                      <p>{address.city}, {address.state} {address.postalCode}</p>
                      <p>{address.country}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 border-t border-white/5 pt-3 justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-bold">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{address.phone}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditAddressClick(address)}
                        className="p-1.5 hover:bg-white/10 text-zinc-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Edit Address"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteAddressMutation.mutate(address._id)}
                        disabled={deleteAddressMutation.isPending}
                        className="p-1.5 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: Profile,
});
