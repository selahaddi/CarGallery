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
        className={`p-4 sm:p-6 flex flex-col md:flex-row gap-4 sm:gap-6 hover:bg-surface-container-low group relative transition-all duration-200 ease-out
          ${!item.status ? 'opacity-70' : ''}
          ${isDragging ? 'bg-surface-container border-l-2 border-l-primary' : 'border-l-2 border-transparent'}
        `}
      >
        {/* Image Block */}
        <div className={`w-full md:w-48 h-32 rounded-2xl overflow-hidden relative flex-shrink-0 shadow-sm border border-border-subtle ${!item.status ? 'grayscale' : ''}`}>
          {item.image_url ? (
            <img 
              alt={item.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              src={item.image_url} 
            />
          ) : (
            <div className="w-full h-full bg-surface-container flex items-center justify-center text-[10px] font-bold text-secondary uppercase">
              {t('dash_no_img')}
            </div>
          )}
          {item.category && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-surface/80 backdrop-blur-md rounded text-[10px] font-bold text-primary border border-border-subtle uppercase tracking-widest">
              {item.category}
            </div>
          )}
        </div>

        {/* Content Details Block */}
        <div className="flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4">
              <h3 className="font-h3 text-primary text-lg leading-tight group-hover:text-accent-indigo transition-colors">{item.title}</h3>
              {item.status ? (
                <span className="px-2 py-1 text-[10px] font-black rounded bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald uppercase tracking-tighter">
                  {t('dash_active')}
                </span>
              ) : (
                <span className="px-2 py-1 text-[10px] font-black rounded bg-secondary/10 border border-secondary/20 text-secondary uppercase tracking-tighter">
                  {t('dash_passive')}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 font-label-caps text-label-caps text-secondary font-medium">
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
                <span className="flex items-center gap-1 font-bold text-primary">
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
                  <div className="bg-accent-indigo/5 px-3 py-1.5 rounded-lg border border-accent-indigo/10">
                    <span className="text-[10px] text-accent-indigo font-bold">€{parseFloat(item.monthly_rate).toLocaleString('de-DE')} / Ay</span>
                  </div>
                )
              ) : (
                <span className="text-[10px] text-secondary italic">Satıldı / Stokta Yok</span>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => handleEdit(item)}
                className="p-2.5 bg-surface-container-low rounded-xl text-primary hover:bg-primary hover:text-on-primary transition-all border border-border-subtle shadow-sm"
                title="Düzenle"
              >
                <span className="material-symbols-outlined text-sm leading-none block">edit</span>
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-2.5 bg-surface-container-low rounded-xl text-secondary hover:text-error hover:bg-error/10 transition-all border border-border-subtle shadow-sm"
                title="Sil"
              >
                <span className="material-symbols-outlined text-sm leading-none block">delete</span>
              </button>
              {isCustomSort && (
                <div 
                  {...attributes}
                  {...listeners}
                  className={`p-2.5 rounded-xl transition-all border select-none ml-1 shadow-sm
                    ${isDragging 
                      ? 'bg-primary/10 text-primary border-primary/30 cursor-grabbing' 
                      : 'bg-surface-container-low text-secondary hover:text-primary border-border-subtle cursor-grab'}
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
