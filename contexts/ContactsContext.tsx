import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useMemo, 
  useCallback, 
  ReactNode 
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * CulturePassAU Sydney Contacts Context
 * Persistent saved contacts w/ haptic feedback
 * Kerala community + Sydney networking focus
 */

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
  notes?: string;     // Sydney networking notes
  lastContacted?: string; // Follow-up tracking
}

interface ContactsContextValue {
  contacts: SavedContact[];
  isLoading: boolean;
  
  // Core operations
  addContact: (contact: Omit<SavedContact, 'savedAt'>) => Promise<void>;
  removeContact: (cpid: string) => Promise<void>;
  isContactSaved: (cpid: string) => boolean;
  getContact: (cpid: string) => SavedContact | undefined;
  updateContact: (cpid: string, updates: Partial<SavedContact>) => Promise<void>;
  clearContacts: () => Promise<void>;
  
  // Sydney networking extras
  getContactsByCity: (city: string) => SavedContact[];
  searchContacts: (query: string) => SavedContact[];
  getRecentContacts: (days: number) => SavedContact[];
}

const CONTACTS_KEY = '@culturepassau_contacts_v2';
const CONTACTS_VERSION = '2.0';

const ContactsContext = createContext<ContactsContextValue | null>(null);

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<SavedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Migrate from old storage format
  const migrateStorage = useCallback(async () => {
    try {
      const oldData = await AsyncStorage.getItem('@culturepass_saved_contacts');
      if (oldData && !contacts.length) {
        const oldContacts = JSON.parse(oldData) as SavedContact[];
        const migrated = oldContacts.map(contact => ({
          ...contact,
          notes: contact.notes || '',
          lastContacted: contact.lastContacted || '',
        }));
        await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(migrated));
        await AsyncStorage.removeItem('@culturepass_saved_contacts');
      }
    } catch (error) {
      console.warn('Migration failed:', error);
    }
  }, [contacts.length]);

  // Load contacts
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setIsLoading(true);
        await migrateStorage();
        
        const stored = await AsyncStorage.getItem(CONTACTS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as SavedContact[];
          // Validate + sort by recent
          const validContacts = parsed
            .filter(contact => contact.cpid && contact.name)
            .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
          setContacts(validContacts);
        }
      } catch (error) {
        console.error('Failed to load contacts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContacts();
  }, [migrateStorage]);

  const persist = useCallback(async (updated: SavedContact[]) => {
    try {
      await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Persist failed:', error);
    }
  }, []);

  const addContact = useCallback(async (contact: Omit<SavedContact, 'savedAt'>) => {
    setContacts(prev => {
      const exists = prev.find(c => c.cpid === contact.cpid);
      if (exists) {
        const updated = prev.map(c =>
          c.cpid === contact.cpid 
            ? { ...c, ...contact, savedAt: c.savedAt } 
            : c
        );
        persist(updated);
        return updated;
      }
      
      const newContact: SavedContact = { 
        ...contact, 
        savedAt: new Date().toISOString(),
        notes: '',
        lastContacted: '',
      };
      
      const updated = [newContact, ...prev.slice(0, 99)]; // Limit to 100
      persist(updated);
      return updated;
    });

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [persist]);

  const removeContact = useCallback(async (cpid: string) => {
    setContacts(prev => {
      const updated = prev.filter(c => c.cpid !== cpid);
      persist(updated);
      return updated;
    });

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [persist]);

  const updateContact = useCallback(async (cpid: string, updates: Partial<SavedContact>) => {
    setContacts(prev => {
      const updated = prev.map(c => 
        c.cpid === cpid ? { ...c, ...updates } : c
      );
      persist(updated);
      return updated;
    });
  }, [persist]);

  const clearContacts = useCallback(async () => {
    setContacts([]);
    await AsyncStorage.removeItem(CONTACTS_KEY);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, []);

  // Memoized derived state
  const isContactSaved = useCallback((cpid: string) => 
    contacts.some(c => c.cpid === cpid), [contacts]
  );

  const getContact = useCallback((cpid: string) => 
    contacts.find(c => c.cpid === cpid), [contacts]
  );

  const getContactsByCity = useCallback((city: string) => 
    contacts.filter(c => c.city?.toLowerCase() === city.toLowerCase()), [contacts]
  );

  const searchContacts = useCallback((query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return contacts;
    
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(q) ||
      contact.username?.toLowerCase().includes(q) ||
      contact.org?.toLowerCase().includes(q) ||
      contact.email?.toLowerCase().includes(q)
    );
  }, [contacts]);

  const getRecentContacts = useCallback((days: number = 30) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return contacts.filter(c => 
      new Date(c.savedAt) > cutoff || 
      new Date(c.lastContacted || '0') > cutoff
    );
  }, [contacts]);

  const value = useMemo(() => ({
    contacts,
    isLoading,
    addContact,
    removeContact,
    isContactSaved,
    getContact,
    updateContact,
    clearContacts,
    getContactsByCity,
    searchContacts,
    getRecentContacts,
  }), [
    contacts, isLoading, addContact, removeContact, isContactSaved, 
    getContact, updateContact, clearContacts, getContactsByCity, 
    searchContacts, getRecentContacts
  ]);

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  );
}

export function useContacts() {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error('useContacts must be used within ContactsProvider');
  }
  return context;
}

// Sydney networking helpers
export function useSydneyContacts() {
  const contacts = useContacts();
  return {
    ...contacts,
    sydneyContacts: contacts.getContactsByCity('Sydney'),
    recentSydney: contacts.getRecentContacts(7).filter(c => c.city === 'Sydney'),
  };
}

// Migration helper (run once)
export const migrateContacts = async () => {
  try {
    const oldKey = '@culturepass_saved_contacts';
    const newKey = '@culturepassau_contacts_v2';
    
    const oldData = await AsyncStorage.getItem(oldKey);
    if (oldData) {
      const oldContacts = JSON.parse(oldData) as SavedContact[];
      const migrated = oldContacts.map(contact => ({
        ...contact,
        notes: contact.notes || '',
        lastContacted: contact.lastContacted || '',
      }));
      await AsyncStorage.setItem(newKey, JSON.stringify(migrated));
      await AsyncStorage.removeItem(oldKey);
      console.log(`Migrated ${migrated.length} contacts`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
};
