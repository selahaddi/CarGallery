import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export default function Dashboard() {
  const [contents, setContents] = useState([]);
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
  const [dragState, setDragState] = useState({ active: false, fromIndex: null, hoverIndex: null });
  const contentsRef = useRef([]);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    checkUser();
    fetchContents();
  }, []);

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
      year: content.year || '',
      mileage: content.mileage || '',
      price: content.price || '',
      down_payment: content.down_payment || '',
      monthly_rate: content.monthly_rate || '',
      interest_rate: content.interest_rate || '',
      term_months: content.term_months || '',
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

  // Drag and Drop Handlers
  const handleDragStart = useCallback((e, index) => {
    setDragState({ active: true, fromIndex: index, hoverIndex: index });
    e.dataTransfer.effectAllowed = 'move';
    // Use the row as drag image
    const row = e.target.closest?.('[data-drag-row]');
    if (row) {
      e.dataTransfer.setDragImage(row, 40, 24);
    }
  }, []);

  const handleDragEnter = useCallback((e, index) => {
    e.preventDefault();
    setDragState(prev => prev.active ? { ...prev, hoverIndex: index } : prev);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnd = useCallback(async () => {
    setDragState(prev => {
      const { fromIndex, hoverIndex } = prev;
      // Apply reorder to contents before resetting drag state
      if (fromIndex !== null && hoverIndex !== null && fromIndex !== hoverIndex) {
        setContents(currentContents => {
          const newList = [...currentContents];
          const [draggedItem] = newList.splice(fromIndex, 1);
          newList.splice(hoverIndex, 0, draggedItem);
          return newList;
        });
      }
      return { active: false, fromIndex: null, hoverIndex: null };
    });

    // Save sort_order to Supabase after a micro-delay for state to settle
    setActionLoading(true);
    try {
      await new Promise(r => setTimeout(r, 100));
      const currentList = contentsRef.current;
      if (currentList.length > 0) {
        const promises = currentList.map((item, idx) =>
          supabase.from('contents').update({ sort_order: idx }).eq('id', item.id)
        );
        const results = await Promise.all(promises);
        const failed = results.find(r => r.error);
        if (failed?.error) {
          if (failed.error.message.includes('sort_order')) {
            alert("⚠️ Sıralamayı kalıcı kaydetmek için lütfen Supabase SQL Editor'de şu komutu çalıştırın:\n\nALTER TABLE public.contents ADD COLUMN sort_order integer DEFAULT 0;");
          } else {
            console.error('Sort save error:', failed.error);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  }, []);

  const handleDragCancel = useCallback(() => {
    setDragState({ active: false, fromIndex: null, hoverIndex: null });
  }, []);

  // Compute a live-preview display list that reorders in real-time during drag
  const displayContents = useMemo(() => {
    const { active, fromIndex, hoverIndex } = dragState;
    if (!active || fromIndex === null || hoverIndex === null || fromIndex === hoverIndex) {
      return sortedContents;
    }
    const items = [...sortedContents];
    const [draggedItem] = items.splice(fromIndex, 1);
    items.splice(hoverIndex, 0, draggedItem);
    return items;
  }, [sortedContents, dragState]);

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
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Stats Panel */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-sora font-extrabold text-white tracking-tight" data-t="dash_title">{t('dash_title')}</h1>
            <p className="text-text-muted mt-2 max-w-md" data-t="dash_subtitle">Velocity Performance standartlarında araç ve içerik yönetimi.</p>
          </div>
          <div className="flex gap-3">
            <div className="glass-card px-4 py-3 rounded-2xl border-white/5 flex flex-col">
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Toplam Araç</span>
              <span className="text-xl font-sora font-bold text-white">{totalVehicles}</span>
            </div>
            <div className="glass-card px-4 py-3 rounded-2xl border-white/5 flex flex-col border-l-primary/30">
              <span className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Aktif Portföy</span>
              <span className="text-xl font-sora font-bold text-primary">€{activePortfolio}</span>
            </div>
          </div>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add / Edit Form Column (lg:col-span-5) */}
          <div className="lg:col-span-5">
            <div className="glass-card rounded-3xl p-8 sticky top-24 border-primary/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">
                    {editingId ? 'edit_square' : 'add_circle'}
                  </span>
                </div>
                <h2 className="text-xl font-sora font-bold text-white">
                  {editingId ? t('dash_form_edit') : t('dash_form_add')}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section: Vehicle Details */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-primary/80 uppercase tracking-widest pb-1 border-b border-white/5">Araç Detayları</p>
                  <div>
                    <label className="label-high-contrast" data-t="dash_label_title">{t('dash_label_title')}</label>
                    <input 
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                      placeholder="Örn: BMW M8 Competition" 
                      required 
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-high-contrast" data-t="dash_label_slug">{t('dash_label_slug')}</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                        placeholder="bmw-m8-competition" 
                        type="text"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label-high-contrast" data-t="dash_label_category">{t('dash_label_category')}</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                        placeholder="Örn: Spor Sedan, Süper SUV" 
                        type="text"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-high-contrast" data-t="dash_label_year">{t('dash_label_year')}</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                        placeholder="2024" 
                        type="number"
                        value={form.year}
                        onChange={(e) => setForm({ ...form, year: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label-high-contrast" data-t="dash_label_mileage">{t('dash_label_mileage')}</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                        placeholder="0" 
                        type="number"
                        value={form.mileage}
                        onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-high-contrast" data-t="dash_label_features">{t('dash_label_features')}</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                        placeholder="Carbon, Burmester, Panorama" 
                        type="text"
                        value={form.features}
                        onChange={(e) => setForm({ ...form, features: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label-high-contrast" data-t="dash_label_phone">{t('dash_label_phone')}</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted" 
                        placeholder="015737641145" 
                        type="text"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Pricing */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-primary/80 uppercase tracking-widest pb-1 border-b border-white/5">Finansal Veriler</p>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-high-contrast" data-t="dash_label_price">{t('dash_label_price')}</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-zinc-900/50 border border-white/10 focus:border-primary focus:ring-0 transition-all" 
                        placeholder="0.00" 
                        step="0.01" 
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label-high-contrast" data-t="dash_label_down">{t('dash_label_down')}</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all" 
                        placeholder="0.00" 
                        step="0.01" 
                        type="number"
                        value={form.down_payment}
                        onChange={(e) => setForm({ ...form, down_payment: e.target.value })}
                      />
                    </div>
                  </div>
                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <label className="label-high-contrast" data-t="dash_label_rate">{t('dash_label_rate')}</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all" 
                        placeholder="299" 
                        type="number"
                        value={form.monthly_rate}
                        onChange={(e) => setForm({ ...form, monthly_rate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label-high-contrast" data-t="dash_label_term">{t('dash_label_term')}</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all" 
                        placeholder="48" 
                        type="number"
                        value={form.term_months}
                        onChange={(e) => setForm({ ...form, term_months: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label-high-contrast" data-t="dash_label_interest">{t('dash_label_interest')}</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all" 
                        placeholder="2.99" 
                        step="0.01" 
                        type="number"
                        value={form.interest_rate}
                        onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Media & Description */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-primary/80 uppercase tracking-widest pb-1 border-b border-white/5">Medya & Açıklama</p>
                  
                  {/* Cover Image Upload */}
                  <div>
                    <label className="label-high-contrast">{t('dash_label_image')}</label>
                    <div className="relative flex gap-2">
                      <div className="relative flex-grow">
                        <input
                          type="text"
                          value={form.image_url}
                          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted"
                          placeholder="https://images.unsplash.com/..."
                        />
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">link</span>
                      </div>
                      <div className="relative w-12 flex-shrink-0 h-10">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          disabled={uploadingImage}
                          title="Bilgisayardan resim yükle"
                        />
                        <div className={`absolute inset-0 flex items-center justify-center rounded-xl border border-white/10 transition-all ${uploadingImage ? 'bg-primary/20 text-primary' : 'bg-zinc-900/50 hover:bg-primary/10 text-text-muted hover:text-primary'}`}>
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
                      <label className="label-high-contrast">{t('dash_label_gallery')}</label>
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
                        <div className={`text-xs px-3 py-1 rounded-lg border border-white/10 transition-all flex items-center justify-center cursor-pointer ${uploadingGallery ? 'bg-primary/20 text-primary' : 'bg-zinc-900/50 text-text-muted hover:text-primary hover:bg-primary/10'}`}>
                          {uploadingGallery ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : (
                            <span className="material-symbols-outlined text-[14px] mr-1">upload</span>
                          )}
                          Resim Seç
                        </div>
                      </div>
                    </div>
                    <textarea
                      rows="3"
                      value={form.images}
                      onChange={(e) => setForm({ ...form, images: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted resize-none font-mono text-xs"
                      placeholder="https://...&#10;https://..."
                    ></textarea>
                    <p className="text-[10px] text-text-muted mt-1">{t('dash_gallery_hint')}</p>
                  </div>

                  {/* Summary & Body */}
                  <div>
                    <label className="label-high-contrast" data-t="dash_label_summary">{t('dash_label_summary')}</label>
                    <textarea 
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted resize-none" 
                      placeholder="Vitrin kartı için kısa metin..." 
                      rows="2"
                      value={form.summary}
                      onChange={(e) => setForm({ ...form, summary: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="label-high-contrast" data-t="dash_label_body">{t('dash_label_body')}</label>
                    <textarea 
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-900/50 border border-white/10 text-white focus:border-primary focus:ring-0 transition-all placeholder:text-text-muted resize-none" 
                      placeholder="Detaylı araç açıklaması..." 
                      rows="4"
                      required
                      value={form.body}
                      onChange={(e) => setForm({ ...form, body: e.target.value })}
                    />
                  </div>

                  {/* Status checkbox */}
                  <div className="flex items-center gap-3 bg-zinc-900/30 p-3 rounded-xl border border-white/5">
                    <input
                      type="checkbox"
                      id="status"
                      checked={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.checked })}
                      className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-0 bg-zinc-900 border-white/10 cursor-pointer"
                    />
                    <label htmlFor="status" className="text-sm font-semibold text-white cursor-pointer select-none">
                      {t('dash_label_status')}
                    </label>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2 flex gap-3">
                  <button 
                    className="flex-1 bg-primary text-white py-4 px-6 rounded-2xl font-bold transition-all flex justify-center items-center gap-2 shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-75" 
                    type="submit"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined">save</span>
                        <span>{editingId ? "GÜNCELLE VE YAYINLA" : "KAYDET VE YAYINLA"}</span>
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
                      className="px-6 py-4 rounded-2xl bg-zinc-900/50 hover:bg-zinc-800 text-white font-semibold border border-white/10 transition-all active:scale-[0.98]"
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
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02]">
                <h2 className="text-xl font-sora font-bold text-white" data-t="dash_list_title">{t('dash_list_title')}</h2>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Manual Sort Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (sortBy === 'custom') {
                        setSortBy('newest');
                      } else {
                        setSortBy('custom');
                        setSearchTerm(''); // Clear search to enable drag-and-drop
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      sortBy === 'custom'
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-zinc-900/80 text-text-muted border-white/10 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px] leading-none">drag_indicator</span>
                    <span>Tut Sürükle Sırala</span>
                  </button>

                  {/* Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Araç ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-zinc-900/80 border border-white/10 text-xs rounded-lg pl-8 pr-3 py-1.5 font-medium text-white placeholder:text-text-muted outline-none w-40 focus:border-primary focus:ring-0 transition-all"
                    />
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-xs leading-none">search</span>
                  </div>

                  {/* Sort Select */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-text-muted font-bold">SIRALA:</span>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-zinc-900/80 border-none text-[10px] rounded-lg px-2.5 py-1.5 font-bold text-on-surface outline-none cursor-pointer focus:ring-0"
                    >
                      <option value="custom">Özel Sıralama (Sürükle)</option>
                      <option value="newest">En Yeni (Tarih)</option>
                      <option value="oldest">En Eski (Tarih)</option>
                      <option value="price_desc">Fiyat: Azalan</option>
                      <option value="price_asc">Fiyat: Artan</option>
                      <option value="year_desc">Yıl: En Yeni</option>
                      <option value="year_asc">Yıl: En Eski</option>
                      <option value="mileage_asc">Kilometre: En Düşük</option>
                      <option value="mileage_desc">Kilometre: En Yüksek</option>
                      <option value="name_asc">İsim: A-Z</option>
                      <option value="name_desc">İsim: Z-A</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-white/5" onDragLeave={handleDragCancel}>
                {displayContents.map((item, index) => {
                  const isDragSource = dragState.active && sortedContents[dragState.fromIndex]?.id === item.id;
                  const isHoverTarget = dragState.active && index === dragState.hoverIndex && !isDragSource;
                  return (
                    <div key={item.id} className="relative">
                      {/* Drop indicator line — appears ABOVE the hovered item */}
                      {isHoverTarget && dragState.hoverIndex <= dragState.fromIndex && (
                        <div className="absolute top-0 left-4 right-4 z-20 flex items-center pointer-events-none" style={{transform: 'translateY(-50%)'}}>
                          <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary shadow-lg shadow-primary/50 flex-shrink-0" />
                          <div className="flex-grow h-[3px] bg-gradient-to-r from-primary to-primary/40 rounded-full shadow-lg shadow-primary/30" />
                        </div>
                      )}
                      <div 
                        data-drag-row
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        className={`p-6 flex flex-col md:flex-row gap-6 hover:bg-white/[0.03] group relative
                          ${!item.status ? 'opacity-70' : ''}
                          ${isDragSource ? 'opacity-20 scale-[0.98] bg-primary/5 border-l-2 border-l-primary' : ''}
                          ${isHoverTarget ? 'bg-white/[0.04]' : ''}
                          transition-all duration-200 ease-out`}
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
                              {sortBy === 'custom' && !searchTerm && (
                                <div 
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, index)}
                                  onDragEnd={handleDragEnd}
                                  className={`p-2.5 rounded-xl transition-all border select-none ml-1
                                    ${dragState.active 
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
                      {/* Drop indicator line — appears BELOW the hovered item */}
                      {isHoverTarget && dragState.hoverIndex > dragState.fromIndex && (
                        <div className="absolute bottom-0 left-4 right-4 z-20 flex items-center pointer-events-none" style={{transform: 'translateY(50%)'}}>
                          <div className="w-3 h-3 rounded-full bg-primary border-2 border-primary shadow-lg shadow-primary/50 flex-shrink-0" />
                          <div className="flex-grow h-[3px] bg-gradient-to-r from-primary to-primary/40 rounded-full shadow-lg shadow-primary/30" />
                        </div>
                      )}
                    </div>
                  );
                })}

                {sortedContents.length === 0 && (
                  <div className="p-12 text-center text-text-muted italic text-sm">
                    {t('dash_empty_list')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
