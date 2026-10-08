import React, { useState } from 'react';
import { ShoppingItemRequest, StoreCategory } from '../types';
import { STORE_CATEGORIES } from '../data/storeCategories';
import { POPULAR_JAPAN_PRESETS, JapanProductPreset } from '../data/presets';
import { X, Upload, Plus, Minus, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

interface AddRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<ShoppingItemRequest, 'id' | 'createdAt'>) => void;
  existingRequesters: string[];
}

export const AddRequestModal: React.FC<AddRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingRequesters,
}) => {
  const [productName, setProductName] = useState('');
  const [japaneseName, setJapaneseName] = useState('');
  const [category, setCategory] = useState<StoreCategory>('drugstore');
  const [quantity, setQuantity] = useState(1);
  const [requesterName, setRequesterName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [estimatedPriceJpy, setEstimatedPriceJpy] = useState<number | ''>(1200);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'must_buy' | 'nice_to_have'>('must_buy');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: JapanProductPreset) => {
    setSelectedPresetId(preset.id);
    setProductName(preset.name);
    setJapaneseName(preset.japaneseName);
    setCategory(preset.category);
    setImageUrl(preset.imageUrl);
    setEstimatedPriceJpy(preset.estimatedPriceJpy);
    if (preset.popularNote && !notes) {
      setNotes(preset.popularNote);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          setSelectedPresetId(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !requesterName.trim() || quantity <= 0) {
      return;
    }

    onSubmit({
      productName: productName.trim(),
      japaneseName: japaneseName.trim() || undefined,
      category,
      quantity,
      requesterName: requesterName.trim(),
      imageUrl: imageUrl.trim() || undefined,
      estimatedPriceJpy: Number(estimatedPriceJpy) || 0,
      notes: notes.trim() || undefined,
      priority,
    });

    // Reset form
    setProductName('');
    setJapaneseName('');
    setQuantity(1);
    setImageUrl('');
    setNotes('');
    setSelectedPresetId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 no-print overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Submit Japan Shopping Request
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Add an item you want the buyer to purchase for you in Japan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick presets picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Popular Japan Souvenir Presets (Quick Fill)
              </span>
              <span className="text-[11px] font-normal text-slate-400">Click to autofill</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POPULAR_JAPAN_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className={`text-left p-2 rounded-xl border text-xs transition-all flex items-center gap-2.5 ${
                    selectedPresetId === preset.id
                      ? 'border-rose-500 bg-rose-50/60 ring-1 ring-rose-500'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={preset.imageUrl}
                    alt={preset.name}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200/60"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 truncate leading-tight">
                      {preset.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      ¥{preset.estimatedPriceJpy.toLocaleString()}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Requester Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Requester Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sarah, Ken, Mom"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              {existingRequesters.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="text-[11px] text-slate-400 self-center">Recent:</span>
                  {existingRequesters.map((req) => (
                    <button
                      type="button"
                      key={req}
                      onClick={() => setRequesterName(req)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {req}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center py-2 text-sm font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="flex gap-1 ml-2">
                  {[1, 2, 3, 5].map((val) => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setQuantity(val)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        quantity === val
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Product Name (English / Romaji) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Melano CC Vitamin C Essence (20ml)"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tip: When multiple people enter the same product name, the app automatically consolidates them for the buyer!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Japanese Name (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Japanese Name (日本語) <span className="text-slate-400 font-normal">(Helpful for store clerks)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. メラノCC 薬用しみ集中対策美容液"
                value={japaneseName}
                onChange={(e) => setJapaneseName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            {/* Target Store */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Recommended Store / Location
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StoreCategory)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                {Object.values(STORE_CATEGORIES).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.japaneseName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Product Image Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Product Image <span className="text-slate-400 font-normal">(Upload photo or paste URL)</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Preview Box */}
              <div className="w-24 h-24 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Product preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-300" />
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  placeholder="Or paste direct image URL (https://...)"
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Estimated Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estimated Price in JPY (¥)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-slate-400 font-bold">¥</span>
                <input
                  type="number"
                  min="0"
                  placeholder="1200"
                  value={estimatedPriceJpy}
                  onChange={(e) =>
                    setEstimatedPriceJpy(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent tabular-nums font-medium"
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Purchase Priority
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('must_buy')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    priority === 'must_buy'
                      ? 'border-rose-600 bg-rose-50 text-rose-700 font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Must-Buy (最高優先)
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('nice_to_have')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    priority === 'nice_to_have'
                      ? 'border-slate-800 bg-slate-100 text-slate-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Nice to Have (あれば)
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Specific Notes / Variations / Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Size 20ml, yellow tube only, get tax-free if possible"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm shadow-rose-200"
            >
              Add to Japan Shopping List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
