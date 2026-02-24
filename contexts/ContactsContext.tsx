import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedContact {
  cpid: string;
  name: string;
  username?: string;
  tier?: string;
  org?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
  bio?: string;
  email?: string;
  phone?: string;
  savedAt: string;
  userId?: string;
}

interface ContactsContextValue {
  contacts: SavedContact[];
  addContact: (contact: Omit<SavedContact, 'savedAt'>) => void;
  removeContact: (cpid: string) => void;
  isContactSaved: (cpid: string) => boolean;
  getContact: (cpid: string) => SavedContact | undefined;
  updateContact: (cpid: string, updates: Partial<SavedContact>) => void;
  clearContacts: () => void;
}

const CONTACTS_KEY = '@culturepass_saved_contacts';

const ContactsContext = createContext<ContactsContextValue | null>(null);

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<SavedContact[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(CONTACTS_KEY).then(stored => {
      if (stored) {
        try {
          setContacts(JSON.parse(stored));
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((updated: SavedContact[]) => {
    AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
  }, []);

  const addContact = useCallback((contact: Omit<SavedContact, 'savedAt'>) => {
    setContacts(prev => {
      const exists = prev.find(c => c.cpid === contact.cpid);
      if (exists) {
        const updated = prev.map(c =>
          c.cpid === contact.cpid ? { ...c, ...contact, savedAt: c.savedAt } : c
        );
        persist(updated);
        return updated;
      }
      const newContact: SavedContact = { ...contact, savedAt: new Date().toISOString() };
      const updated = [newContact, ...prev];
      persist(updated);
      return updated;
    });
  }, [persist]);

  const removeContact = useCallback((cpid: string) => {
    setContacts(prev => {
      const updated = prev.filter(c => c.cpid !== cpid);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const isContactSaved = useCallback((cpid: string) => contacts.some(c => c.cpid === cpid), [contacts]);

  const getContact = useCallback((cpid: string) => contacts.find(c => c.cpid === cpid), [contacts]);

  const updateContact = useCallback((cpid: string, updates: Partial<SavedContact>) => {
    setContacts(prev => {
      const updated = prev.map(c => c.cpid === cpid ? { ...c, ...updates } : c);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const clearContacts = useCallback(() => {
    setContacts([]);
    AsyncStorage.removeItem(CONTACTS_KEY);
  }, []);

  const value = useMemo(() => ({
    contacts,
    addContact,
    removeContact,
    isContactSaved,
    getContact,
    updateContact,
    clearContacts,
  }), [contacts, addContact, removeContact, isContactSaved, getContact, updateContact, clearContacts]);

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactsContext);
  if (!context) throw new Error('useContacts must be used within ContactsProvider');
  return context;
}
