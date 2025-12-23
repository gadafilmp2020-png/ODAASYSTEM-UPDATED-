import React, { useState, useRef } from 'react';
import { X, Upload, ShieldCheck, FileText, User, Globe, Calendar, CreditCard, ScanFace, Image as ImageIcon, Loader2 } from 'lucide-react';
import { VerificationRequest } from '../types';

interface KYCModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<VerificationRequest>) => void;
  userName: string;
}

export const KYCModal: React.FC<KYCModalProps> = ({ onClose, onSubmit, userName }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    country: 'Ethiopia',
    dob: '',
    idType: 'NATIONAL_ID' as VerificationRequest['idType'], // Fix: Use VerificationRequest['idType'] for type safety
    idNumber: '',
  });

  const [files, setFiles] = useState<{
    front: string | null;
    back: string | null;
    selfie: string | null;
  }>({ front: null, back: null, selfie: null });

  const handleFileChange = (field: keyof typeof files, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.idNumber || !files.front || !files.selfie) {
      alert("Please fill all required fields and upload mandatory images.");
      return;
    }

    setLoading(true);
    // Simulate network request
    setTimeout(() => {
      onSubmit({
        ...formData,
        frontImage: files.front || undefined,
        backImage: files.back || undefined,
        selfieImage: files.selfie || undefined,
        documentUrl: files.front || '', // Fallback for old type definition compatibility
      });
      setLoading(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="widget-card w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-lime-500/10 rounded-2xl border border-lime-500/20">
              <ShieldCheck size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-tech uppercase tracking-wide">Identity Verification</h2>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest mt-1">KYC PROTOCOL V3.0 • SECURE UPLINK</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-900">
          <div 
            className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 transition-all duration-700 ease-out" 
            style={{ width: step === 1 ? '50%' : '100%' }}
          ></div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {step === 1 && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-2xl text-xs text-blue-300 flex items-start gap-4">
                  <User size={18} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">Please ensure your personal details match your government-issued ID exactly. Protocol mismatches will result in verification failure.</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-5">Legal Full Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
                      <input 
                        required 
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        className="tech-input-new w-full pl-14"
                        placeholder="First Middle Last"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-5">Date of Birth</label>
                      <div className="relative">
                        <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
                        <input 
                          type="date"
                          required 
                          value={formData.dob}
                          onChange={e => setFormData({...formData, dob: e.target.value})}
                          className="tech-input-new w-full pl-14"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-5">Nationality</label>
                      <div className="relative">
                        <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
                        <select 
                          value={formData.country}
                          onChange={e => setFormData({...formData, country: e.target.value})}
                          className="tech-input-new w-full pl-14 appearance-none"
                        >
                          <option value="Ethiopia">Ethiopia</option>
                          <option value="USA">United States</option>
                          <option value="Kenya">Kenya</option>
                          <option value="UAE">UAE</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-5">Document Type</label>
                      <div className="relative">
                        <FileText size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
                        <select 
                          value={formData.idType}
                          onChange={e => setFormData({...formData, idType: e.target.value as VerificationRequest['idType']})} // Fix: Ensure type is correctly cast
                          className="tech-input-new w-full pl-14 appearance-none"
                        >
                          <option value="NATIONAL_ID">National ID Card</option>
                          <option value="PASSPORT">Passport</option>
                          <option value="DRIVERS_LICENSE">Driver's License</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-5">ID Number</label>
                      <div className="relative">
                        <CreditCard size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 z-10" />
                        <input 
                          required 
                          value={formData.idNumber}
                          onChange={e => setFormData({...formData, idNumber: e.target.value})}
                          className="tech-input-new w-full pl-14"
                          placeholder="ID / Passport No."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-amber-900/10 border border-amber-500/20 p-5 rounded-2xl text-xs text-amber-300 flex items-start gap-4">
                  <ScanFace size={18} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">Images must be high-fidelity, clearly defined, and fully within the frame. Minimize glare for successful analysis.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">ID Front Side <span className="text-red-500">*</span></label>
                    <div className="relative group h-48 w-full rounded-[2rem] border-2 border-dashed border-slate-700 bg-slate-900/50 overflow-hidden flex items-center justify-center hover:border-lime-500/50 transition-all duration-500 group cursor-pointer shadow-inner">
                      {files.front ? (
                        <img src={files.front} className="w-full h-full object-cover" alt="ID Front" />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon size={32} className="mx-auto text-slate-600 mb-3 group-hover:text-lime-500/50 transition-colors" />
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Select ID Front</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange('front', e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">ID Back Side</label>
                    <div className="relative group h-48 w-full rounded-[2rem] border-2 border-dashed border-slate-700 bg-slate-900/50 overflow-hidden flex items-center justify-center hover:border-lime-500/50 transition-all duration-500 group cursor-pointer shadow-inner">
                      {files.back ? (
                        <img src={files.back} className="w-full h-full object-cover" alt="ID Back" />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon size={32} className="mx-auto text-slate-600 mb-3 group-hover:text-lime-500/50 transition-colors" />
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Select ID Back</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange('back', e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Security Selfie <span className="text-red-500">*</span></label>
                    <div className="relative group h-64 w-full rounded-[2.5rem] border-2 border-dashed border-slate-700 bg-slate-900/50 overflow-hidden flex items-center justify-center hover:border-lime-500/50 transition-all duration-500 group cursor-pointer shadow-inner">
                      {files.selfie ? (
                        <img src={files.selfie} className="w-full h-full object-cover" alt="Selfie" />
                      ) : (
                        <div className="text-center p-6">
                          <ScanFace size={48} className="mx-auto text-slate-600 mb-4 group-hover:text-lime-500/50 transition-colors" />
                          <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Upload Selfie with ID</p>
                          <p className="text-[10px] text-slate-600 mt-2 font-mono">NODE BIOMETRIC CAPTURE</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={(e) => handleFileChange('selfie', e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-800 bg-slate-900/80 flex justify-between items-center backdrop-blur-md">
          {step === 1 ? (
            <>
              <button onClick={onClose} className="px-8 py-3 rounded-full text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest font-tech">Abort Protocol</button>
              <button 
                onClick={() => setStep(2)}
                className="primary-gradient-new px-10 py-4 flex items-center gap-2"
              >
                Proceed to Biometrics
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-8 py-3 rounded-full text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest font-tech">Back</button>
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className="primary-gradient-new px-10 py-4 flex items-center gap-2"
              >
                {loading ? <><Loader2 size={18} className="animate-spin" /> SYNCHRONIZING...</> : <><ShieldCheck size={18} /> INITIALIZE VERIFICATION</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};