/**
 * Galeri Yerel Supabase İstemci Emülatörü
 * Dış Supabase bulut bağımlılığını tamamen ortadan kaldırır.
 * Mevcut frontend kodunu bozmadan yerel SQLite API'sine yönlendirir.
 */

import fallbackContents from '../yedekler/contents.json';

const API_BASE = '/api';

class LocalQueryBuilder {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.orderBy = null;
    this.limitVal = null;
    this.action = 'select';
    this.payload = null;
  }

  select() {
    this.action = 'select';
    return this;
  }

  eq(column, value) {
    this.filters.push({ column, value });
    return this;
  }

  order(column, options = {}) {
    this.orderBy = { column, ascending: options.ascending !== false };
    return this;
  }

  limit(count) {
    this.limitVal = count;
    return this;
  }

  insert(data) {
    this.action = 'insert';
    this.payload = data;
    return this;
  }

  update(data) {
    this.action = 'update';
    this.payload = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  // Promise arayüzü (await desteği için)
  async then(resolve, reject) {
    try {
      const result = await this.execute();
      resolve(result);
    } catch (err) {
      if (reject) {
        reject(err);
      } else {
        resolve({ data: null, error: { message: err.message || 'Bilinmeyen hata' } });
      }
    }
  }

  async execute() {
    const token = localStorage.getItem('galeri_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 1. SELECT İŞLEMİ
    if (this.action === 'select') {
      if (this.table === 'contents') {
        // Tekil kayıt sorgusu (slug veya id ile)
        const slugOrIdFilter = this.filters.find(f => f.column === 'slug' || f.column === 'id');
        if (slugOrIdFilter) {
          try {
            const resp = await fetch(`${API_BASE}/contents/${encodeURIComponent(slugOrIdFilter.value)}`, { headers });
            if (resp.ok) {
              const cType = resp.headers.get('content-type');
              if (cType && cType.includes('application/json')) {
                const item = await resp.json();
                return { data: this.isSingle ? item : [item], error: null };
              }
            }
          } catch (e) {
            console.warn('API fetch failed, using fallback:', e);
          }

          // Fallback: Yerel JSON verisinden tekil kayıt bul
          const target = String(slugOrIdFilter.value).toLowerCase();
          const found = fallbackContents.find(c => 
            (c.slug && c.slug.toLowerCase() === target) || 
            String(c.id) === target
          );
          if (found) {
            return { data: this.isSingle ? found : [found], error: null };
          }
          return { data: null, error: { code: 404, message: 'İçerik bulunamadı' } };
        }

        // Liste sorgusu
        const params = new URLSearchParams();
        const statusFilter = this.filters.find(f => f.column === 'status');
        if (statusFilter !== undefined) {
          params.append('status', String(statusFilter.value));
        } else {
          params.append('status', 'all');
        }

        try {
          const resp = await fetch(`${API_BASE}/contents?${params.toString()}`, { headers });
          if (resp.ok) {
            const cType = resp.headers.get('content-type');
            if (cType && cType.includes('application/json')) {
              const data = await resp.json();
              if (Array.isArray(data)) {
                if (this.isSingle) {
                  return { data: data.length > 0 ? data[0] : null, error: null };
                }
                return { data, error: null };
              }
            }
          }
        } catch (e) {
          console.warn('API list fetch failed, using fallback:', e);
        }

        // Fallback: Yerel JSON verisinden listele
        let list = [...fallbackContents];
        if (statusFilter !== undefined && statusFilter.value !== 'all') {
          const isStatusTrue = statusFilter.value === true || statusFilter.value === 'true' || statusFilter.value === 1 || statusFilter.value === '1';
          list = list.filter(c => Boolean(c.status) === isStatusTrue);
        }
        list.sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
        if (this.isSingle) {
          return { data: list.length > 0 ? list[0] : null, error: null };
        }
        return { data: list, error: null };
      }

      if (this.table === 'offers') {
        const limitParam = this.limitVal ? `?limit=${this.limitVal}` : '';
        const resp = await fetch(`${API_BASE}/offers${limitParam}`, { headers });
        if (!resp.ok) {
          return { data: [], error: { code: resp.status, message: 'Teklifler alınamadı' } };
        }
        const data = await resp.json();
        return { data: Array.isArray(data) ? data : [], error: null };
      }

      return { data: [], error: null };
    }

    // 2. INSERT İŞLEMİ
    if (this.action === 'insert') {
      if (this.table === 'contents') {
        const item = Array.isArray(this.payload) ? this.payload[0] : this.payload;
        const resp = await fetch(`${API_BASE}/contents`, {
          method: 'POST',
          headers,
          body: JSON.stringify(item)
        });
        const data = await resp.json();
        return { data: [data], error: resp.ok ? null : data };
      }

      if (this.table === 'offers') {
        const resp = await fetch(`${API_BASE}/offers`, {
          method: 'POST',
          headers,
          body: JSON.stringify(this.payload)
        });
        const data = await resp.json();
        return { data: [data], error: resp.ok ? null : data };
      }
    }

    // 3. UPDATE İŞLEMİ
    if (this.action === 'update') {
      if (this.table === 'contents') {
        const idFilter = this.filters.find(f => f.column === 'id');
        if (idFilter) {
          const resp = await fetch(`${API_BASE}/contents/${idFilter.value}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(this.payload)
          });
          const data = await resp.json();
          return { data: [data], error: resp.ok ? null : data };
        }
      }
    }

    // 4. DELETE İŞLEMİ
    if (this.action === 'delete') {
      if (this.table === 'contents') {
        const idFilter = this.filters.find(f => f.column === 'id');
        if (idFilter) {
          const resp = await fetch(`${API_BASE}/contents/${idFilter.value}`, {
            method: 'DELETE',
            headers
          });
          return { error: resp.ok ? null : { message: 'Silme işlemi başarısız' } };
        }
      }
    }

    return { data: null, error: null };
  }
}

// Auth Dinleyicileri
const authListeners = new Set();
function notifyAuthChange(event, session) {
  authListeners.forEach(cb => {
    try {
      cb(event, session);
    } catch (e) {
      console.error('Auth listener error:', e);
    }
  });
}

// Realtime Kanalları
const activeChannels = new Map();

export const supabase = {
  from(tableName) {
    return new LocalQueryBuilder(tableName);
  },

  auth: {
    async signInWithPassword({ email, password }) {
      try {
        const resp = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await resp.json();
        if (!resp.ok) {
          return { data: { user: null, session: null }, error: { message: data.error || 'Giriş başarısız' } };
        }

        localStorage.setItem('galeri_token', data.session.access_token);
        localStorage.setItem('galeri_user', JSON.stringify(data.user));
        notifyAuthChange('SIGNED_IN', data.session);

        return { data, error: null };
      } catch (err) {
        return { data: { user: null, session: null }, error: { message: err.message } };
      }
    },

    async getSession() {
      const token = localStorage.getItem('galeri_token');
      const userStr = localStorage.getItem('galeri_user');
      if (!token) {
        return { data: { session: null }, error: null };
      }

      try {
        const user = userStr ? JSON.parse(userStr) : { email: 'admin' };
        const session = { access_token: token, user };
        return { data: { session }, error: null };
      } catch {
        return { data: { session: null }, error: null };
      }
    },

    async signOut() {
      localStorage.removeItem('galeri_token');
      localStorage.removeItem('galeri_user');
      notifyAuthChange('SIGNED_OUT', null);
      return { error: null };
    },

    onAuthStateChange(callback) {
      authListeners.add(callback);
      // İlk durumu anında bildir
      const token = localStorage.getItem('galeri_token');
      const userStr = localStorage.getItem('galeri_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          callback('SIGNED_IN', { access_token: token, user });
        } catch {
          callback('SIGNED_OUT', null);
        }
      } else {
        callback('SIGNED_OUT', null);
      }

      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            }
          }
        }
      };
    }
  },

  storage: {
    from(_bucket) {
      return {
        async upload(fileName, file) {
          try {
            const formData = new FormData();
            formData.append('file', file, fileName);

            const token = localStorage.getItem('galeri_token');
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const resp = await fetch(`${API_BASE}/upload`, {
              method: 'POST',
              headers,
              body: formData
            });

            if (!resp.ok) {
              const errData = await resp.json().catch(() => ({}));
              return { data: null, error: { message: errData.error || 'Resim yüklenemedi' } };
            }

            const data = await resp.json();
            return { data: { path: data.fileName, publicUrl: data.publicUrl }, error: null };
          } catch (err) {
            return { data: null, error: { message: err.message } };
          }
        },

        getPublicUrl(fileName) {
          if (!fileName) return { data: { publicUrl: '' } };
          if (fileName.startsWith('http://') || fileName.startsWith('https://') || fileName.startsWith('/uploads/')) {
            return { data: { publicUrl: fileName } };
          }
          return { data: { publicUrl: `/uploads/${fileName}` } };
        }
      };
    }
  },

  channel(channelName) {
    let eventSource = null;
    const callbacks = [];

    const chObj = {
      name: channelName,
      on(_type, _filter, callback) {
        callbacks.push(callback);
        return chObj;
      },
      subscribe() {
        if (typeof window !== 'undefined' && window.EventSource) {
          try {
            eventSource = new EventSource(`${API_BASE}/realtime/stream`);
            eventSource.onmessage = (event) => {
              try {
                const payload = JSON.parse(event.data);
                callbacks.forEach(cb => cb(payload));
              } catch (e) {
                console.error('SSE JSON parse error:', e);
              }
            };
            activeChannels.set(chObj, eventSource);
          } catch (e) {
            console.warn('Realtime SSE bağlantısı açılamadı:', e);
          }
        }
        return chObj;
      }
    };

    return chObj;
  },

  removeChannel(channel) {
    if (channel && activeChannels.has(channel)) {
      const es = activeChannels.get(channel);
      if (es) es.close();
      activeChannels.delete(channel);
    }
  }
};

export default supabase;
