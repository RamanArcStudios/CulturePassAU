import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Order } from './data';

interface OrdersContextValue {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id'>) => Promise<void>;
  isLoading: boolean;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);
const ORDERS_KEY = '@culturepass_orders';

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const stored = await AsyncStorage.getItem(ORDERS_KEY);
      if (stored) setOrders(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setIsLoading(false);
    }
  }

  async function addOrder(order: Omit<Order, 'id'>) {
    const newOrder: Order = { ...order, id: `ord-${Date.now()}` };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  }

  const value = useMemo(() => ({ orders, addOrder, isLoading }), [orders, isLoading]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}

