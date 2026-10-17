import type { Message } from './i18n'

/**
 * The short phrases several components render themselves, in every language
 * they ship in. A component with a longer set keeps its own beside it (as
 * DataTable's `labels.ts`).
 */
export const MESSAGES = {
  close: { en: 'Close', tr: 'Kapat' },
  loading: { en: 'Loading', tr: 'Yükleniyor' },
  search: { en: 'Search', tr: 'Ara' },
  searching: { en: 'Searching', tr: 'Aranıyor' },
  clear: { en: 'Clear', tr: 'Temizle' },
  showOptions: { en: 'Show options', tr: 'Seçenekleri göster' },
  moreInformation: { en: 'More information', tr: 'Daha fazla bilgi' },
  previous: { en: 'Previous', tr: 'Önceki' },
  next: { en: 'Next', tr: 'Sonraki' },
  mainNavigation: { en: 'Main', tr: 'Ana menü' },
  expandSidebar: { en: 'Expand sidebar', tr: 'Kenar çubuğunu genişlet' },
  collapseSidebar: { en: 'Collapse sidebar', tr: 'Kenar çubuğunu daralt' },
  showPassword: { en: 'Show password', tr: 'Şifreyi göster' },
} as const satisfies Record<string, Message>
