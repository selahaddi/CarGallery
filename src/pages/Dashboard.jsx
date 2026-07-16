import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Loader2, Bell, X } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import DashboardRow from '../components/DashboardRow';

export default function Dashboard() {
  const [contents, setContents] = useState([]);
  const [offers, setOffers] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    title: '', 
    slug: '', 
    summary: '', 
    body: '', 
    image_url: '', 
    category: '', 
    tags: '', 
    status: true,
    year: '',
    mileage: '',
    price: '',
    down_payment: '',
    monthly_rate: '',
    interest_rate: '',
    term_months: '',
    phone: '',
    features: '',
    images: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [sortBy, setSortBy] = useState('custom'); 
  const [searchTerm, setSearchTerm] = useState('');
  const contentsRef = useRef([]);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    checkUser();
    fetchContents();
    fetchOffers();

    // Subscribe to realtime offers
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'offers'
        },
        (payload) => {
          const newOffer = payload.new;
          setToastMessage(`Yeni Teklif Geldi: ${newOffer.customer_name} (${newOffer.car_title || 'Araç'})`);
          setOffers((prev) => [newOffer, ...prev].slice(0, 10)); // Keep only 10
          setTimeout(() => setToastMessage(null), 5000); // Hide toast after 5s
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!error) {
      setOffers(data || []);
    }
  };

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    }
  };

  const fetchContents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      const sortedData = (data || []).sort((a, b) => {
        const orderA = a.sort_order !== null && a.sort_order !== undefined ? a.sort_order : 999999;
        const orderB = b.sort_order !== null && b.sort_order !== undefined ? b.sort_order : 999999;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      setContents(sortedData);
    }
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      
      setForm(prev => ({ ...prev, image_url: data.publicUrl }));
    } catch (error) {
      console.error("Upload error:", error);
      alert(t('dash_upload_error') || 'Resim yüklenirken hata oluştu: ' + error.message);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingGallery(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('images').getPublicUrl(fileName);
        uploadedUrls.push(data.publicUrl);
      }

      setForm(prev => {
        const existingImages = prev.images ? prev.images.trim() : '';
        const newImagesStr = uploadedUrls.join('\n');
        const finalImages = existingImages ? `${existingImages}\n${newImagesStr}` : newImagesStr;
        return { ...prev, images: finalImages };
      });
    } catch (error) {
      console.error("Gallery upload error:", error);
      alert(t('dash_upload_error') || 'Galeri yüklenirken hata oluştu: ' + error.message);
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);

    const generatedSlug = form.slug ? form.slug.trim() : form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const dataToSave = {
      title: form.title,
      slug: generatedSlug,
      summary: form.summary,
      body: form.body,
      image_url: form.image_url,
      category: form.category,
      status: form.status,
      tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      year: form.year ? parseInt(form.year, 10) : null,
      mileage: form.mileage ? parseInt(form.mileage, 10) : null,
      price: form.price ? parseFloat(form.price) : null,
      down_payment: form.down_payment ? parseFloat(form.down_payment) : null,
      monthly_rate: form.monthly_rate ? parseFloat(form.monthly_rate) : null,
      interest_rate: form.interest_rate ? parseFloat(form.interest_rate) : null,
      term_months: form.term_months ? parseInt(form.term_months, 10) : null,
      phone: form.phone || null,
      features: form.features ? form.features.split(',').map(f => f.trim()).filter(Boolean) : [],
      images: form.images ? form.images.split('\n').map(img => img.trim()).filter(Boolean) : []
    };

    if (editingId) {
      const { error } = await supabase
        .from('contents')
        .update({ ...dataToSave })
        .eq('id', editingId);
      
      if (!error) {
        setEditingId(null);
        setForm({ title: '', slug: '', summary: '', body: '', image_url: '', category: '', tags: '', status: true, year: '', mileage: '', price: '', down_payment: '', monthly_rate: '', interest_rate: '', term_months: '', phone: '', features: '', images: '' });
        fetchContents();
      } else {
        alert(t('dash_save_error') + error.message);
      }
    } else {
      const { error } = await supabase
        .from('contents')
        .insert([{ ...dataToSave }]);
        
      if (!error) {
        setForm({ title: '', slug: '', summary: '', body: '', image_url: '', category: '', tags: '', status: true, year: '', mileage: '', price: '', down_payment: '', monthly_rate: '', interest_rate: '', term_months: '', phone: '', features: '', images: '' });
        fetchContents();
      } else {
        alert(t('dash_add_error') + error.message);
      }
    }
    setActionLoading(false);
  };

  const handleEdit = (content) => {
    setEditingId(content.id);
    setForm({
      title: content.title || '',
      slug: content.slug || '',
      summary: content.summary || '',
      body: content.body || '',
      image_url: content.image_url || '',
      category: content.category || '',
      tags: content.tags ? content.tags.join(', ') : '',
      status: content.status ?? true,
      year: content.year ?? '',
      mileage: content.mileage ?? '',
      price: content.price ?? '',
      down_payment: content.down_payment ?? '',
      monthly_rate: content.monthly_rate ?? '',
      interest_rate: content.interest_rate ?? '',
      term_months: content.term_months ?? '',
      phone: content.phone || '',
      features: content.features ? content.features.join(', ') : '',
      images: content.images ? content.images.join('\n') : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('dash_confirm_delete'))) {
      const { error } = await supabase.from('contents').delete().eq('id', id);
      if (!error) {
        fetchContents();
      }
    }
  };

  // Keep a ref in sync with contents for use in async save
  useEffect(() => { contentsRef.current = contents; }, [contents]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id && over !== null) {
      let newOrder = [];
      setContents((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        newOrder = reordered;
        return reordered;
      });

      if (newOrder.length > 0) {
        setActionLoading(true);
        try {
          const promises = newOrder.map((item, idx) =>
            supabase.from('contents').update({ sort_order: idx }).eq('id', item.id)
          );
          const results = await Promise.all(promises);
          const failed = results.find(r => r.error);
          if (failed?.error) {
            console.error('Sort save error:', failed.error);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setActionLoading(false);
        }
      }
    }
  };

  // Calculate dynamic stats
  const totalVehicles = contents.length;
  const activePortfolioVal = contents
    .filter(item => item.status)
    .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  const activePortfolio = activePortfolioVal >= 1000000 
    ? `${(activePortfolioVal / 1000000).toFixed(1)}M` 
    : `${(activePortfolioVal / 1000).toFixed(0)}K`;

  // Filter and Sort logic
  const filteredContents = contents.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedContents = [...filteredContents].sort((a, b) => {
    if (sortBy === 'custom') {
      return 0; // maintain original array order from contents
    } else if (sortBy === 'price_desc') {
      return (b.price || 0) - (a.price || 0);
    } else if (sortBy === 'price_asc') {
      return (a.price || 0) - (b.price || 0);
    } else if (sortBy === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    } else if (sortBy === 'year_desc') {
      return (b.year || 0) - (a.year || 0);
    } else if (sortBy === 'year_asc') {
      return (a.year || 0) - (b.year || 0);
    } else if (sortBy === 'mileage_asc') {
      return (a.mileage || 0) - (b.mileage || 0);
    } else if (sortBy === 'mileage_desc') {
      return (b.mileage || 0) - (a.mileage || 0);
    } else if (sortBy === 'name_asc') {
      return (a.title || '').localeCompare(b.title || '', 'tr');
    } else if (sortBy === 'name_desc') {
      return (b.title || '').localeCompare(a.title || '', 'tr');
    } else {
      return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  if (loading && contents.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] pt-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <main className="pt-nav-height min-h-screen pb-12 relative z-10">
        {toastMessage && (
          <div className="fixed top-24 right-4 z-50 bg-surface-container/80 backdrop-blur-xl border border-accent-indigo/30 p-4 rounded-2xl shadow-[0_8px_32px_rgba(99,102,241,0.15)] flex items-start gap-3 w-80 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="mt-1 w-8 h-8 rounded-full bg-accent-indigo/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-4 h-4 text-accent-indigo" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-label-caps text-primary mb-1">Yeni Bildirim</h4>
              <p className="text-xs text-secondary leading-relaxed">{toastMessage}</p>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-secondary hover:text-primary transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="rail-system min-h-screen">
          <div className="rail-vertical"></div>
          <div className="max-w-container-max mx-auto px-4 sm:px-gutter pt-8">
            {/* Header Stats Panel */}
            <div className="mb-6 sm:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-h1-mobile sm:text-h1 font-h1 text-primary tracking-tight" data-t="dash_title">{t('dash_title')}</h1>
                <p className="text-secondary mt-2 max-w-md font-label-caps" data-t="dash_subtitle">{t('dash_panel_desc')}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="glass-panel px-4 py-3 rounded-2xl flex flex-col flex-1 min-w-[120px]">
                  <span className="text-[10px] text-secondary font-label-caps uppercase tracking-widest">{t('dash_stat_total')}</span>
                  <span className="text-xl font-h3 text-primary mt-1">{totalVehicles}</span>
                </div>
                <div className="glass-panel px-4 py-3 rounded-2xl flex flex-col flex-1 min-w-[120px]">
                  <span className="text-[10px] text-secondary font-label-caps uppercase tracking-widest">{t('dash_stat_portfolio')}</span>
                  <span className="text-xl font-h3 text-accent-indigo mt-1">€{activePortfolio}</span>
                </div>
              </div>
            </div>

            {/* Recent Offers Panel */}
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-accent-indigo">receipt_long</span>
                </div>
                <h2 className="text-h3 font-h3 text-primary">Son Gelen Teklifler</h2>
              </div>
              <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="inline-block min-w-full align-middle">
                  {offers.length === 0 ? (
                    <p className="text-sm text-secondary italic">Henüz bir teklif bulunmamaktadır.</p>
                  ) : (
                    <table className="min-w-full divide-y divide-border-subtle">
                      <thead>
                        <tr>
                          <th className="py-3 px-4 text-left text-xs font-label-caps text-secondary uppercase tracking-wider whitespace-nowrap">Tarih</th>
                          <th className="py-3 px-4 text-left text-xs font-label-caps text-secondary uppercase tracking-wider whitespace-nowrap">Müşteri</th>
                          <th className="py-3 px-4 text-left text-xs font-label-caps text-secondary uppercase tracking-wider whitespace-nowrap">Araç</th>
                          <th className="py-3 px-4 text-right text-xs font-label-caps text-secondary uppercase tracking-wider whitespace-nowrap">Peşinat</th>
                          <th className="py-3 px-4 text-right text-xs font-label-caps text-secondary uppercase tracking-wider whitespace-nowrap">Aylık</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle/50">
                        {offers.map(offer => (
                          <tr key={offer.id} className="hover:bg-surface-container/30 transition-colors">
                            <td className="py-3 px-4 text-sm text-secondary whitespace-nowrap">
                              {new Date(offer.created_at).toLocaleDateString('tr-TR')} {new Date(offer.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                            </td>
                            <td className="py-3 px-4 text-sm text-primary whitespace-nowrap">
                              <div>{offer.customer_name}</div>
                              <div className="text-xs text-secondary/70">{offer.customer_phone || offer.customer_email}</div>
                            </td>
                            <td className="py-3 px-4 text-sm text-secondary whitespace-nowrap">{offer.car_title}</td>
                            <td className="py-3 px-4 text-sm text-primary font-medium text-right whitespace-nowrap">€{offer.down_payment || 0}</td>
                            <td className="py-3 px-4 text-sm text-accent-indigo font-medium text-right whitespace-nowrap">€{offer.monthly_rate || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Add / Edit Form Column (lg:col-span-5) */}
              <div className="lg:col-span-5">
                <div className="glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:sticky lg:top-28">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">
                        {editingId ? 'edit_square' : 'add_circle'}
                      </span>
                    </div>
                    <h2 className="text-h3 font-h3 text-primary">
                      {editingId ? t('dash_form_edit') : t('dash_form_add')}
                    </h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section: Vehicle Details */}
                    <div className="space-y-4">
                      <p className="text-xs font-label-caps text-secondary uppercase tracking-widest pb-1 border-b border-border-subtle">{t('dash_section_vehicle')}</p>
                      <div>
                        <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1" data-t="dash_label_title">{t('dash_label_title')}</label>
                        <input 
                          className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40" 
                          placeholder="Örn: BMW M8 Competition" 
                          required 
                          type="text"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1" data-t="dash_label_slug">{t('dash_label_slug')}</label>
                          <input 
                            className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40" 
                            placeholder="bmw-m8-competition" 
                            type="text"
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1" data-t="dash_label_category">{t('dash_label_category')}</label>
                          <input 
                            className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40" 
                            placeholder="Örn: Spor Sedan" 
                            type="text"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1" data-t="dash_label_year">{t('dash_label_year')}</label>
                          <input 
                            className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40" 
                            placeholder="2024" 
                            type="number"
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            value={form.year}
                            onChange={(e) => setForm({ ...form, year: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1" data-t="dash_label_mileage">{t('dash_label_mileage')}</label>
                          <input 
                            className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40" 
                            placeholder="0" 
                            type="number"
                            min="0"
                            value={form.mileage}
                            onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1" data-t="dash_label_features">{t('dash_label_features')}</label>
                          <input 
                            className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40" 
                            placeholder="Carbon, Burmester" 
                            type="text"
                            value={form.features}
                            onChange={(e) => setForm({ ...form, features: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1" data-t="dash_label_phone">{t('dash_label_phone')}</label>
                          <input 
                            className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40" 
                            placeholder="015737641145" 
                            type="text"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: Tags */}
                    <div>
                      <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1">{t('dash_label_tags')}</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40" 
                        placeholder="BMW, M8, Sedan" 
                        type="text"
                        value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      />
                    </div>

                    {/* Section: Pricing */}
                    <div className="space-y-4">
                      <p className="text-xs font-label-caps text-secondary uppercase tracking-widest pb-1 border-b border-border-subtle">{t('dash_section_finance')}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1" data-t="dash_label_price">{t('dash_label_price')}</label>
                          <input 
                            className="w-full px-4 py-3 rounded-xl text-sm font-bold text-primary bg-surface-container-low border border-border-subtle focus:border-accent-indigo focus:ring-0 transition-colors" 
                            placeholder="0.00" 
                            step="0.01" 
                            type="number"
                            min="0"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1" data-t="dash_label_down">{t('dash_label_down')}</label>
                          <input 
                            className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40" 
                            placeholder="0.00" 
                            step="0.01" 
                            type="number"
                            min="0"
                            value={form.down_payment}
                            onChange={(e) => setForm({ ...form, down_payment: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1" data-t="dash_label_rate">{t('dash_label_rate')}</label>
                          <input 
                            className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40" 
                            placeholder="299" 
                            type="number"
                            min="0"
                            value={form.monthly_rate}
                            onChange={(e) => setForm({ ...form, monthly_rate: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1" data-t="dash_label_term">{t('dash_label_term')}</label>
                          <input 
                            className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40" 
                            placeholder="48" 
                            type="number"
                            min="1"
                            max="120"
                            value={form.term_months}
                            onChange={(e) => setForm({ ...form, term_months: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1" data-t="dash_label_interest">{t('dash_label_interest')}</label>
                          <input 
                            className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40" 
                            placeholder="2.99" 
                            step="0.01" 
                            type="number"
                            min="0"
                            max="100"
                            value={form.interest_rate}
                            onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Section: Media & Description */}
                    <div className="space-y-4">
                      <p className="text-xs font-label-caps text-secondary uppercase tracking-widest pb-1 border-b border-border-subtle">{t('dash_section_media')}</p>
                      
                      {/* Cover Image Upload */}
                      <div>
                        <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1">{t('dash_label_image')}</label>
                        <div className="relative flex gap-2">
                          <div className="relative flex-grow">
                            <input
                              type="text"
                              value={form.image_url}
                              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40"
                              placeholder="https://images.unsplash.com/..."
                            />
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary/60 text-sm">link</span>
                          </div>
                          <div className="relative w-12 flex-shrink-0 h-11">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              disabled={uploadingImage}
                              title="Bilgisayardan resim yükle"
                            />
                            <div className={`absolute inset-0 flex items-center justify-center rounded-xl border border-border-subtle transition-all ${uploadingImage ? 'bg-accent-indigo/10 text-accent-indigo' : 'bg-surface-container hover:bg-surface-container-low text-secondary hover:text-primary'}`}>
                              {uploadingImage ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <span className="material-symbols-outlined text-lg">upload</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Gallery Upload */}
                      <div>
                        <div className="flex justify-between items-end mb-1">
                          <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1">{t('dash_label_gallery')}</label>
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*"
                              multiple
                              onChange={handleGalleryUpload}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              disabled={uploadingGallery}
                              title="Bilgisayardan çoklu resim yükle"
                            />
                            <div className={`text-xs px-3 py-1.5 rounded-lg border border-border-subtle transition-all flex items-center justify-center cursor-pointer ${uploadingGallery ? 'bg-accent-indigo/10 text-accent-indigo' : 'bg-surface-container text-secondary hover:text-primary hover:bg-surface-container-low'}`}>
                              {uploadingGallery ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              ) : (
                                <span className="material-symbols-outlined text-[14px] mr-1">upload</span>
                              )}
                              {t('dash_btn_select_img')}
                            </div>
                          </div>
                        </div>
                        <textarea
                          rows="3"
                          value={form.images}
                          onChange={(e) => setForm({ ...form, images: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40 resize-none font-mono text-xs"
                          placeholder="https://...&#10;https://..."
                        ></textarea>
                        <p className="text-[10px] text-secondary mt-1">{t('dash_gallery_hint')}</p>
                      </div>

                      {/* Summary & Body */}
                      <div>
                        <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1" data-t="dash_label_summary">{t('dash_label_summary')}</label>
                        <textarea 
                          className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40 resize-none" 
                          placeholder="Vitrin kartı için kısa metin..." 
                          rows="2"
                          value={form.summary}
                          onChange={(e) => setForm({ ...form, summary: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block font-label-caps text-label-caps text-secondary mb-1 pl-1" data-t="dash_label_body">{t('dash_label_body')}</label>
                        <textarea 
                          className="w-full px-4 py-3 rounded-xl text-sm bg-surface-container-low border border-border-subtle text-primary focus:border-accent-indigo focus:ring-0 transition-colors placeholder:text-secondary/40 resize-none" 
                          placeholder="Detaylı araç açıklaması..." 
                          rows="4"
                          required
                          value={form.body}
                          onChange={(e) => setForm({ ...form, body: e.target.value })}
                        />
                      </div>

                      {/* Status checkbox */}
                      <div className="flex items-center gap-3 bg-surface-container p-3 rounded-xl border border-border-subtle">
                        <input
                          type="checkbox"
                          id="status"
                          checked={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.checked })}
                          className="w-4 h-4 rounded text-accent-indigo focus:ring-accent-indigo bg-surface-container border-border-subtle cursor-pointer"
                        />
                        <label htmlFor="status" className="text-sm font-label-caps text-primary cursor-pointer select-none">
                          {t('dash_label_status')}
                        </label>
                      </div>
                    </div>

                    {/* Submit button */}
                    <div className="pt-2 flex gap-3">
                      <button 
                        className="flex-1 bg-primary text-on-primary py-4 px-6 rounded-xl font-label-caps text-label-caps transition-all flex justify-center items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:bg-secondary active:scale-[0.98] disabled:opacity-75" 
                        type="submit"
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <span className="material-symbols-outlined">save</span>
                            <span>{editingId ? t('dash_btn_update') : t('dash_btn_publish')}</span>
                          </>
                        )}
                      </button>

                      {editingId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setForm({ title: '', slug: '', summary: '', body: '', image_url: '', category: '', tags: '', status: true, year: '', mileage: '', price: '', down_payment: '', monthly_rate: '', interest_rate: '', term_months: '', phone: '', features: '', images: '' });
                          }}
                          className="px-6 py-4 rounded-xl bg-surface-container hover:bg-surface-container-low text-primary font-label-caps text-label-caps border border-border-subtle transition-all active:scale-[0.98]"
                        >
                          {t('dash_btn_cancel')}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* List Section Column (lg:col-span-7) */}
              <div className="lg:col-span-7">
                <div className="glass-panel rounded-2xl sm:rounded-3xl overflow-hidden">
                  <div className="p-4 sm:p-8 border-b border-border-subtle flex flex-col gap-4 bg-surface-container">
                    <h2 className="text-h3 font-h3 text-primary" data-t="dash_list_title">{t('dash_list_title')}</h2>
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Manual Sort Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (sortBy === 'custom') {
                            setSortBy('newest');
                          } else {
                            setSortBy('custom');
                            setSearchTerm('');
                          }
                        }}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-label-caps transition-all border flex-shrink-0 ${
                          sortBy === 'custom'
                            ? 'bg-primary text-on-primary border-primary shadow-sm'
                            : 'bg-surface-container-low text-secondary border-border-subtle hover:text-primary hover:border-border-subtle/80'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px] leading-none">drag_indicator</span>
                        <span className="hidden sm:inline">{t('dash_sort_drag')}</span>
                        <span className="sm:hidden">{t('dash_sort_drag_short')}</span>
                      </button>

                      {/* Search Input */}
                      <div className="relative flex-1 min-w-[150px]">
                        <input
                          type="text"
                          placeholder={t('dash_search_placeholder')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-surface-container-low border border-border-subtle text-xs rounded-lg pl-9 pr-3 py-2 font-medium text-primary placeholder:text-secondary/50 outline-none focus:border-accent-indigo transition-colors"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary/60 text-[18px]">search</span>
                      </div>

                      {/* Sort Select */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-secondary font-label-caps flex-shrink-0 hidden sm:inline-block">{t('dash_sort_label')}</span>
                        <select 
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-surface-container-low border border-border-subtle text-xs rounded-lg px-3 py-2 font-medium text-primary outline-none cursor-pointer focus:border-accent-indigo transition-colors"
                        >
                          <option value="custom">{t('dash_sort_custom')}</option>
                          <option value="newest">{t('dash_sort_newest')}</option>
                          <option value="oldest">{t('dash_sort_oldest')}</option>
                          <option value="price_desc">{t('dash_sort_price_desc')}</option>
                          <option value="price_asc">{t('dash_sort_price_asc')}</option>
                          <option value="year_desc">{t('dash_sort_year_desc')}</option>
                          <option value="year_asc">{t('dash_sort_year_asc')}</option>
                          <option value="mileage_asc">{t('dash_sort_mileage_asc')}</option>
                          <option value="mileage_desc">{t('dash_sort_mileage_desc')}</option>
                          <option value="name_asc">{t('dash_sort_name_asc')}</option>
                          <option value="name_desc">{t('dash_sort_name_desc')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                  >
                    <div className="divide-y divide-border-subtle">
                      <SortableContext 
                        items={sortedContents.map(item => item.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {sortedContents.map((item) => (
                          <DashboardRow 
                            key={item.id} 
                            item={item} 
                            handleEdit={handleEdit} 
                            handleDelete={handleDelete}
                            t={t}
                            sortBy={sortBy}
                            searchTerm={searchTerm}
                          />
                        ))}
                      </SortableContext>

                      {sortedContents.length === 0 && (
                        <div className="p-12 text-center text-secondary italic text-sm">
                          {t('dash_empty_list')}
                        </div>
                      )}
                    </div>
                  </DndContext>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
