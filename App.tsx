
import React, { useState, useEffect } from 'react';
import { Tab, Order, Product, Customer, OrderStatus, CompanyProfile } from './types';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_CUSTOMERS, DEFAULT_COMPANY } from './mockData';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import FloatingButton from './components/FloatingButton';
import TabDashboard from './components/TabDashboard';
import TabOrders from './components/TabOrders';
import TabProducts from './components/TabProducts';
import TabCustomers from './components/TabCustomers';
import NewProductModal from './components/NewProductModal';
import ProductDetails from './components/ProductDetails';
import NewCustomerModal from './components/NewCustomerModal';
import CustomerDetails from './components/CustomerDetails';
import NewOrderModal from './components/NewOrderModal';
import OrderDetails from './components/OrderDetails';
import CompanyProfileModal from './components/CompanyProfileModal';
import AnalyticsDetails from './components/AnalyticsDetails';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthScreen from './components/AuthScreen';
import { 
  doc, 
  setDoc, 
  deleteDoc, 
  collection, 
  writeBatch,
  onSnapshot,
  query
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { db } from './firebase';

// Main App Content Component
const AppContent: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ORDERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  
  // State for Data
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(DEFAULT_COMPANY);

  // --- Real-time Firestore Sync (onSnapshot) ---

  useEffect(() => {
    if (!user) return;

    setLoadingData(true);

    // 1. Listener for Company Profile (Root Doc: empresas/{uid})
    const profileRef = doc(db, "empresas", user.uid);
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.profile) {
          setCompanyProfile(data.profile);
        }
      } else {
        // Initialize Profile if doc doesn't exist
        const initialProfile = {
            ...DEFAULT_COMPANY,
            name: user.displayName || DEFAULT_COMPANY.name,
            email: user.email || DEFAULT_COMPANY.email,
            logo: user.photoURL || DEFAULT_COMPANY.logo
        };
        setDoc(profileRef, { profile: initialProfile }, { merge: true });
      }
    });

    // 2. Listener for Products (Subcollection: empresas/{uid}/produtos)
    const productsRef = collection(db, "empresas", user.uid, "produtos");
    const unsubProducts = onSnapshot(productsRef, (snapshot) => {
      const loadedProducts = snapshot.docs.map(d => d.data() as Product);
      setProducts(loadedProducts);
      
      // Seeding Logic handled after initial load check if needed, 
      // but separated to avoid loops. See separate useEffect for seeding.
    });

    // 3. Listener for Customers (Subcollection: empresas/{uid}/clientes)
    const customersRef = collection(db, "empresas", user.uid, "clientes");
    const unsubCustomers = onSnapshot(customersRef, (snapshot) => {
      const loadedCustomers = snapshot.docs.map(d => d.data() as Customer);
      setCustomers(loadedCustomers);
    });

    // 4. Listener for Orders (Subcollection: empresas/{uid}/pedidos)
    const ordersRef = collection(db, "empresas", user.uid, "pedidos");
    const unsubOrders = onSnapshot(ordersRef, (snapshot) => {
      const loadedOrders = snapshot.docs.map(d => d.data() as Order);
      // Sort by date descending by default for state
      setOrders(loadedOrders.sort((a, b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime()));
      setLoadingData(false);
    });

    // Cleanup listeners on unmount
    return () => {
      unsubProfile();
      unsubProducts();
      unsubCustomers();
      unsubOrders();
    };
  }, [user]);

  // --- One-time Seeding Logic ---
  useEffect(() => {
    if (!user || loadingData) return;

    // Check if data is empty to trigger seed
    // We add a small delay or check logic to ensure we don't seed if data is just loading
    // Here we assume if all arrays are empty after loadingData is false, it's a fresh account
    const seedDatabase = async () => {
      if (products.length === 0 && customers.length === 0 && orders.length === 0) {
         // double check with a one-time fetch to be safe? 
         // Ideally handled by verifying a flag, but here we check lengths.
         // To prevent re-seeding if user genuinely deleted everything, we could check a 'setupComplete' flag in profile.
         // For simplicity in this demo:
         
         console.log("Seeding database for new company...");
         const batch = writeBatch(db);

         // Seed Products -> /produtos
         MOCK_PRODUCTS.forEach(p => {
           const ref = doc(db, "empresas", user.uid, "produtos", p.id);
           batch.set(ref, p);
         });

         // Seed Customers -> /clientes
         MOCK_CUSTOMERS.forEach(c => {
           const ref = doc(db, "empresas", user.uid, "clientes", c.id.toString());
           batch.set(ref, c);
         });

         // Seed Orders -> /pedidos
         MOCK_ORDERS.forEach(o => {
           const ref = doc(db, "empresas", user.uid, "pedidos", o.id);
           batch.set(ref, o);
         });

         await batch.commit();
      }
    };

    // Only try to seed once when we believe data is loaded
    if (!loadingData) {
       // Small timeout to allow snapshot to populate if it was slightly delayed (though loadingData handles most)
       setTimeout(() => seedDatabase(), 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingData, user]); // Depend on loadingData turning false


  // UI State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Reset search and selections when tab changes
  useEffect(() => {
    setSearchQuery('');
    if (activeTab !== Tab.PRODUCTS) setSelectedProduct(null);
    if (activeTab !== Tab.CUSTOMERS) setSelectedCustomer(null);
    if (activeTab !== Tab.ORDERS) setSelectedOrder(null);
  }, [activeTab]);

  const pendingCount = orders.filter(o => o.status === OrderStatus.PENDING).length;

  // --- Product Handlers (Firestore: empresas/{uid}/produtos) ---
  const handleSaveProduct = async (product: Product) => {
    if (!user) return;
    setEditingProduct(null);
    try {
      await setDoc(doc(db, "empresas", user.uid, "produtos", product.id), product);
    } catch (e) {
      console.error("Error saving product", e);
      alert("Erro ao salvar produto.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!user) return;
    setSelectedProduct(null);
    try {
      await deleteDoc(doc(db, "empresas", user.uid, "produtos", productId));
    } catch (e) {
      console.error("Error deleting product", e);
    }
  };

  const handleEditProductClick = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  // --- Customer Handlers (Firestore: empresas/{uid}/clientes) ---
  const handleSaveCustomer = async (customer: Customer) => {
    if (!user) return;
    setEditingCustomer(null);
    try {
      await setDoc(doc(db, "empresas", user.uid, "clientes", customer.id.toString()), customer);
    } catch (e) {
      console.error("Error saving customer", e);
      alert("Erro ao salvar cliente.");
    }
  };

  const handleDeleteCustomer = async (customerId: number) => {
    if (!user) return;
    setSelectedCustomer(null);
    try {
      await deleteDoc(doc(db, "empresas", user.uid, "clientes", customerId.toString()));
    } catch (e) {
      console.error("Error deleting customer", e);
    }
  };

  const handleEditCustomerClick = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  // --- Order Handlers (Firestore: empresas/{uid}/pedidos) ---
  const handleSaveOrder = async (order: Order) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "empresas", user.uid, "pedidos", order.id), order);
      
      // Update customer last order date
      const customer = customers.find(c => c.id === order.customerId);
      if (customer) {
          const updatedCustomer = { ...customer, lastOrderDate: order.deliveryDate };
          await setDoc(doc(db, "empresas", user.uid, "clientes", customer.id.toString()), updatedCustomer);
      }
    } catch (e) {
      console.error("Error saving order", e);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, paymentMethod?: string) => {
    if (!user) return;
    const orderToUpdate = orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const updatedOrder = { 
      ...orderToUpdate, 
      status,
      ...(paymentMethod && { paymentMethod })
    };
    
    // If currently selected, update local state immediately for UI responsiveness
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(updatedOrder);
    }

    try {
      await setDoc(doc(db, "empresas", user.uid, "pedidos", orderId), updatedOrder);
    } catch (e) {
      console.error("Error updating order status", e);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!user) return;
    setSelectedOrder(null);
    try {
      await deleteDoc(doc(db, "empresas", user.uid, "pedidos", orderId));
    } catch (e) {
      console.error("Error deleting order", e);
    }
  };

  const handleOrderCustomerClick = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
       setSelectedOrder(null);
       setActiveTab(Tab.CUSTOMERS);
       setSelectedCustomer(customer);
    }
  };

  const handleOrderProductClick = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
       setSelectedOrder(null);
       setActiveTab(Tab.PRODUCTS);
       setSelectedProduct(product);
    }
  };

  // --- Profile Handler (Root Doc: empresas/{uid}) ---
  const handleSaveProfile = async (updatedProfile: CompanyProfile) => {
    if (!user) return;
    setCompanyProfile(updatedProfile); // Optimistic
    try {
       await setDoc(doc(db, "empresas", user.uid), { profile: updatedProfile }, { merge: true });
    } catch (e) {
       console.error("Error saving profile", e);
    }
  };

  // --- Account Deletion ---
  const handleDeleteAccount = async () => {
    if(!user) return;
    setLoadingData(true);
    try {
        const batch = writeBatch(db);
        
        // Delete products
        products.forEach(p => {
            batch.delete(doc(db, "empresas", user.uid, "produtos", p.id));
        });
        // Delete customers
        customers.forEach(c => {
            batch.delete(doc(db, "empresas", user.uid, "clientes", c.id.toString()));
        });
        // Delete orders
        orders.forEach(o => {
            batch.delete(doc(db, "empresas", user.uid, "pedidos", o.id));
        });
        
        // Delete company root doc
        batch.delete(doc(db, "empresas", user.uid));
        
        await batch.commit();
        await deleteUser(user);
        // AuthContext handles logout
    } catch (error) {
        console.error("Error deleting account", error);
        alert("Erro ao excluir conta. É necessário ter feito login recentemente.");
        setLoadingData(false);
    }
  };

  const handleFabClick = () => {
    if (activeTab === Tab.ORDERS) {
      setIsOrderModalOpen(true);
    } else if (activeTab === Tab.PRODUCTS) {
       setEditingProduct(null);
       setIsProductModalOpen(true);
    } else if (activeTab === Tab.CUSTOMERS) {
       setEditingCustomer(null);
       setIsCustomerModalOpen(true);
    } else {
      setIsOrderModalOpen(true);
    }
  };

  const getTitle = () => {
    if (activeTab === Tab.PRODUCTS && selectedProduct) return 'Detalhes do Produto';
    if (activeTab === Tab.CUSTOMERS && selectedCustomer) return 'Detalhes do Cliente';
    if (activeTab === Tab.ORDERS && selectedOrder) return 'Detalhes do Pedido';
    
    switch (activeTab) {
      case Tab.DASHBOARD: return 'Painel Geral';
      case Tab.ORDERS: return 'Pedidos';
      case Tab.PRODUCTS: return 'Produtos';
      case Tab.CUSTOMERS: return 'Clientes';
      default: return 'AnoteiFacil';
    }
  };

  // --- New Helper for Search Placeholder ---
  const getSearchPlaceholder = () => {
    if (activeTab === Tab.PRODUCTS) return 'Buscar produto ou cód. barras...';
    if (activeTab === Tab.CUSTOMERS) return 'Buscar nome, CPF ou CNPJ...';
    return 'Pesquisar...';
  };

  const renderContent = () => {
    if (loadingData) return <LoadingScreen />;

    switch (activeTab) {
      case Tab.DASHBOARD:
        return <TabDashboard orders={orders} onViewAnalytics={() => setIsAnalyticsOpen(true)} />;
      case Tab.ORDERS:
        return <TabOrders orders={orders} onOrderClick={setSelectedOrder} />;
      case Tab.PRODUCTS:
        return (
          <TabProducts 
            products={products} 
            searchQuery={searchQuery} 
            onProductClick={setSelectedProduct}
          />
        );
      case Tab.CUSTOMERS:
        return (
          <TabCustomers 
            customers={customers} 
            searchQuery={searchQuery}
            onCustomerClick={setSelectedCustomer} 
          />
        );
      default:
        return null;
    }
  };

  const isDetailsOpen = selectedProduct || selectedCustomer || selectedOrder || isAnalyticsOpen;
  const showSearch = !isDetailsOpen && (activeTab === Tab.PRODUCTS || activeTab === Tab.CUSTOMERS);

  return (
    <div className="min-h-screen bg-wa-bg text-wa-textPrimary font-sans relative selection:bg-wa-green selection:text-black">
      {/* Main Header */}
      {(!isDetailsOpen) && (
        <div className="relative">
            <Header 
            title={getTitle()} 
            showSearch={showSearch} 
            onSearch={setSearchQuery} 
            searchValue={searchQuery}
            onProfileClick={() => setIsProfileModalOpen(true)}
            searchPlaceholder={getSearchPlaceholder()}
            />
        </div>
      )}
      
      <main className="w-full max-w-md mx-auto min-h-screen relative">
        {renderContent()}
        
        {activeTab === Tab.PRODUCTS && selectedProduct && (
          <ProductDetails 
            product={selectedProduct} 
            onBack={() => setSelectedProduct(null)}
            onEdit={handleEditProductClick}
            onDelete={handleDeleteProduct}
          />
        )}

        {activeTab === Tab.CUSTOMERS && selectedCustomer && (
          <CustomerDetails 
            customer={selectedCustomer}
            onBack={() => setSelectedCustomer(null)}
            onEdit={handleEditCustomerClick}
            onDelete={handleDeleteCustomer}
          />
        )}

        {activeTab === Tab.ORDERS && selectedOrder && (
          <OrderDetails 
             order={selectedOrder}
             customers={customers}
             companyProfile={companyProfile}
             onBack={() => setSelectedOrder(null)}
             onUpdateStatus={handleUpdateOrderStatus}
             onDelete={handleDeleteOrder}
             onCustomerClick={handleOrderCustomerClick}
             onProductClick={handleOrderProductClick}
          />
        )}

        {isAnalyticsOpen && (
          <AnalyticsDetails 
            orders={orders}
            onBack={() => setIsAnalyticsOpen(false)}
          />
        )}
      </main>

      {!isDetailsOpen && <FloatingButton onClick={handleFabClick} />}

      {!isDetailsOpen && (
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          pendingOrdersCount={pendingCount}
        />
      )}

      <NewProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
      />

      <NewCustomerModal 
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSaveCustomer}
        customerToEdit={editingCustomer}
      />

      <NewOrderModal 
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSave={handleSaveOrder}
        customers={customers}
        products={products}
      />
      
      <CompanyProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={companyProfile}
        onSave={handleSaveProfile}
        onLogout={logout}
        onDeleteAccount={handleDeleteAccount}
      />
    </div>
  );
};

// Loading Component
const LoadingScreen = () => (
    <div className="min-h-screen bg-wa-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-wa-green border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>
  );
};

const AuthConsumer: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <AuthScreen />;
    }

    return <AppContent />;
}

export default App;
