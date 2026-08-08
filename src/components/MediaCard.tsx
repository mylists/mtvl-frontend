import React from 'react';
import { CheckCircle, Clock, Edit3, Eye, Star, Trash2, XCircle } from 'lucide-react';
import { getCategoryModule } from '../modules';
import { MediaItem, MediaStatus } from '../types';

interface MediaCardProps {
  item: MediaItem;
  onEdit: (item: MediaItem) => void;
  onDelete: (id: number) => void;
  onUpdateProgress?: (item: MediaItem, increment: number) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onEdit,
  onDelete,
  onUpdateProgress,
}) => {
  const module = getCategoryModule(item.categoryType);
  const CategoryIcon = module.icon;
  const CardDetails = module.CardDetails;

  const getStatusBadge = (status: MediaStatus) => {
    const isBook = module.id === 'books';
    switch (status) {
      case 'watching':
      case 'reading':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Eye className="w-3 h-3" />
            <span>{isBook ? 'Reading' : 'Watching'}</span>
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'plan_to_watch':
      case 'plan_to_read':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>Plan to {isBook ? 'Read' : 'Watch'}</span>
          </span>
        );
      case 'dropped':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            <span>Dropped</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
            <span>{status.replace(/_/g, ' ')}</span>
          </span>
        );
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`glass-card rounded-2xl p-5 flex flex-col justify-between group relative overflow-hidden ${module.color.borderHover} transition-all`}>
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`p-1 rounded-lg bg-slate-800 ${module.color.iconText}`}>
                <CategoryIcon className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {module.displayName}
              </span>
            </div>
            <h3 className="font-extrabold text-white text-base leading-snug line-clamp-2 group-hover:text-indigo-300 transition-colors">
              {item.title}
            </h3>
          </div>

          {getStatusBadge(item.status)}
        </div>

        {/* Plugged-in Module Specific Card Details */}
        <div className="mb-4">
          <CardDetails item={item} onUpdateProgress={onUpdateProgress} />

          {item.notes && (
            <p className="text-slate-400 italic text-[11px] line-clamp-2 pt-1 border-t border-slate-800/60 mt-2">
              "{item.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Footer Rating & Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div>{renderStars(item.rating)}</div>

        <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Edit item"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
