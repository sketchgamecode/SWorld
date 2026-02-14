import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProductList } from './components/ProductList';
import { AdminDashboard } from './components/AdminDashboard';
import { ImageGenerator } from './components/ImageGenerator';
import { Product, CaseStudy } from './types';
import { INITIAL_PRODUCTS, INITIAL_CASES } from './constants';
import { ArrowRight, Phone, Mail, ExternalLink } from 'lucide-react';

// Simple router replacement since we are in a single file structure context
type Page = 'home' | 'admin' | 'generate';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cases, setCases] = useState<CaseStudy[]>(INITIAL_CASES);

  // Load products from local storage
  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (e) {
        console.error("Failed to parse products from local storage");
      }
    }
  }, []);

  // Load cases from local storage
  useEffect(() => {
    const savedCases = localStorage.getItem('cases');
    if (savedCases) {
      try {
        setCases(JSON.parse(savedCases));
      } catch (e) {
        console.error("Failed to parse cases from local storage");
      }
    }
  }, []);

  // Save products
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  // Save cases
  useEffect(() => {
    localStorage.setItem('cases', JSON.stringify(cases));
  }, [cases]);

  // Product Handlers
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts([...products, newProduct]);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('确定要删除这个产品吗?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };
  
  const handleImportProducts = (newProducts: Product[]) => {
    if (window.confirm(`即将导入 ${newProducts.length} 个产品，这将覆盖当前所有产品数据。确定要继续吗？`)) {
      setProducts(newProducts);
      alert('导入成功！');
    }
  };

  // Case Study Handlers
  const handleAddCase = (newCase: CaseStudy) => {
    setCases([...cases, newCase]);
  };

  const handleUpdateCase = (updatedCase: CaseStudy) => {
    setCases(cases.map(c => c.id === updatedCase.id ? updatedCase : c));
  };

  const handleDeleteCase = (id: string) => {
    if (window.confirm('确定要删除这个案例吗?')) {
      setCases(cases.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />

      {currentPage === 'home' && (
        <main>
          {/* Hero Section */}
          <div className="relative bg-slate-900 overflow-hidden">
            <div className="absolute inset-0">
              <img
                className="w-full h-full object-cover opacity-30"
                src="https://picsum.photos/1920/1080?random=10"
                alt="Security Background"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-transparent mix-blend-multiply" />
            </div>
            <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                数智安防世界
              </h1>
              <p className="mt-6 text-xl text-slate-300 max-w-3xl">
                连接物理与数字世界，构建全场景智能安全防线。我们要做的不仅仅是监控，更是洞察。
              </p>
              <div className="mt-10 flex space-x-4">
                <a href="#products" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-slate-900 bg-blue-400 hover:bg-blue-500 transition-colors">
                  浏览产品
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <button onClick={() => setCurrentPage('generate')} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-100 bg-slate-800 bg-opacity-60 hover:bg-opacity-70 transition-colors">
                  AI 展厅
                </button>
              </div>
            </div>
          </div>

          {/* Product List */}
          <div id="products">
            <ProductList products={products} />
          </div>

          {/* Case Studies */}
          <div className="bg-slate-100 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-12 text-center">成功案例</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {cases.map(c => (
                  <div key={c.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row h-full">
                     <div className="md:w-1/3 h-48 md:h-auto">
                        <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                     </div>
                     <div className="p-6 md:w-2/3 flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">{c.title}</h3>
                        <p className="text-slate-600 text-sm leading-relaxed mb-4">{c.description}</p>
                        {c.linkUrl && (
                          <a href={c.linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                            查看案例详情 <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        )}
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact / Footer */}
          <footer className="bg-slate-900 text-slate-400 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-white text-lg font-bold mb-4">联系我们</h4>
                <div className="flex items-center mb-2">
                  <Phone className="h-5 w-5 mr-2" />
                  <span>400-888-8888</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>sales@security-world.com</span>
                </div>
              </div>
              <div>
                <h4 className="text-white text-lg font-bold mb-4">关于我们</h4>
                <p className="text-sm">
                  致力于为全球客户提供最先进的数智安防产品与解决方案。
                </p>
              </div>
              <div>
                 <p className="text-xs text-slate-600 mt-8 md:mt-0">
                   © 2024 Digital Intelligent Security World. All rights reserved.
                 </p>
              </div>
            </div>
          </footer>
        </main>
      )}

      {currentPage === 'admin' && (
        <AdminDashboard 
          products={products}
          onUpdateProduct={handleUpdateProduct}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onImportProducts={handleImportProducts}
          caseStudies={cases}
          onAddCase={handleAddCase}
          onUpdateCase={handleUpdateCase}
          onDeleteCase={handleDeleteCase}
          onSwitchToGenerator={() => setCurrentPage('generate')}
        />
      )}

      {currentPage === 'generate' && (
        <ImageGenerator />
      )}
    </div>
  );
}
