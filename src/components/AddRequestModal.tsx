import React, { useState } from 'react';
import { ShoppingItemRequest } from '../types';
import { X, Upload, Plus, Minus, Image as ImageIcon } from 'lucide-react';

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
  const [requesterName, setRequesterName] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterName.trim() || !productName.trim() || quantity <= 0) {
      return;
    }

    onSubmit({
      requesterName: requesterName.trim(),
      productName: productName.trim(),
      quantity,
      imageUrl: imageUrl.trim() || undefined,
      notes: remarks.trim() || undefined,
      category: 'other',
      estimatedPriceJpy: 0,
      priority: 'must_buy',
    });

    // Reset fields for the next entry
    setProductName('');
    setQuantity(1);
    setImageUrl('');
    setRemarks('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 no-print overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Add Item to Buy</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit a shopping request for Japan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Simplified Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Requester Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Requester Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Sarah, Ken, Mom"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-medium"
            />
            {existingRequesters.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400">Quick select:</span>
                {existingRequesters.map((req) => (
                  <button
                    type="button"
                    key={req}
                    onClick={() => setRequesterName(req)}
                    className={`text-[11px] px-2.5 py-0.5 rounded-md transition-colors ${
                      requesterName === req
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {req}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Product to Buy */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Product to Buy <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Melano CC Vitamin C Essence, Tokyo Banana, KitKat Matcha"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent font-medium"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Identical products requested by different people will automatically merge together.
            </p>
          </div>

          {/* 3. Quantity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quantity <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center py-2 text-base font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <div className="flex gap-1.5 ml-2">
                {[1, 2, 3, 5].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setQuantity(val)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors font-medium ${
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

          {/* 4. Product Image */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Product Image
            </label>
            <div className="flex flex-col sm:flex-row gap-3.5 items-start">
              {/* Image Thumbnail / Preview */}
              <div className="w-24 h-24 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-400 p-2">
                    <ImageIcon className="w-6 h-6 mx-auto stroke-[1.5]" />
                    <span className="text-[10px] mt-1 block">No Image</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-xs">
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
                      className="text-xs text-rose-600 hover:underline font-medium"
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

          {/* 5. Remarks if any */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Remarks <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Yellow tube only, size 20ml, get matcha flavor, tax-free if possible"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
            />
          </div>

          {/* Modal Actions */}
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
              className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm shadow-rose-200"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
