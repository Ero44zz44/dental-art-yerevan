'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { T, Lang, Translations } from '@/lib/translations'

interface LanguageContextType {
  lang:    Lang
  setLang: (lang: Lang) => void
  t:       Translations
}

const LanguageContext = createContext<LanguageContextType>({
  lang:    'hy',
  setLang: () => {},
  t:       T['en'],
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('hy')

  useEffect(() => {
    const saved = localStorage.getItem('site-lang') as Lang | null
    if (saved && (saved === 'hy' || saved === 'en' || saved === 'ru')) {
      setLangState(saved)
    }
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('site-lang', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: T[lang] as Translations }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  return useContext(LanguageContext)
}
