import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function DashboardRow({ item, handleEdit, handleDelete, t, sortBy, searchTerm }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const isCustomSort = sortBy === 'custom' && !searchTerm;

  return (
    <div ref={setNodeRef} style={style} className={`relative bg-transparent ${isDragging ? 'shadow-2xl shadow-primary/20 scale-[1.02] z-50 rounded-2xl overflow-hidden' : ''}`}>
      <div 
        className={`p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-6 hover:bg-white/[0.03] group relative transition-all duration-200 ease-out
          ${!item.status ? 'opacity-70' : ''}
          ${isDragging ? 'bg-zinc-900 border-l-2 border-l-primary' : 'border-l-2 border-transparent'}
        `}
      >
        {/* Image Block */}
        <div className={`w-full md:w-48 h-32 rounded-2xl overflow-hidden relative flex-shrink-0 shadow-lg ${!item.status ? 'grayscale' : ''}`}>
          {item.image_url ? (
            <img 
              alt={item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src={item.image_url} 
            />
          ) : (
            <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-[10px] font-bold text-text-muted uppercase">
              {t('dash_no_img')}
            </div>
          )}
          {item.category && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[10px] font-bold text-white border border-white/10 uppercase tracking-widest">
              {item.category}
            </div>
          )}
        </div>

        {/* Content Details Block */}
        <div className="flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4">
              <h3 className="font-sora font-bold text-white text-lg leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
              {item.status ? (
                <span className="px-2 py-1 text-[10px] font-black rounded bg-green-500/10 border border-green-500/30 text-green-400 uppercase tracking-tighter">
                  {t('dash_active')}
                </span>
              ) : (
                <span className="px-2 py-1 text-[10px] font-black rounded bg-white/10 border border-white/20 text-white/50 uppercase tracking-tighter">
                  {t('dash_passive')}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-text-muted font-medium">
              {item.year && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span> 
                  {item.year}
                </span>
              )}
              {item.mileage !== null && item.mileage !== undefined && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">speed</span> 
                  {parseFloat(item.mileage).toLocaleString('de-DE')} km
                </span>
              )}
              {item.price && (
                <span className="flex items-center gap-1 font-bold text-white">
                  €{parseFloat(item.price).toLocaleString('de-DE')}
                </span>
              )}
            </div>
          </div>

          {/* Bottom row actions & finance */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {item.status ? (
                item.monthly_rate && (
                  <div className="bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">
                    <span className="text-[10px] text-primary font-bold">€{parseFloat(item.monthly_rate).toLocaleString('de-DE')} / Ay</span>
                  </div>
                )
              ) : (
                <span className="text-[10px] text-text-muted italic">Satıldı / Stokta Yok</span>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => handleEdit(item)}
                className="p-2.5 glass rounded-xl text-primary hover:bg-primary hover:text-white transition-all border border-white/5"
                title="Düzenle"
              >
                <span className="material-symbols-outlined text-sm leading-none block">edit</span>
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-2.5 glass rounded-xl text-text-muted hover:text-error hover:bg-error/10 transition-all border border-white/5"
                title="Sil"
              >
                <span className="material-symbols-outlined text-sm leading-none block">delete</span>
              </button>
              {isCustomSort && (
                <div 
                  {...attributes}
                  {...listeners}
                  className={`p-2.5 rounded-xl transition-all border select-none ml-1
                    ${isDragging 
                      ? 'bg-primary/10 text-primary border-primary/30 cursor-grabbing' 
                      : 'glass text-text-muted hover:text-primary border-white/5 cursor-grab'}
                  `}
                  title="Sıralamak için tut ve sürükle"
                >
                  <span className="material-symbols-outlined text-sm leading-none block">drag_indicator</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
