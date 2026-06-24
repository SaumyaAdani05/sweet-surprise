'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, ShoppingCart, IndianRupee, Bell, Settings, Plus, Trash2, 
  Edit, Save, X, LayoutDashboard, Menu, ClipboardList, LogIn, LogOut
} from 'lucide-react';

export default function AdminPage() {
  const { 
    user, login, logout, categories, orders, notifications, 
    adminAddCategory, adminDeleteCategory, adminUpdateCategoryName,
    adminAddProduct, adminUpdateProduct, adminDeleteProduct,
    markNotificationAsRead, clearNotifications,
    adminUpdateOrderStatus, adminTogglePaymentConfirmed,
    uploadProductImage
  } = useApp();
  const { toast } = useToast();

  // Admin login state
  const [adminPass, setAdminPass] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Category management state
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Product management state
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCat, setNewProdCat] = useState('');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingSelectedFile, setEditingSelectedFile] = useState<File | null>(null);
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);

  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [editingProdName, setEditingProdName] = useState('');
  const [editingProdDesc, setEditingProdDesc] = useState('');
  const [editingProdPrice, setEditingProdPrice] = useState('');
  const [editingProdCat, setEditingProdCat] = useState('');
  const [editingProdImg, setEditingProdImg] = useState('');

  // Stats calculation
  const totalSales = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsersStr = localStorage.getItem('sweet_surprise_registered_users');
      const registeredUsers = storedUsersStr ? JSON.parse(storedUsersStr) : {};
      setRegisteredUsersCount(Object.keys(registeredUsers).length);
    }
  }, [user]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPass) return;

    setIsLoginLoading(true);
    const res = await login('admin2602', adminPass);
    setIsLoginLoading(false);

    if (res.success) {
      toast({
        title: "Welcome Back, Owner!",
        description: "Admin Panel unlocked.",
        className: "bg-primary text-primary-foreground border-none shadow-xl"
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid admin password.",
        variant: "destructive"
      });
    }
  };

  // Add Category Handler
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    adminAddCategory(newCatName);
    setNewCatName('');
    toast({
      title: "Category Added",
      description: `"${newCatName}" section created successfully.`,
      className: "bg-primary text-primary-foreground border-none shadow-xl"
    });
  };

  // Save Category Rename
  const handleSaveCategoryRename = (id: string) => {
    if (!editingCatName) return;
    adminUpdateCategoryName(id, editingCatName);
    setEditingCatId(null);
    setEditingCatName('');
    toast({
      title: "Category Updated",
      description: "Section renamed successfully.",
      className: "bg-primary text-primary-foreground border-none shadow-xl"
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPEG, PNG, or WEBP image.",
        variant: "destructive"
      });
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size must be less than 2MB.",
        variant: "destructive"
      });
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPEG, PNG, or WEBP image.",
        variant: "destructive"
      });
      e.target.value = '';
      setEditingSelectedFile(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size must be less than 2MB.",
        variant: "destructive"
      });
      e.target.value = '';
      setEditingSelectedFile(null);
      return;
    }

    setEditingSelectedFile(file);
  };

  // Add Product Handler
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdDesc || !newProdPrice || !newProdCat) {
      toast({
        title: "Validation Error",
        description: "Please fill in all product fields.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "Validation Error",
        description: "Please select a product image.",
        variant: "destructive"
      });
      return;
    }

    setIsProductSubmitting(true);
    try {
      const uploadedImgUrl = await uploadProductImage(selectedFile);

      await adminAddProduct({
        name: newProdName,
        description: newProdDesc,
        price: newProdPrice.startsWith('RS') ? newProdPrice : `RS ${newProdPrice}`,
        category: newProdCat,
        imageUrl: uploadedImgUrl
      });

      setNewProdName('');
      setNewProdDesc('');
      setNewProdPrice('');
      setSelectedFile(null);
      const fileInput = document.getElementById('quick-prod-img') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      toast({
        title: "Product Created",
        description: `"${newProdName}" added to catalog.`,
        className: "bg-primary text-primary-foreground border-none shadow-xl"
      });
    } catch (err: any) {
      toast({
        title: "Creation Failed",
        description: err.message || "Failed to upload image or save product",
        variant: "destructive"
      });
    } finally {
      setIsProductSubmitting(false);
    }
  };

  // Edit Product Loader
  const startEditProduct = (prod: any) => {
    setEditingProdId(prod.id);
    setEditingProdName(prod.name);
    setEditingProdDesc(prod.description);
    setEditingProdPrice(prod.price.replace('RS ', ''));
    setEditingProdCat(prod.category);
    setEditingProdImg(prod.imageUrl);
    setEditingSelectedFile(null);
  };

  // Save Product Changes
  const handleSaveProductEdit = async () => {
    if (!editingProdId || !editingProdName || !editingProdDesc || !editingProdPrice || !editingProdCat) return;

    setIsProductSubmitting(true);
    try {
      let finalImgUrl = editingProdImg;
      if (editingSelectedFile) {
        finalImgUrl = await uploadProductImage(editingSelectedFile);
      }

      await adminUpdateProduct({
        id: editingProdId,
        name: editingProdName,
        description: editingProdDesc,
        price: editingProdPrice.startsWith('RS') ? editingProdPrice : `RS ${editingProdPrice}`,
        category: editingProdCat,
        imageUrl: finalImgUrl
      });

      setEditingProdId(null);
      setEditingSelectedFile(null);
      toast({
        title: "Product Updated",
        description: `"${editingProdName}" details updated successfully.`,
        className: "bg-primary text-primary-foreground border-none shadow-xl"
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update product details",
        variant: "destructive"
      });
    } finally {
      setIsProductSubmitting(false);
    }
  };

  // Handle Order Status Change
  const updateOrderStatus = async (orderId: string, status: 'completed' | 'cancelled') => {
    try {
      await adminUpdateOrderStatus(orderId, status);
      toast({
        title: "Order Updated",
        description: `Order ${orderId} marked as ${status}.`,
        className: "bg-primary text-primary-foreground border-none shadow-xl"
      });
    } catch (error: any) {
      toast({
        title: "Error Updating Status",
        description: error.message || "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  // Toggle Payment Confirmation Status
  const togglePaymentConfirmed = async (orderId: string, currentVal: boolean) => {
    try {
      await adminTogglePaymentConfirmed(orderId, currentVal);
      toast({
        title: "Payment Updated",
        description: `Order ${orderId} payment status updated.`,
        className: "bg-primary text-primary-foreground border-none shadow-xl"
      });
    } catch (error: any) {
      toast({
        title: "Error Updating Payment",
        description: error.message || "Failed to update payment status",
        variant: "destructive"
      });
    }
  };

  // If not logged in as Admin, show login form
  if (!user || !user.isAdmin) {
    return (
      <div className="container mx-auto max-w-md py-24 px-4 font-body">
        <Card className="border shadow-lg rounded-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-headline text-center flex items-center justify-center space-x-2">
              <span>Admin Access Gate</span>
            </CardTitle>
            <CardDescription className="text-center">
              Enter Owner password to access control panel dashboard.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleAdminLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input 
                  id="admin-password" 
                  type="password" 
                  placeholder="Enter admin password" 
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoginLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center space-x-2">
                <LogIn className="w-4 h-4" />
                <span>{isLoginLoading ? 'Unlocking...' : 'Unlock Admin Panel'}</span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl py-10 px-4 md:px-6 font-body text-foreground">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline">Sweet Surprise - Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back, Owner Rinku Adani</p>
        </div>
        <Button variant="outline" size="sm" onClick={logout} className="self-start md:self-auto flex items-center space-x-1 border-primary/20 hover:bg-primary/5">
          <LogOut className="w-4 h-4 mr-1 text-primary" />
          <span>Exit Dashboard</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-muted/60 p-1 rounded-xl h-auto gap-1 border">
          <TabsTrigger value="overview" className="rounded-lg py-2 text-sm font-semibold transition-all flex items-center space-x-1">
            <LayoutDashboard className="w-4 h-4 hidden sm:inline" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-lg py-2 text-sm font-semibold transition-all flex items-center space-x-1">
            <ClipboardList className="w-4 h-4 hidden sm:inline" />
            <span>Orders</span>
          </TabsTrigger>
          <TabsTrigger value="catalog" className="rounded-lg py-2 text-sm font-semibold transition-all flex items-center space-x-1">
            <Menu className="w-4 h-4 hidden sm:inline" />
            <span>Catalog</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg py-2 text-sm font-semibold transition-all flex items-center space-x-1 relative">
            <Bell className="w-4 h-4 hidden sm:inline" />
            <span>Notifications</span>
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground font-bold">
                {unreadNotifsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border shadow-sm">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-3 bg-green-100 dark:bg-green-950/30 text-green-600 rounded-full">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Total Sales</p>
                  <p className="text-2xl font-bold text-foreground">RS {totalSales}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-950/30 text-blue-600 rounded-full">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-950/30 text-yellow-600 rounded-full">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Pending Orders</p>
                  <p className="text-2xl font-bold text-foreground">{pendingOrders.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-sm">
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-950/30 text-purple-600 rounded-full">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Active Customers</p>
                  <p className="text-2xl font-bold text-foreground">{registeredUsersCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Add Product */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="font-headline text-lg">Quick Add Product</CardTitle>
                <CardDescription>Directly insert a new dessert item into the menu catalog.</CardDescription>
              </CardHeader>
              <form onSubmit={handleAddProduct}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quick-prod-name">Product Name</Label>
                      <Input
                        id="quick-prod-name"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        placeholder="e.g. Caramel Fudge Cake"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quick-prod-price">Price (Numerical)</Label>
                      <Input
                        id="quick-prod-price"
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                        placeholder="e.g. 650"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quick-prod-cat">Category Section</Label>
                    <select
                      id="quick-prod-cat"
                      value={newProdCat}
                      onChange={(e) => setNewProdCat(e.target.value)}
                      className="w-full bg-background border border-input text-foreground text-sm rounded-md h-10 px-3 outline-none"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quick-prod-desc">Description</Label>
                    <Textarea
                      id="quick-prod-desc"
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      placeholder="Enter description and details"
                      rows={2}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quick-prod-img" className="font-semibold">Product Image</Label>
                    <Input
                      id="quick-prod-img"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      required
                    />
                    <p className="text-[10px] text-muted-foreground">JPEG, PNG or WEBP only (max 2MB)</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isProductSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center space-x-1 shadow-sm">
                    {isProductSubmitting ? 'Uploading & Creating...' : (
                      <>
                        <Plus className="w-4 h-4 mr-1" />
                        <span>Add New Product</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {/* Quick Add Section */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="font-headline text-lg">Create Category Section</CardTitle>
                <CardDescription>Create a new tab category section in the store menu.</CardDescription>
              </CardHeader>
              <form onSubmit={handleAddCategory}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quick-cat-name">Category Section Name</Label>
                    <Input
                      id="quick-cat-name"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Indian Desserts"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center justify-center space-x-1 shadow-sm">
                    <Plus className="w-4 h-4 mr-1" />
                    <span>Create Category</span>
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Orders */}
        <TabsContent value="orders">
          <Card className="border shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Manage Customer Orders</CardTitle>
              <CardDescription>Monitor and process incoming cake, chocolate, and cookie order requests.</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No orders have been placed yet.
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((ord) => (
                    <div key={ord.id} className="border p-5 rounded-xl space-y-4 bg-muted/20">
                      {/* Order info line */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-2">
                        <div>
                          <p className="text-sm font-bold text-foreground">Order ID: {ord.id}</p>
                          <p className="text-xs text-muted-foreground">Placed on: {new Date(ord.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                            ord.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-950/30' :
                            ord.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-950/30' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30'
                          }`}>
                            {ord.status}
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                            ord.paymentConfirmed ? 'bg-green-100 text-green-700 dark:bg-green-950/30' :
                            'bg-orange-100 text-orange-700 dark:bg-orange-950/30'
                          }`}>
                            {ord.paymentConfirmed ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </div>

                      {/* Customer details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Delivery To</p>
                          <p className="font-semibold text-foreground mt-0.5">{ord.customerName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Contact Phone</p>
                          <p className="font-semibold text-foreground mt-0.5">{ord.customerPhone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">Address</p>
                          <p className="font-semibold text-foreground mt-0.5 leading-normal">{ord.customerAddress}</p>
                        </div>
                      </div>

                      {/* Items table */}
                      <div className="border rounded-lg bg-background overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-muted text-muted-foreground text-xs uppercase">
                            <tr>
                              <th className="px-4 py-2">Item Name</th>
                              <th className="px-4 py-2 text-center">Weight</th>
                              <th className="px-4 py-2 text-center">Qty</th>
                              <th className="px-4 py-2 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ord.items.map((item: any, i: number) => (
                              <tr key={i} className="border-t">
                                <td className="px-4 py-2.5 font-semibold">{item.productName}</td>
                                <td className="px-4 py-2.5 text-center text-muted-foreground">{item.weight || 'Standard'}</td>
                                <td className="px-4 py-2.5 text-center font-bold">{item.quantity}</td>
                                <td className="px-4 py-2.5 text-right font-bold text-primary">RS {item.price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Order Total & Actions */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-2 gap-4">
                        <div>
                          <span className="text-sm font-semibold text-muted-foreground">Order Total Price:</span>{' '}
                          <span className="font-headline font-bold text-xl text-primary">RS {ord.totalPrice}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => togglePaymentConfirmed(ord.id, ord.paymentConfirmed || false)}
                            className="font-semibold text-xs border"
                          >
                            Mark {ord.paymentConfirmed ? 'Unpaid' : 'Paid'}
                          </Button>

                          {ord.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => updateOrderStatus(ord.id, 'completed')}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm"
                              >
                                Mark Completed
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => updateOrderStatus(ord.id, 'cancelled')}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                Cancel Order
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Catalog Management */}
        <TabsContent value="catalog">
          <Card className="border shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="font-headline text-xl">Menu Catalog Manager</CardTitle>
              <CardDescription>Perform full management of category sections and product detail listings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Category CRUD */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">1. Category Sections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between border p-3 rounded-lg bg-muted/20">
                      {editingCatId === cat.id ? (
                        <div className="flex items-center space-x-2 flex-grow mr-4">
                          <Input 
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            className="h-8"
                          />
                          <Button size="icon" className="h-8 w-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleSaveCategoryRename(cat.id)}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setEditingCatId(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="font-semibold">{cat.name} <span className="text-xs text-muted-foreground">({cat.products.length} items)</span></span>
                      )}
                      
                      {editingCatId !== cat.id && (
                        <div className="flex items-center space-x-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditingCatName(cat.name);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            disabled={['cakes', 'chocolates', 'cookies', 'packing_bouquets', 'customization'].includes(cat.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              adminDeleteCategory(cat.id);
                              toast({ title: "Category Deleted", description: "Section removed successfully." });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Product CRUD */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold border-b pb-2">2. Product Catalog Listings</h3>
                
                {categories.map((cat) => (
                  <div key={cat.id} className="space-y-3">
                    <h4 className="font-headline font-bold text-base text-primary uppercase tracking-wide bg-primary/5 p-2 rounded">{cat.name}</h4>
                    <div className="space-y-2 pl-2">
                      {cat.products.map((prod) => (
                        <div key={prod.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border p-3 rounded-lg gap-4 bg-background shadow-xs">
                          {editingProdId === prod.id ? (
                            /* Editing Mode Form */
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full items-end">
                              <div className="space-y-1">
                                <Label className="text-[10px]">Name</Label>
                                <Input value={editingProdName} onChange={(e) => setEditingProdName(e.target.value)} className="h-8" />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px]">Price (Numerical)</Label>
                                <Input value={editingProdPrice} onChange={(e) => setEditingProdPrice(e.target.value)} className="h-8" />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-[10px]">Category</Label>
                                <select 
                                  value={editingProdCat} 
                                  onChange={(e) => setEditingProdCat(e.target.value)}
                                  className="w-full bg-background border border-input rounded-md h-8 px-2 text-xs outline-none"
                                >
                                  {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex space-x-2 justify-end">
                                <Button size="sm" disabled={isProductSubmitting} className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-1" onClick={handleSaveProductEdit}>
                                  <Save className="w-3.5 h-3.5 mr-1" />
                                  <span>{isProductSubmitting ? 'Saving...' : 'Save'}</span>
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingProdId(null)} disabled={isProductSubmitting}>
                                  Cancel
                                </Button>
                              </div>
                              <div className="sm:col-span-2 md:col-span-4 space-y-1 mt-2">
                                <Label className="text-[10px]">Description</Label>
                                <Textarea value={editingProdDesc} onChange={(e) => setEditingProdDesc(e.target.value)} rows={2} className="text-xs" />
                              </div>
                              <div className="sm:col-span-2 md:col-span-4 space-y-1 mt-2">
                                <Label className="text-[10px] font-semibold">Product Image (Optional - leaves current image unchanged)</Label>
                                <Input 
                                  type="file" 
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={handleEditFileChange}
                                  className="h-8 text-xs py-1"
                                />
                              </div>
                            </div>
                          ) : (
                            /* Display Mode */
                            <>
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className="relative w-12 h-12 rounded overflow-hidden border shrink-0 bg-muted">
                                  <img src={prod.imageUrl} alt={prod.name} className="object-cover w-full h-full" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-sm truncate">{prod.name}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">{prod.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 shrink-0 self-end sm:self-auto">
                                <span className="font-bold text-primary text-sm">{prod.price || 'Inquiry Only'}</span>
                                <div className="flex items-center space-x-1 border-l pl-3">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    onClick={() => startEditProduct(prod)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                      adminDeleteProduct(prod.id);
                                      toast({ title: "Product Deleted", description: `"${prod.name}" removed.` });
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Notifications */}
        <TabsContent value="notifications">
          <Card className="border shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="font-headline text-xl">Admin Notifications Log</CardTitle>
                <CardDescription>Review activity logs representing user logins and purchases.</CardDescription>
              </div>
              {notifications.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearNotifications} className="border-red-200 text-red-600 hover:bg-red-50">
                  Clear All Logs
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No notifications recorded.
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`border p-4 rounded-xl flex items-start gap-4 transition-colors ${
                        n.read ? 'bg-background' : 'bg-primary/5 border-primary/20'
                      }`}
                    >
                      <div className={`p-2 rounded-full mt-1 shrink-0 ${
                        n.type === 'purchase' ? 'bg-green-100 text-green-700' : 
                        n.type === 'contact' ? 'bg-purple-100 text-purple-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-sm text-foreground">{n.message}</p>
                          <span className="text-[10px] text-muted-foreground">{new Date(n.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-normal">{n.details}</p>
                        {!n.read && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            onClick={() => markNotificationAsRead(n.id)}
                            className="p-0 h-auto text-xs mt-2 text-primary font-semibold"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
