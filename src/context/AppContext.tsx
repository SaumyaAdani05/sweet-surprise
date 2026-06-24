'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { categoriesData as initialCategories } from '@/lib/products';
import type { Category, Product, CartItem, User, Order, AdminNotification } from '@/types';

interface AppContextType {
  categories: Category[];
  cart: CartItem[];
  user: User | null;
  orders: Order[];
  notifications: AdminNotification[];
  login: (username: string, password: string) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (username: string, name: string, phone: string, address: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  addToCart: (product: Product, quantity: number, weight?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (name: string, phone: string, address: string) => Promise<{ success: boolean; orderId?: string; message?: string }>;
  adminAddCategory: (name: string) => Promise<void>;
  adminDeleteCategory: (categoryId: string) => Promise<void>;
  adminUpdateCategoryName: (categoryId: string, newName: string) => Promise<void>;
  adminAddProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  adminUpdateProduct: (product: Product) => Promise<void>;
  adminDeleteProduct: (productId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  adminUpdateOrderStatus: (orderId: string, status: 'completed' | 'cancelled') => Promise<void>;
  adminTogglePaymentConfirmed: (orderId: string, currentVal: boolean) => Promise<void>;
  uploadProductImage: (file: File) => Promise<string>;
  signInWithGoogle: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to check if Supabase is using placeholder credentials
const isSupabasePlaceholder = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.includes('placeholder-project') || url === 'your_supabase_url';
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper to parse price string (e.g. "RS 650" -> 650)
  const parsePrice = (priceStr?: string): number => {
    if (!priceStr) return 0;
    return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
  };

  // Helper for dynamic weight multipliers
  const getWeightMultiplier = (category: string, weight?: string): number => {
    if (!weight) return 1.0;
    const cleanWeight = weight.toLowerCase().trim();
    if (category === 'cakes') {
      switch (cleanWeight) {
        case '500g': return 1.0;
        case '1kg': return 2.0;
        case '1.5kg': return 3.0;
        case '2kg': return 4.0;
        case '3kg': return 6.0;
        case '5kg': return 10.0;
        default: {
          const numericVal = parseFloat(cleanWeight);
          if (isNaN(numericVal)) return 1.0;
          if (cleanWeight.endsWith('kg')) {
            return (numericVal * 1000) / 500;
          }
          return numericVal / 500;
        }
      }
    } else if (category === 'chocolates') {
      switch (cleanWeight) {
        case '100g': return 0.4;
        case '250g': return 1.0;
        case '500g': return 2.0;
        case '1kg': return 4.0;
        default: {
          const numericVal = parseFloat(cleanWeight);
          if (isNaN(numericVal)) return 1.0;
          if (cleanWeight.endsWith('kg')) {
            return (numericVal * 1000) / 250;
          }
          return numericVal / 250;
        }
      }
    }
    return 1.0;
  };

  // Local Storage State Helpers (used in Fallback Mock Mode)
  const saveMockCategories = (newCats: Category[]) => {
    setCategories(newCats);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sweet_surprise_categories', JSON.stringify(newCats));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const saveMockOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sweet_surprise_orders', JSON.stringify(newOrders));
    }
  };

  const saveMockNotifications = (newNotifs: AdminNotification[]) => {
    setNotifications(newNotifs);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sweet_surprise_notifications', JSON.stringify(newNotifs));
    }
  };

  const loadCartFromStorage = () => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('sweet_surprise_cart');
      if (storedCart) {
        try {
          setCart(JSON.parse(storedCart));
        } catch (e) {
          console.error('Error parsing cart from localStorage:', e);
        }
      }
    }
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sweet_surprise_cart', JSON.stringify(newCart));
    }
  };

  // Fetch product catalog from Supabase
  const fetchCatalog = async () => {
    if (isSupabasePlaceholder()) {
      // Mock mode: load categories from localStorage or seed with initials
      if (typeof window !== 'undefined') {
        const storedCats = localStorage.getItem('sweet_surprise_categories');
        if (storedCats) {
          setCategories(JSON.parse(storedCats));
        } else {
          localStorage.setItem('sweet_surprise_categories', JSON.stringify(initialCategories));
          setCategories(initialCategories);
        }
      }
      return;
    }

    try {
      const { data: dbCategories, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          products (*)
        `);

      if (error) {
        console.error('Error fetching catalog from Supabase, using local defaults:', error);
        setCategories(initialCategories);
        return;
      }

      if (dbCategories && dbCategories.length > 0) {
        const mappedCategories = dbCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          products: (cat.products || [])
            .filter((p: any) => p.is_active)
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              price: `RS ${p.price_base}`,
              category: p.category_id,
              imageUrl: p.image_url,
              imageHint: p.image_hint || undefined
            }))
        }));
        setCategories(mappedCategories);
      } else {
        setCategories(initialCategories);
      }
    } catch (err) {
      console.error('Failed to fetch catalog from Supabase, using local defaults:', err);
      setCategories(initialCategories);
    }
  };

  // Fetch orders and notifications based on role (Supabase)
  const fetchUserData = async (userId: string, isAdmin: boolean) => {
    if (isSupabasePlaceholder()) return;

    try {
      // 1. Fetch Orders
      const orderQuery = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (!isAdmin) {
        orderQuery.eq('user_id', userId);
      }

      const { data: dbOrders, error: ordersError } = await orderQuery;

      if (!ordersError && dbOrders) {
        const mappedOrders: Order[] = dbOrders.map(ord => ({
          id: ord.id,
          username: ord.user_id || '',
          customerName: ord.customer_name,
          customerPhone: ord.customer_phone,
          customerAddress: ord.customer_address,
          totalPrice: ord.total_price,
          status: ord.status as any,
          paymentConfirmed: ord.payment_confirmed,
          createdAt: ord.created_at,
          items: (ord.order_items || []).map((item: any) => ({
            productId: item.product_id,
            productName: item.products?.name || 'Unknown Product',
            quantity: item.quantity,
            weight: item.weight || undefined,
            price: item.price_at_purchase * item.quantity
          }))
        }));
        setOrders(mappedOrders);
      }

      // 2. Fetch Notifications (Admin Only)
      if (isAdmin) {
        const { data: dbNotifs, error: notifsError } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!notifsError && dbNotifs) {
          const mappedNotifs: AdminNotification[] = dbNotifs.map(n => ({
            id: n.id,
            type: n.type as any,
            message: n.message,
            details: n.details,
            createdAt: n.created_at,
            read: n.read
          }));
          setNotifications(mappedNotifs);
        }
      }
    } catch (err) {
      console.error('Error fetching user context data:', err);
    }
  };

  // Initialize App (Dual-mode support)
  useEffect(() => {
    let authSubscription: any;

    const initializeAuth = async () => {
      await fetchCatalog();
      loadCartFromStorage();

      if (isSupabasePlaceholder()) {
        // Mock Mode: Load user, orders, notifications from localStorage
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem('sweet_surprise_user');
          if (storedUser) setUser(JSON.parse(storedUser));

          const storedOrders = localStorage.getItem('sweet_surprise_orders');
          if (storedOrders) setOrders(JSON.parse(storedOrders));

          const storedNotifications = localStorage.getItem('sweet_surprise_notifications');
          if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
        }
        setIsLoaded(true);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const mappedUser: User = {
              username: session.user.email?.split('@')[0] || '',
              name: profile.name,
              phone: profile.phone,
              address: profile.address || undefined,
              isAdmin: profile.is_admin
            };
            setUser(mappedUser);
            await fetchUserData(session.user.id, profile.is_admin);
          }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (currentSession?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();

            if (profile) {
              const mappedUser: User = {
                username: currentSession.user.email?.split('@')[0] || '',
                name: profile.name,
                phone: profile.phone,
                address: profile.address || undefined,
                isAdmin: profile.is_admin
              };
              setUser(mappedUser);
              await fetchUserData(currentSession.user.id, profile.is_admin);
            }
          } else {
            setUser(null);
            setOrders([]);
            setNotifications([]);
          }
        });

        authSubscription = subscription;
      } catch (err) {
        console.error('Error initializing Supabase Auth:', err);
      }

      setIsLoaded(true);
    };

    initializeAuth();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Storage listener to sync state across tabs/windows in Mock Mode
  useEffect(() => {
    if (!isSupabasePlaceholder()) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (typeof window === 'undefined') return;

      try {
        if (e.key === 'sweet_surprise_orders') {
          setOrders(e.newValue ? JSON.parse(e.newValue) : []);
        } else if (e.key === 'sweet_surprise_notifications') {
          setNotifications(e.newValue ? JSON.parse(e.newValue) : []);
        } else if (e.key === 'sweet_surprise_user') {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } else if (e.key === 'sweet_surprise_categories') {
          setCategories(e.newValue ? JSON.parse(e.newValue) : []);
        } else if (e.key === 'sweet_surprise_cart') {
          setCart(e.newValue ? JSON.parse(e.newValue) : []);
        }
      } catch (err) {
        console.error('Error handling storage sync event:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Auth Actions
  const login = async (username: string, password: string) => {
    if (isSupabasePlaceholder()) {
      // Mock Login Mode
      if ((username.toLowerCase() === 'admin2602' || username.toLowerCase() === 'admin') && password === 'Sweet@admin1983') {
        const adminUser: User = { username: username.toLowerCase() === 'admin' ? 'admin' : 'admin2602', name: 'Rinku Adani', isAdmin: true };
        setUser(adminUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sweet_surprise_user', JSON.stringify(adminUser));
        }
        return { success: true, message: 'Logged in as Admin successfully', user: adminUser };
      }

      const storedUsersStr = localStorage.getItem('sweet_surprise_registered_users');
      const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : {};

      if (registeredUsers[username] && registeredUsers[username].password === password) {
        const loggedInUser: User = {
          username,
          name: registeredUsers[username].name,
          phone: registeredUsers[username].phone,
          address: registeredUsers[username].address,
          isAdmin: false
        };
        setUser(loggedInUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sweet_surprise_user', JSON.stringify(loggedInUser));
        }

        const newNotif: AdminNotification = {
          id: 'login_' + Date.now(),
          type: 'login',
          message: `User Logged In`,
          details: `${loggedInUser.name} (${loggedInUser.username}) has logged into their account.`,
          createdAt: new Date().toISOString(),
          read: false
        };
        saveMockNotifications([newNotif, ...notifications]);

        return { success: true, message: 'Logged in successfully', user: loggedInUser };
      }
      return { success: false, message: 'Invalid username or password' };
    }

    // Supabase Live Login
    const email = username.includes('@') ? username : `${username.toLowerCase()}@sweetsurprise.com`;
    const realPassword = password === '123' ? 'SweetSurprisePass123' : password;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: realPassword
    });

    if (error) {
      return { success: false, message: error.message };
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        const loggedInUser: User = {
          username: email.split('@')[0],
          name: profile.name,
          phone: profile.phone,
          address: profile.address || undefined,
          isAdmin: profile.is_admin
        };
        setUser(loggedInUser);
        await fetchUserData(data.user.id, profile.is_admin);
        return { success: true, message: 'Logged in successfully', user: loggedInUser };
      }
    }
    return { success: false, message: 'Profile details not found' };
  };

  const register = async (username: string, name: string, phone: string, address: string) => {
    if (isSupabasePlaceholder()) {
      // Mock Register Mode
      if (username.toLowerCase() === 'admin' || username.toLowerCase() === 'admin2602') {
        return { success: false, message: 'Username is reserved' };
      }

      const storedUsersStr = localStorage.getItem('sweet_surprise_registered_users');
      const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : {};

      if (registeredUsers[username]) {
        return { success: false, message: 'Username already exists' };
      }

      registeredUsers[username] = { name, phone, address, password: '123' };
      if (typeof window !== 'undefined') {
        localStorage.setItem('sweet_surprise_registered_users', JSON.stringify(registeredUsers));
      }

      return { success: true, message: 'Account created successfully! Default password is "123".' };
    }

    // Supabase Live Register
    const email = username.includes('@') ? username : `${username.toLowerCase()}@sweetsurprise.com`;
    const password = 'SweetSurprisePass123';

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          address,
          is_admin: false
        }
      }
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Account created successfully! Default password is "123".' };
  };

  const logout = async () => {
    if (isSupabasePlaceholder()) {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sweet_surprise_user');
      }
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setOrders([]);
    setNotifications([]);
  };

  // Cart Actions
  const addToCart = (product: Product, quantity: number, weight?: string) => {
    const key = `${product.id}-${weight || 'none'}`;
    const basePrice = parsePrice(product.price);
    const multiplier = getWeightMultiplier(product.category, weight);
    const calculatedSinglePrice = Math.round(basePrice * multiplier);

    const existingIndex = cart.findIndex(item => item.cartItemId === key);
    let newCart = [...cart];

    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      const newItem: CartItem = {
        cartItemId: key,
        product,
        quantity,
        selectedWeight: weight,
        priceAtSelection: calculatedSinglePrice
      };
      newCart.push(newItem);
    }
    saveCart(newCart);
  };

  const removeFromCart = (cartItemId: string) => {
    const newCart = cart.filter(item => item.cartItemId !== cartItemId);
    saveCart(newCart);
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    const newCart = cart.map(item => {
      if (item.cartItemId === cartItemId) {
        return { ...item, quantity: Math.max(1, quantity) };
      }
      return item;
    });
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  // Checkout Actions
  const placeOrder = async (name: string, phone: string, address: string) => {
    if (!user) {
      return { success: false, message: 'Must be logged in to place an order' };
    }
    if (cart.length === 0) {
      return { success: false, message: 'Cart is empty' };
    }

    if (isSupabasePlaceholder()) {
      // Mock Place Order Mode
      const total = cart.reduce((sum, item) => sum + (item.priceAtSelection * item.quantity), 0);
      const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

      const newOrder: Order = {
        id: orderId,
        username: user.username,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        items: cart.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          weight: item.selectedWeight,
          price: item.priceAtSelection * item.quantity
        })),
        totalPrice: total,
        status: 'pending',
        paymentConfirmed: false,
        createdAt: new Date().toISOString()
      };

      const newOrders = [newOrder, ...orders];
      saveMockOrders(newOrders);

      // Create local admin notification
      const newNotif: AdminNotification = {
        id: 'purchase_' + Date.now(),
        type: 'purchase',
        message: `New Order Placed: ${orderId}`,
        details: `${name} placed an order for RS ${total}. Items: ${cart.map(item => `${item.quantity}x ${item.product.name} (${item.selectedWeight || 'Std'})`).join(', ')}`,
        createdAt: new Date().toISOString(),
        read: false
      };
      saveMockNotifications([newNotif, ...notifications]);

      clearCart();
      return { success: true, orderId };
    }

    // Supabase Live Place Order
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return { success: false, message: 'Must be logged in to place an order' };
    }

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: authUser.id,
        customer_name: name,
        customer_phone: phone,
        customer_address: address,
        status: 'pending',
        payment_confirmed: false
      });

    if (orderError) {
      return { success: false, message: orderError.message };
    }

    const orderItems = cart.map(item => ({
      order_id: orderId,
      product_id: item.product.id,
      quantity: item.quantity,
      weight: item.selectedWeight || null
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      await supabase.from('orders').delete().eq('id', orderId);
      return { success: false, message: itemsError.message };
    }

    const { data: finalOrder } = await supabase
      .from('orders')
      .select('total_price')
      .eq('id', orderId)
      .single();

    clearCart();

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', authUser.id)
      .single();

    await fetchUserData(authUser.id, profile?.is_admin || false);

    return {
      success: true,
      orderId,
      message: finalOrder ? `Order placed successfully. Total: RS ${finalOrder.total_price}` : 'Order placed successfully.'
    };
  };

  // Admin Actions (Dual-mode support)
  const adminAddCategory = async (name: string) => {
    if (isSupabasePlaceholder()) {
      const catId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const newCategory: Category = { id: catId, name, products: [] };
      saveMockCategories([...categories, newCategory]);
      return;
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const { error } = await supabase
      .from('categories')
      .insert({ id, name, slug });

    if (error) {
      console.error('Error adding category:', error.message);
      throw error;
    } else {
      await fetchCatalog();
    }
  };

  const adminDeleteCategory = async (categoryId: string) => {
    if (isSupabasePlaceholder()) {
      const newCats = categories.filter(c => c.id !== categoryId);
      saveMockCategories(newCats);
      return;
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting category:', error.message);
      throw error;
    } else {
      await fetchCatalog();
    }
  };

  const adminUpdateCategoryName = async (categoryId: string, newName: string) => {
    if (isSupabasePlaceholder()) {
      const newCats = categories.map(c => {
        if (c.id === categoryId) {
          return { ...c, name: newName };
        }
        return c;
      });
      saveMockCategories(newCats);
      return;
    }

    const { error } = await supabase
      .from('categories')
      .update({ name: newName })
      .eq('id', categoryId);

    if (error) {
      console.error('Error updating category name:', error.message);
      throw error;
    } else {
      await fetchCatalog();
    }
  };

  const adminAddProduct = async (productData: Omit<Product, 'id'>) => {
    if (isSupabasePlaceholder()) {
      const prodId = `${productData.category}-${Date.now()}`;
      const newProduct: Product = { ...productData, id: prodId };
      const newCats = categories.map(c => {
        if (c.id === productData.category) {
          return { ...c, products: [...c.products, newProduct] };
        }
        return c;
      });
      saveMockCategories(newCats);
      return;
    }

    const id = `${productData.category}-${Date.now()}`;
    const priceBase = parseInt(productData.price?.replace(/[^0-9]/g, '') || '0') || 0;

    const { error } = await supabase
      .from('products')
      .insert({
        id,
        name: productData.name,
        description: productData.description,
        price_base: priceBase,
        category_id: productData.category,
        image_url: productData.imageUrl,
        is_active: true
      });

    if (error) {
      console.error('Error adding product:', error.message);
      throw error;
    } else {
      await fetchCatalog();
    }
  };

  const adminUpdateProduct = async (product: Product) => {
    if (isSupabasePlaceholder()) {
      const newCats = categories.map(c => {
        const exists = c.products.some(p => p.id === product.id);
        if (exists) {
          if (c.id === product.category) {
            return {
              ...c,
              products: c.products.map(p => p.id === product.id ? product : p)
            };
          } else {
            return {
              ...c,
              products: c.products.filter(p => p.id !== product.id)
            };
          }
        }
        if (c.id === product.category) {
          return {
            ...c,
            products: [...c.products, product]
          };
        }
        return c;
      });
      saveMockCategories(newCats);
      return;
    }

    const priceBase = parseInt(product.price?.replace(/[^0-9]/g, '') || '0') || 0;

    const { error } = await supabase
      .from('products')
      .update({
        name: product.name,
        description: product.description,
        price_base: priceBase,
        category_id: product.category,
        image_url: product.imageUrl,
        image_hint: product.imageHint || null
      })
      .eq('id', product.id);

    if (error) {
      console.error('Error updating product:', error.message);
      throw error;
    } else {
      await fetchCatalog();
    }
  };

  const adminDeleteProduct = async (productId: string) => {
    if (isSupabasePlaceholder()) {
      const newCats = categories.map(c => ({
        ...c,
        products: c.products.filter(p => p.id !== productId)
      }));
      saveMockCategories(newCats);
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error.message);
      throw error;
    } else {
      await fetchCatalog();
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (isSupabasePlaceholder()) {
      const newNotifs = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      saveMockNotifications(newNotifs);
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error.message);
    } else {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
    }
  };

  const clearNotifications = async () => {
    if (isSupabasePlaceholder()) {
      saveMockNotifications([]);
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .neq('id', '');

    if (error) {
      console.error('Error clearing notifications:', error.message);
    } else {
      setNotifications([]);
    }
  };

  const adminUpdateOrderStatus = async (orderId: string, status: 'completed' | 'cancelled') => {
    if (isSupabasePlaceholder()) {
      const updatedOrders = orders.map(ord => 
        ord.id === orderId ? { ...ord, status } : ord
      );
      saveMockOrders(updatedOrders);
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status in Supabase:', error.message);
      throw error;
    } else {
      if (user) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await fetchUserData(authUser.id, user.isAdmin);
        }
      }
    }
  };

  const adminTogglePaymentConfirmed = async (orderId: string, currentVal: boolean) => {
    const nextVal = !currentVal;
    if (isSupabasePlaceholder()) {
      const updatedOrders = orders.map(ord => 
        ord.id === orderId ? { ...ord, paymentConfirmed: nextVal } : ord
      );
      saveMockOrders(updatedOrders);
      return;
    }

    const { error } = await supabase
      .from('orders')
      .update({ payment_confirmed: nextVal })
      .eq('id', orderId);

    if (error) {
      console.error('Error toggling payment confirmation in Supabase:', error.message);
      throw error;
    } else {
      if (user) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await fetchUserData(authUser.id, user.isAdmin);
        }
      }
    }
  };

  const uploadProductImage = async (file: File): Promise<string> => {
    if (isSupabasePlaceholder()) {
      try {
        const base64 = await fileToBase64(file);
        return base64;
      } catch (err) {
        console.error('Mock upload error:', err);
        return '/images/products/cake_chocolate.jpg';
      }
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      console.error('Supabase storage upload error:', error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    if (isSupabasePlaceholder()) {
      const googleUser: User = { 
        username: 'google_user', 
        name: 'Google Test User', 
        isAdmin: false 
      };
      setUser(googleUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('sweet_surprise_user', JSON.stringify(googleUser));
      }
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Google sign in error:', error.message);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{
      categories,
      cart,
      user,
      orders,
      notifications,
      login,
      register,
      logout,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      placeOrder,
      adminAddCategory,
      adminDeleteCategory,
      adminUpdateCategoryName,
      adminAddProduct,
      adminUpdateProduct,
      adminDeleteProduct,
      markNotificationAsRead,
      clearNotifications,
      adminUpdateOrderStatus,
      adminTogglePaymentConfirmed,
      uploadProductImage,
      signInWithGoogle
    }}>
      {isLoaded && children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
