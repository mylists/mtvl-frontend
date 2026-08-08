import React, { useEffect, useState } from 'react';
import { Save, Star, X } from 'lucide-react';
import { getCategoryModule } from '../modules';
import { MediaItem, MediaStatus } from '../types';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MediaItem>) => Promise<void>;
  categoryType: string;
  initialData?: MediaItem | null;
}

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categoryType,
  initialData,
}) => {
  const module = getCategoryModule(categoryType);
  const FormFields = module.FormFields;

  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<MediaStatus>(module.defaultStatus);
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [customFormData, setCustomFormData] = useState<Record<string, any>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setStatus(initialData.status || module.defaultStatus);
      setRating(initialData.rating || 5);
      setNotes(initialData.notes || '');
      setCustomFormData({ ...initialData });
    } else {
      setTitle('');
      setStatus(module.defaultStatus);
      setRating(5);
      setNotes('');
      setCustomFormData(module.getDefaultFormState());
    }
    setError(null);
  }, [initialData, isOpen, categoryType]);

  if (!isOpen) return null;

  const handleCustomFormChange = (updates: Partial<Record<string, any>>) => {
    setCustomFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: Partial<MediaItem> = {
        ...customFormData,
        title: title.trim(),
        status,
        rating: Number(rating),
        notes: notes.trim(),
        categoryType: module.id,
      };

      if (initialData?.id) {
        payload.id = initialData.id;
      }

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err.message || 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-extrabold text-white mb-1">
          {initialData ? 'Edit' : 'Add New'} {module.singularName}
        </h2>
        <p className="text-xs text-slate-400 mb-5">Fill in the details below to update your tracking list.</p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              required
              placeholder={`e.g. Enter ${module.singularName} title`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
            />
          </div>

          {/* Plugged-in Category Custom Form Fields */}
          <FormFields formData={customFormData} onChange={handleCustomFormChange} />

          {/* Status & Rating Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MediaStatus)}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-sm font-medium bg-slate-900 cursor-pointer"
              >
                {module.statuses.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rating (1-5)</label>
              <div className="flex items-center space-x-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700 hover:text-slate-500'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Review</label>
            <textarea
              rows={3}
              placeholder="Personal thoughts, favorite quotes, review..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl ${module.color.button} text-white font-bold text-xs transition-all flex items-center space-x-1.5`}
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
