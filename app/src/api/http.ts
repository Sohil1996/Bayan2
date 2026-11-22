/**
 * HTTP implementation of the Bayan API. Used when NEXT_PUBLIC_API_URL is set.
 * Routes and payloads are documented in docs/API.md. Auth: the backend sets an
 * HttpOnly session cookie on sign-in; every request is sent with credentials.
 */
import type { BayanApi } from './contract';

export function httpApi(base: string): BayanApi {
  async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(base.replace(/\/$/, '') + path, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401 && path === '/me') return null as T;
    if (!res.ok) throw new Error((await res.text()) || res.statusText);
    return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
  }
  const q = (o: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries(o).filter(([, v]) => v) as [string, string][]);
    return p.toString() ? `?${p}` : '';
  };
  return {
    listBooks: (lang, o = {}) => call('GET', `/books${q({ lang, category: o.category, q: o.q, language: o.language })}`),
    getBook: (id, lang) => call('GET', `/books/${id}${q({ lang })}`),
    listCategories: (lang) => call('GET', `/categories${q({ lang })}`),
    featured: (lang) => call('GET', `/featured${q({ lang })}`),
    getSummary: (id, lang) => call('GET', `/books/${id}/summary${q({ lang })}`),
    explore: (lang) => call('GET', `/explore${q({ lang })}`),
    chat: (req) => call('POST', '/chat', req),
    startCategory: (category, lang) => call('POST', '/chat/start-category', { category, lang }),
    feedback: (input) => call('POST', '/chat/feedback', input),
    signIn: (email, password) => call('POST', '/auth/signin', { email, password }),
    signUp: (name, email, password) => call('POST', '/auth/signup', { name, email, password }),
    signOut: () => call('POST', '/auth/signout'),
    me: () => call('GET', '/me'),
    updateMe: (patch) => call('PATCH', '/me', patch),
    changePassword: (current, next) => call('POST', '/me/password', { current, next }),
    favorites: () => call('GET', '/me/favorites'),
    setFavorite: (id, on) => call(on ? 'PUT' : 'DELETE', `/me/favorites/${id}`),
    conversations: () => call('GET', '/me/conversations'),
    getConversation: (id) => call('GET', `/me/conversations/${id}`),
    saveConversation: (c) => call('PUT', `/me/conversations/${c.id}`, c),
    deleteConversation: (id) => call('DELETE', `/me/conversations/${id}`),
    summaries: () => call('GET', '/me/summaries'),
    removeSummary: (id) => call('DELETE', `/me/summaries/${id}`),
    encounters: () => call('GET', '/me/encounters'),
    addEncounter: (e) => call('POST', '/me/encounters', e),
    credits: () => call('GET', '/me/credits'),
    topUpPlans: () => call('GET', '/credits/plans'),
    topUp: (plan) => call('POST', '/me/credits/top-up', plan),
  };
}
