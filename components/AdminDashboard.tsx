import React, { useState } from 'react';
import { Product, CaseStudy } from '../types';
import { Save, Plus, Trash2, Edit2, Upload, X, FileJson, CheckCircle, Package, Briefcase, Link as LinkIcon } from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onImportProducts: (products: Product[]) => void;
  
  caseStudies: CaseStudy[];
  onAddCase: (caseStudy: CaseStudy) => void;
  onUpdateCase: (caseStudy: CaseStudy) => void;
  onDeleteCase: (id: string) => void;

  onSwitchToGenerator: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, 
  onUpdateProduct, 
  onAddProduct, 
  onDeleteProduct,
  onImportProducts,
  caseStudies,
  onAddCase,
  onUpdateCase,
  onDeleteCase,
  onSwitchToGenerator
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'cases'>('products');

  // Product State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Product | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Case Study State
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [editCaseForm, setEditCaseForm] = useState<CaseStudy | null>(null);

  // --- Product Handlers ---
  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditForm({ ...product });
  };

  const handleSave = () => {
    if (editForm) {
      onUpdateProduct(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleAddNew = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      model: 'NEW-MODEL-001',
      name: '新产品名称',
      category: 'Hardware',
      subCategory: '未分类',
      price: '¥0.00',
      description: '请输入产品描述...',
      features: ['Highlight 1', 'Highlight 2'],
      specs: ['Spec 1', 'Spec 2'],
      imageUrl: 'https://picsum.photos/600/400',
      brochureUrl: ''
    };
    onAddProduct(newProduct);
    handleEdit(newProduct);
  };

  const handleArrayChange = (field: 'specs' | 'features', index: number, value: string) => {
    if (!editForm) return;
    const newArray = [...editForm[field]];
    newArray[index] = value;
    setEditForm({ ...editForm, [field]: newArray });
  };

  const addArrayItem = (field: 'specs' | 'features') => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: [...editForm[field], 'New Item'] });
  };

  const removeArrayItem = (field: 'specs' | 'features', index: number) => {
    if (!editForm) return;
    const newArray = editForm[field].filter((_, i) => i !== index);
    setEditForm({ ...editForm, [field]: newArray });
  };

  const executeImport = () => {
    try {
      setImportError(null);
      const parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) {
        throw new Error('导入的数据必须是数组格式 (Array)');
      }
      if (parsed.length > 0 && (!parsed[0].name || !parsed[0].id)) {
        throw new Error('数据格式不正确，缺少必要字段 (id, name)');
      }
      onImportProducts(parsed);
      setShowImport(false);
      setImportText('');
    } catch (e: any) {
      setImportError(e.message || 'JSON 解析失败');
    }
  };

  // --- Case Study Handlers ---
  const handleEditCase = (caseStudy: CaseStudy) => {
    setEditingCaseId(caseStudy.id);
    setEditCaseForm({ ...caseStudy });
  };

  const handleSaveCase = () => {
    if (editCaseForm) {
      onUpdateCase(editCaseForm);
      setEditingCaseId(null);
      setEditCaseForm(null);
    }
  };

  const handleCancelCase = () => {
    setEditingCaseId(null);
    setEditCaseForm(null);
  };

  const handleAddNewCase = () => {
    const newCase: CaseStudy = {
      id: Date.now().toString(),
      title: '新的成功案例',
      description: '案例描述...',
      imageUrl: 'https://picsum.photos/600/300',
      linkUrl: ''
    };
    onAddCase(newCase);
    handleEditCase(newCase);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="bg-white shadow border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">数据管理后台</h1>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'products' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Package className="h-4 w-4 mr-2" />
                产品管理
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'cases' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                案例管理
              </button>
            </div>

            <div className="flex space-x-3">
              {activeTab === 'products' ? (
                <>
                  <button 
                    onClick={() => setShowImport(!showImport)}
                    className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none"
                  >
                    <FileJson className="h-4 w-4 mr-2" />
                    批量导入
                  </button>
                  <button 
                    onClick={handleAddNew}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加产品
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleAddNewCase}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  添加案例
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'products' && (
        <>
          {showImport && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-blue-200">
                  <h3 className="text-lg font-medium text-slate-900 mb-2">批量导入产品数据 (JSON)</h3>
                  <textarea 
                    className="w-full h-48 border border-slate-300 rounded-md p-3 font-mono text-xs"
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                  />
                  {importError && (
                    <div className="mt-2 text-red-600 text-sm flex items-center">
                      <X className="h-4 w-4 mr-1" /> {importError}
                    </div>
                  )}
                  <div className="mt-4 flex justify-end space-x-3">
                    <button onClick={() => setShowImport(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium">取消</button>
                    <button onClick={executeImport} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" /> 确认导入
                    </button>
                  </div>
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 gap-6">
              {products.map((product) => (
                <div key={product.id} className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${editingId === product.id ? 'ring-2 ring-blue-500' : ''}`}>
                  {editingId === product.id && editForm ? (
                    // Product Edit Mode
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700">产品型号</label>
                              <input type="text" value={editForm.model} onChange={(e) => setEditForm({ ...editForm, model: e.target.value })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 text-sm font-mono" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700">价格</label>
                              <input type="text" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 text-sm" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700">产品名称</label>
                            <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700">一级分类</label>
                              <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2">
                                <option value="Hardware">智能硬件</option>
                                <option value="Software">软件平台</option>
                                <option value="Service">专业服务</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700">二级分类</label>
                              <input type="text" value={editForm.subCategory} onChange={(e) => setEditForm({ ...editForm, subCategory: e.target.value })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700">产品描述</label>
                            <textarea rows={4} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2" />
                          </div>
                          <div>
                             <label className="block text-sm font-medium text-slate-700">彩页链接 (URL)</label>
                             <div className="flex items-center mt-1">
                                <LinkIcon className="h-4 w-4 text-slate-400 mr-2" />
                                <input type="text" value={editForm.brochureUrl || ''} onChange={(e) => setEditForm({ ...editForm, brochureUrl: e.target.value })} placeholder="https://..." className="block w-full rounded-md border-slate-300 shadow-sm border p-2 text-sm" />
                             </div>
                          </div>
                        </div>
                        
                        <div className="space-y-5">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">图片 URL</label>
                            <div className="flex gap-2">
                              <input type="text" value={editForm.imageUrl} onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} className="flex-1 rounded-md border-slate-300 shadow-sm border p-2" />
                              <button onClick={onSwitchToGenerator} title="Go to AI Generator" className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"><Upload className="h-4 w-4" /></button>
                            </div>
                            {editForm.imageUrl && <img src={editForm.imageUrl} alt="Preview" className="mt-2 h-32 w-full object-cover rounded-md bg-slate-100 border" />}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">核心卖点</label>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                              {editForm.features.map((feature, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <input type="text" value={feature} onChange={(e) => handleArrayChange('features', idx, e.target.value)} className="flex-1 rounded-md border-blue-200 shadow-sm border p-1 text-sm bg-blue-50" />
                                  <button onClick={() => removeArrayItem('features', idx)} className="text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                                </div>
                              ))}
                              <button onClick={() => addArrayItem('features')} className="text-xs text-blue-600 hover:text-blue-800 flex items-center font-medium"><Plus className="h-3 w-3 mr-1" /> 添加卖点</button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">技术规格</label>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                              {editForm.specs.map((spec, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <input type="text" value={spec} onChange={(e) => handleArrayChange('specs', idx, e.target.value)} className="flex-1 rounded-md border-slate-300 shadow-sm border p-1 text-sm" />
                                  <button onClick={() => removeArrayItem('specs', idx)} className="text-slate-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                                </div>
                              ))}
                              <button onClick={() => addArrayItem('specs')} className="text-xs text-blue-600 hover:text-blue-800 flex items-center font-medium"><Plus className="h-3 w-3 mr-1" /> 添加规格</button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end space-x-3">
                        <button onClick={handleCancel} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">取消</button>
                        <button onClick={handleSave} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 flex items-center"><Save className="h-4 w-4 mr-2" />保存修改</button>
                      </div>
                    </div>
                  ) : (
                    // Product View Mode
                    <div className="flex flex-col sm:flex-row">
                      <div className="h-48 sm:h-auto sm:w-56 bg-slate-200 relative">
                         <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                         <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate font-mono">{product.model}</div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                 <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">{product.subCategory}</span>
                                 <span className="text-xs text-slate-500">{product.category}</span>
                              </div>
                            </div>
                            <span className="text-lg font-semibold text-blue-600">{product.price}</span>
                          </div>
                          <p className="mt-2 text-slate-600 text-sm line-clamp-2">{product.description}</p>
                          {product.brochureUrl && (
                             <p className="mt-1 text-xs text-blue-500 flex items-center"><LinkIcon className="h-3 w-3 mr-1"/> {product.brochureUrl}</p>
                          )}
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                          <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="h-5 w-5" /></button>
                          <button onClick={() => onDeleteProduct(product.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="h-5 w-5" /></button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'cases' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <div className="grid grid-cols-1 gap-6">
             {caseStudies.map((item) => (
                <div key={item.id} className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${editingCaseId === item.id ? 'ring-2 ring-blue-500' : ''}`}>
                   {editingCaseId === item.id && editCaseForm ? (
                     // Case Edit Mode
                     <div className="p-6">
                        <div className="space-y-4">
                           <div>
                              <label className="block text-sm font-medium text-slate-700">案例标题</label>
                              <input type="text" value={editCaseForm.title} onChange={(e) => setEditCaseForm({...editCaseForm, title: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2" />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-700">案例描述</label>
                              <textarea rows={3} value={editCaseForm.description} onChange={(e) => setEditCaseForm({...editCaseForm, description: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2" />
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                 <label className="block text-sm font-medium text-slate-700">图片 URL</label>
                                 <div className="flex gap-2">
                                   <input type="text" value={editCaseForm.imageUrl} onChange={(e) => setEditCaseForm({...editCaseForm, imageUrl: e.target.value})} className="flex-1 rounded-md border-slate-300 shadow-sm border p-2" />
                                   <button onClick={onSwitchToGenerator} className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"><Upload className="h-4 w-4" /></button>
                                 </div>
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-slate-700">详情跳转链接 (URL)</label>
                                 <input type="text" value={editCaseForm.linkUrl || ''} onChange={(e) => setEditCaseForm({...editCaseForm, linkUrl: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2" />
                              </div>
                           </div>
                           {editCaseForm.imageUrl && <img src={editCaseForm.imageUrl} alt="Preview" className="h-32 object-cover rounded-md bg-slate-100" />}
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                           <button onClick={handleCancelCase} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">取消</button>
                           <button onClick={handleSaveCase} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 flex items-center"><Save className="h-4 w-4 mr-2" />保存修改</button>
                        </div>
                     </div>
                   ) : (
                     // Case View Mode
                     <div className="flex flex-col sm:flex-row">
                        <div className="h-40 sm:w-48 bg-slate-200 relative">
                           <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                           <div>
                              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                              <p className="mt-1 text-slate-600 text-sm line-clamp-2">{item.description}</p>
                              {item.linkUrl && (
                                <p className="mt-2 text-xs text-blue-500 flex items-center"><LinkIcon className="h-3 w-3 mr-1"/> {item.linkUrl}</p>
                              )}
                           </div>
                           <div className="mt-3 flex justify-end space-x-2">
                              <button onClick={() => handleEditCase(item)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 className="h-5 w-5" /></button>
                              <button onClick={() => onDeleteCase(item.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><Trash2 className="h-5 w-5" /></button>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};
