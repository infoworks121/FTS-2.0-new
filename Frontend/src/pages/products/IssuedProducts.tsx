import { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Package, 
  Filter,
  X,
  ChevronRight,
  User,
  ExternalLink,
  Tag,
  ShoppingCart,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { productApi } from "@/lib/productApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/context/CartContext";
import { CartSheet } from "@/components/cart/CartSheet";

interface IssuedProduct {
  id: string;
  name: string;
  sku: string;
  description: string;
  thumbnail_url: string;
  image_urls: string[];
  category_name: string;
  mrp: string;
  selling_price: string;
  unit: string;
  seller_name: string;
  business_name: string;
  business_address: string;
  available_stock: number;
}

export default function IssuedProducts() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<IssuedProduct | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const { addToCart, setIsCartOpen } = useCart();

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productApi.getCategories(),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["issued-products", selectedCategory, search],
    queryFn: () => productApi.getIssuedProducts({ 
      category_id: selectedCategory === "all" ? undefined : selectedCategory,
      search: search || undefined
    }),
  });

  const categories = categoriesData?.categories || [];
  const products: IssuedProduct[] = productsData?.products || [];

  const handleGetQuote = (product: IssuedProduct) => {
    setSelectedProduct(product);
    setIsQuoteModalOpen(true);
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  };

  const handleAddToCart = (product: IssuedProduct) => {
    addToCart({
      id: product.id,
      name: product.name,
      category: product.category_name,
      image: product.thumbnail_url,
      basePrice: Number(product.selling_price || product.mrp || 0),
      quantity: 1,
      stock: product.available_stock,
    });
  };

  const handleBuyNow = (product: IssuedProduct) => {
    handleAddToCart(product);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header / Search Area */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <h1 className="text-xl font-bold text-slate-900 border-r pr-6 hidden md:block">Marketplace</h1>
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input 
                placeholder="Search products, brands or suppliers..." 
                className="pl-10 h-11 border-slate-200 focus-visible:ring-emerald-500 rounded-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <CartSheet />
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6">
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar - Categories */}
          <aside className="w-full lg:w-64 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 font-bold text-slate-900 uppercase tracking-wider text-xs">
                <Filter className="h-4 w-4 text-emerald-600" />
                Categories
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === "all" 
                      ? "bg-emerald-50 text-emerald-700 font-semibold" 
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id.toString())}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat.id.toString() 
                        ? "bg-emerald-50 text-emerald-700 font-semibold" 
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200/50">
              <h4 className="font-bold mb-2">Grow Your Business</h4>
              <p className="text-xs text-emerald-50 opacity-90 leading-relaxed">
                Connect with suppliers directly and get the best prices for your bulk requirements.
              </p>
            </div>
          </aside>

          {/* Main Content - Product List */}
          <main className="flex-1 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-900">{products.length}</span> products
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="overflow-hidden border-slate-100 shadow-sm">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row gap-6 p-6">
                        <Skeleton className="w-full md:w-48 h-48 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-4 pt-2">
                          <Skeleton className="h-8 w-2/3" />
                          <Skeleton className="h-4 w-1/3" />
                          <div className="flex gap-4">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-10 w-32" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-20 text-center">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                  We couldn't find any issued products matching your criteria.
                </p>
                <Button 
                  variant="link" 
                  className="text-emerald-600 mt-4"
                  onClick={() => {setSearch(""); setSelectedCategory("all");}}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <Card key={product.id} className="group overflow-hidden border-slate-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row gap-6 p-6">
                        {/* Image */}
                        <div className="w-full md:w-56 h-56 bg-white border border-slate-50 rounded-2xl overflow-hidden shrink-0 group-hover:scale-[1.02] transition-transform duration-500 flex items-center justify-center relative">
                          {product.thumbnail_url ? (
                            <img 
                              src={product.thumbnail_url} 
                              alt={product.name} 
                              className="w-full h-full object-contain p-4"
                            />
                          ) : (
                            <Package className="h-16 w-16 text-slate-100" />
                          )}
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white/90 backdrop-blur-sm text-emerald-700 border-none shadow-sm text-[10px] uppercase font-bold tracking-tighter">
                              {product.category_name}
                            </Badge>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                              {product.name}
                            </h2>
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                              <Building2 className="h-4 w-4 text-emerald-500" />
                              <span className="font-medium text-slate-700">{product.business_name || product.seller_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-xs">
                              <MapPin className="h-4 w-4 text-emerald-500" />
                              <span>{product.business_address || "Location not available"}</span>
                            </div>
                            
                            <div className="pt-4 flex flex-wrap gap-4 items-end">
                              <div>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Selling Price</p>
                                <p className="text-2xl font-black text-slate-900">
                                  {formatCurrency(product.selling_price)}
                                  <span className="text-xs font-normal text-slate-400 ml-1">/{product.unit || 'Unit'}</span>
                                </p>
                              </div>
                              <div className="pb-1">
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none">
                                  In Stock: {product.available_stock}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="pt-6 flex flex-wrap gap-2">
                            <Button 
                              onClick={() => handleBuyNow(product)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 h-11 font-bold shadow-lg shadow-emerald-500/20"
                            >
                              <Zap className="mr-2 h-4 w-4" /> Buy Now
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => handleAddToCart(product)}
                              className="rounded-full px-6 h-11 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                            </Button>
                            <Button 
                              variant="ghost" 
                              onClick={() => handleGetQuote(product)}
                              className="rounded-full px-4 h-11 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                            >
                              Get Quote
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Get Quote Modal */}
      <Dialog open={isQuoteModalOpen} onOpenChange={setIsQuoteModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none rounded-3xl">
          <DialogHeader className="p-8 bg-slate-900 text-white">
            <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-2xl font-bold">Contact Supplier</DialogTitle>
            <DialogDescription className="text-slate-400 mt-2">
              Get in touch with <span className="text-emerald-400 font-bold">{selectedProduct?.business_name || selectedProduct?.seller_name}</span> for wholesale inquiries.
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Contact Person</p>
                  <p className="font-bold text-slate-900">{selectedProduct?.seller_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Phone Number</p>
                  <p className="font-bold text-slate-900">+91 XXX XXX XXXX</p>
                  <p className="text-[10px] text-emerald-600 font-bold">Verified ✅</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-0.5">Business Address</p>
                  <p className="font-bold text-slate-900 leading-snug">{selectedProduct?.business_address || "Address available on request"}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-emerald-200 shrink-0">
                   {selectedProduct?.thumbnail_url ? (
                     <img src={selectedProduct.thumbnail_url} alt="" className="w-full h-full object-contain p-1" />
                   ) : <Package className="w-full h-full p-2 text-slate-200" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-800 line-clamp-1">{selectedProduct?.name}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">{formatCurrency(selectedProduct?.selling_price || 0)} per {selectedProduct?.unit}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 flex-col sm:flex-col gap-3">
             <Button className="w-full h-12 bg-slate-900 hover:bg-emerald-600 rounded-full font-bold group">
               Call Now 
               <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
             </Button>
             <p className="text-center text-[10px] text-slate-400">
               By clicking Call Now, you agree to connect with the supplier via FTS secure bridge.
             </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
