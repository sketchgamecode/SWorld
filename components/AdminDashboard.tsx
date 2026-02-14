import React, { useState, useEffect, useRef } from 'react';
import { Product, CaseStudy, CloudSettings, AppData } from '../types';
import { publishToCloud } from '../services/dataSync';
import { PUBLIC_READ_CONFIG } from '../constants';
import { Save, Plus, Trash2, Edit2, Upload, X, FileJson, CheckCircle, Package, Briefcase, Link as LinkIcon, Download, Cloud, Settings, Loader2, AlertTriangle, ArrowRightLeft, Image as ImageIcon, BarChart3 } from 'lucide-react';

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
  onImportCases?: (cases: CaseStudy[]) => void;

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
  onImportCases,
  onSwitchToGenerator
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'cases'>('products');
  const [showCloudConfig, setShowCloudConfig] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [payloadSize, setPayloadSize] = useState<string>("0");
  const [isSizeWarning, setIsSizeWarning] = useState(false);
  
  // Hidden file inputs refs
  const productFileRef = useRef<HTMLInputElement>(null);
  const caseFileRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Cloud Config State
  const [cloudSettings, setCloudSettings] = useState<CloudSettings>({
    enabled: false,
    endpointUrl: '',
    apiKey: ''
  });

  useEffect(() => {
    // 1. Try Local Storage
    const saved = localStorage.getItem('cloudSettings');
    if (saved) {
      try {
        setCloudSettings(JSON.parse(saved));
      } catch(e) {}
    } else {
      // 2. Fallback to constant config if available (pre-fill for convenience)
      if (PUBLIC_READ_CONFIG.enabled) {
        setCloudSettings(PUBLIC_READ_CONFIG);
      }
    }
  }, []);

  // Calculate payload size whenever data changes
  useEffect(() => {
    const payload: AppData = {
        products,
        cases: caseStudies,
        lastUpdated: Date.now()
    };
    const jsonString = JSON.stringify(payload);
    const bytes = new Blob([jsonString]).size;
    const kb = bytes / 1024;
    setPayloadSize(kb.toFixed(2));
    
    // Warn if over 500KB (Typical safe limit for free JSON bins, though some allow more)
    setIsSizeWarning(kb > 500);
  }, [products, caseStudies]);

  const saveCloudSettings = () => {
    // Basic validation / cleanup
    const cleanSettings = {
        ...cloudSettings,
        endpointUrl: cloudSettings.endpointUrl.trim(),
        apiKey: cloudSettings.apiKey.trim()
    };
    
    // Auto-fix URL if user pasted browser URL
    if (cleanSettings.endpointUrl.includes('jsonbin.io') && !cleanSettings.endpointUrl.includes('api.jsonbin.io')) {
        // Attempt to fix standard browser url: https://jsonbin.io/v3/b/ID -> https://api.jsonbin.io/v3/b/ID
        cleanSettings.endpointUrl = cleanSettings.endpointUrl.replace('jsonbin.io', 'api.jsonbin.io');
    }

    localStorage.setItem('cloudSettings', JSON.stringify(cleanSettings));
    setCloudSettings(cleanSettings); // Update state
    setShowCloudConfig(false);
    alert('配置已保存到本地！');
  };

  const syncFromPublic = () => {
    if (window.confirm("确定要将代码中的公开配置覆盖到您的本地设置吗？")) {
        setCloudSettings({
            ...cloudSettings,
            enabled: PUBLIC_READ_CONFIG.enabled,
            endpointUrl: PUBLIC_READ_CONFIG.endpointUrl,
            // We usually don't want to overwrite the API key if it's already set to a Master key, 
            // but if the user requested sync, we'll sync the key too, but warn them.
            apiKey: PUBLIC_READ_CONFIG.apiKey
        });
    }
  }

  const handlePublish = async () => {
    if (!cloudSettings.enabled || !cloudSettings.endpointUrl) {
      setShowCloudConfig(true);
      return;
    }

    if (isSizeWarning) {
        if (!window.confirm(`当前数据体积 (${payloadSize} KB) 较大，可能会发布失败。建议压缩图片或减少数量。\n\n仍然要尝试发布吗？`)) {
            return;
        }
    }

    // Critical Check: Does the admin URL match the public code URL?
    if (cloudSettings.endpointUrl !== PUBLIC_READ_CONFIG.endpointUrl) {
        if(!window.confirm(`⚠️ 严重警告 ⚠️\n\n您配置的发布地址与代码中的读取地址不一致！\n\n代码读取: ${PUBLIC_READ_CONFIG.endpointUrl}\n您要发布到: ${cloudSettings.endpointUrl}\n\n如果您继续，普通用户将无法看到这次更新。确定要继续吗？`)) {
            return;
        }
    }
    
    if(!window.confirm('确定要发布当前配置到线上吗？这将会覆盖所有用户的当前视图。')) return;

    setIsPublishing(true);
    try {
      const payload: AppData = {
        products,
        cases: caseStudies,
        lastUpdated: Date.now()
      };
      await publishToCloud(cloudSettings, payload);
      alert('发布成功！线上内容已更新。');
    } catch (e: any) {
      alert(`${e.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  // --- Image Compression & Upload Logic ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'case') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Basic Validation
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('图片太大，请选择 10MB 以下的图片');
        return;
    }

    setIsCompressing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            // 2. Canvas Compression Logic
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // AGGRESSIVE COMPRESSION SETTINGS
            // Previous: 800px / 0.7 quality
            // New: 600px / 0.6 quality (Significantly smaller)
            const MAX_WIDTH = 600;
            let width = img.width;
            let height = img.height;

            if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Export as JPEG with 0.6 quality to save space
            const base64 = canvas.toDataURL('image/jpeg', 0.6);
            
            // 3. Update State
            if (target === 'product' && editForm) {
                setEditForm({ ...editForm, imageUrl: base64 });
            } else if (target === 'case' && editCaseForm) {
                setEditCaseForm({ ...editCaseForm, imageUrl: base64 });
            }
            setIsCompressing(false);
            
            // Reset input so same file can be selected again if needed
            if (e.target) e.target.value = '';
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };


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
      
      if (activeTab === 'products') {
        if (parsed.length > 0 && (!parsed[0].name || !parsed[0].id)) {
          throw new Error('数据格式不正确，缺少必要字段 (id, name)');
        }
        onImportProducts(parsed);
      } else {
        // Case Study import validation
        if (parsed.length > 0 && (!parsed[0].title || !parsed[0].id)) {
          throw new Error('数据格式不正确，缺少必要字段 (id, title)');
        }
        if (onImportCases) onImportCases(parsed);
      }

      setShowImport(false);
      setImportText('');
    } catch (e: any) {
      setImportError(e.message || 'JSON 解析失败');
    }
  };

  const handleExport = () => {
    const data = activeTab === 'products' ? products : caseStudies;
    const fileName = activeTab === 'products' ? 'products_data.json' : 'case_studies_data.json';
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="bg-slate-50 min-h-screen pb-20 relative">
      <div className="bg-white shadow border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col xl:flex-row justify-between items-center space-y-4 xl:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                数据管理后台
                <span className="ml-3 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full font-mono">ADMIN</span>
              </h1>
            </div>
            
            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => { setActiveTab('products'); setShowImport(false); }}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'products' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Package className="h-4 w-4 mr-2" />
                产品管理
              </button>
              <button
                onClick={() => { setActiveTab('cases'); setShowImport(false); }}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'cases' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Briefcase className="h-4 w-4 mr-2" />
                案例管理
              </button>
            </div>

            <div className="flex items-center space-x-2">
               {/* Data Size Indicator */}
               <div className={`hidden md:flex items-center text-xs font-mono px-3 py-2 rounded border ${isSizeWarning ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`} title="当前所有数据(含图片)的总大小">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  {payloadSize} KB
               </div>

               <button 
                onClick={() => setShowCloudConfig(true)}
                className={`inline-flex items-center px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium transition-colors ${cloudSettings.enabled ? 'text-green-700 bg-green-50 border-green-200' : 'text-slate-700 bg-white hover:bg-slate-50'}`}
                title="配置云端同步"
              >
                <Settings className="h-4 w-4 mr-2" />
                {cloudSettings.enabled ? '已连接云端' : '云端配置'}
              </button>

              <button 
                onClick={handlePublish}
                disabled={isPublishing}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                title="将当前配置发布到服务器 (所有用户可见)"
              >
                {isPublishing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Cloud className="h-4 w-4 mr-2" />}
                发布更新
              </button>

              <div className="h-8 w-px bg-slate-300 mx-2 hidden md:block"></div>

              <button 
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none hidden md:inline-flex"
                title="导出备份"
              >
                <Download className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setShowImport(!showImport)}
                className="inline-flex items-center px-3 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none hidden md:inline-flex"
                title="导入备份"
              >
                <FileJson className="h-4 w-4" />
              </button>
              
              {activeTab === 'products' ? (
                <button 
                  onClick={handleAddNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </button>
              ) : (
                <button 
                  onClick={handleAddNewCase}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  添加
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Config Modal */}
      {showCloudConfig && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center">
                <Cloud className="h-6 w-6 mr-2 text-indigo-600" />
                服务器/云端同步配置
              </h3>
              <button onClick={() => setShowCloudConfig(false)} className="text-slate-400 hover:text-slate-600"><X className="h-6 w-6" /></button>
            </div>
            
            {/* Logic Explanation Section */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm text-blue-800">
               <h4 className="font-bold flex items-center mb-2">
                 <Settings className="h-4 w-4 mr-2" />
                 工作原理说明
               </h4>
               <p className="mb-2">此网站为纯静态部署。为了让公众用户看到更新，我们需要将数据存储在 <strong>JSONBin.io</strong> 上。</p>
               <ul className="list-disc ml-4 space-y-1 text-xs">
                 <li><strong>PUBLIC_READ_CONFIG (只读):</strong> 写在代码里，告诉访客浏览器去哪个 Bin 地址下载数据。</li>
                 <li><strong>管理员配置 (读写):</strong> 保存在您浏览器的缓存里，用于向该 Bin 地址写入新数据。</li>
               </ul>
            </div>

            {/* Comparison Section */}
            <div className="mb-6 border rounded-lg overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center">
                    当前代码中的配置 (Public)
                    <button onClick={syncFromPublic} className="text-blue-600 hover:text-blue-800 flex items-center normal-case">
                        <ArrowRightLeft className="h-3 w-3 mr-1" />
                        复制到下方
                    </button>
                </div>
                <div className="p-4 bg-slate-50 text-xs font-mono break-all space-y-2">
                    <div>
                        <span className="text-slate-400">Endpoint:</span> <br/>
                        <span className="text-slate-700">{PUBLIC_READ_CONFIG.endpointUrl}</span>
                    </div>
                    <div>
                        <span className="text-slate-400">API Key (Hidden):</span> <br/>
                        <span className="text-slate-700">********** (Code)</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">您的本地管理员配置 (Admin Local)</h4>
              
              <div className="flex items-center">
                 <input 
                  type="checkbox" 
                  id="enableCloud"
                  checked={cloudSettings.enabled}
                  onChange={(e) => setCloudSettings({...cloudSettings, enabled: e.target.checked})}
                  className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="enableCloud" className="ml-2 block text-sm font-medium text-slate-900">
                  启用云端同步
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">API Endpoint URL (Bin 地址)</label>
                <input 
                  type="text" 
                  value={cloudSettings.endpointUrl}
                  onChange={(e) => setCloudSettings({...cloudSettings, endpointUrl: e.target.value})}
                  placeholder="https://api.jsonbin.io/v3/b/..."
                  className={`mt-1 block w-full rounded-md shadow-sm border p-2 text-sm font-mono ${
                      cloudSettings.endpointUrl && cloudSettings.endpointUrl !== PUBLIC_READ_CONFIG.endpointUrl 
                      ? 'border-amber-500 bg-amber-50 focus:ring-amber-500' 
                      : 'border-slate-300 focus:ring-indigo-500'
                  }`}
                  disabled={!cloudSettings.enabled}
                />
                {cloudSettings.endpointUrl && cloudSettings.endpointUrl !== PUBLIC_READ_CONFIG.endpointUrl && (
                    <p className="mt-1 text-xs text-amber-600 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        注意：此地址与代码中的公开地址不一致，发布后公众可能无法看到。
                    </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">API Key / Master Key (写入权限)</label>
                <input 
                  type="password" 
                  value={cloudSettings.apiKey}
                  onChange={(e) => setCloudSettings({...cloudSettings, apiKey: e.target.value})}
                  placeholder="Secret Key"
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 text-sm font-mono"
                  disabled={!cloudSettings.enabled}
                />
                <p className="mt-1 text-xs text-slate-500">为了安全，这里建议填入 Master Key，而代码里填只读 Key。</p>
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button onClick={() => setShowCloudConfig(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">取消</button>
              <button onClick={saveCloudSettings} className="px-6 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-md">保存本地配置</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Panel */}
      {showImport && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-dashed border-blue-200">
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                批量导入 {activeTab === 'products' ? '产品' : '案例'} 数据 (JSON)
              </h3>
              <p className="text-sm text-slate-500 mb-3">
                请粘贴 JSON 数组数据。注意：这将覆盖当前列表。建议先“导出配置”作为备份。
              </p>
              <textarea 
                className="w-full h-48 border border-slate-300 rounded-md p-3 font-mono text-xs"
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={activeTab === 'products' ? '[{"id": "1", "name": "...", ...}]' : '[{"id": "c1", "title": "...", ...}]'}
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

      {/* Main Content Areas (Products & Cases) */}
      {activeTab === 'products' && (
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
                            <label className="block text-sm font-medium text-slate-700 mb-1">图片 (URL 或 本地上传)</label>
                            
                            {/* Image Input Group */}
                            <div className="flex gap-2 mb-2">
                              <input 
                                type="text" 
                                value={editForm.imageUrl} 
                                onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })} 
                                className="flex-1 rounded-md border-slate-300 shadow-sm border p-2 text-sm font-mono truncate" 
                                placeholder="http://... 或 data:image/..."
                              />
                              
                              {/* Hidden File Input */}
                              <input 
                                type="file" 
                                ref={productFileRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'product')}
                              />
                              
                              <button 
                                onClick={() => productFileRef.current?.click()} 
                                disabled={isCompressing}
                                className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 flex items-center"
                                title="上传本地图片 (自动压缩)"
                              >
                                {isCompressing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                              </button>

                              <button onClick={onSwitchToGenerator} title="Go to AI Generator" className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200">
                                  <Upload className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <p className="text-[10px] text-slate-400 mb-2">* 本地上传会自动大幅压缩(Max 600px)，请勿上传超高清大图。</p>
                            
                            {editForm.imageUrl && <img src={editForm.imageUrl} alt="Preview" className="h-32 w-full object-cover rounded-md bg-slate-100 border" />}
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
                                 <label className="block text-sm font-medium text-slate-700">图片 (URL 或 本地上传)</label>
                                 <div className="flex gap-2">
                                   <input 
                                     type="text" 
                                     value={editCaseForm.imageUrl} 
                                     onChange={(e) => setEditCaseForm({...editCaseForm, imageUrl: e.target.value})} 
                                     className="flex-1 rounded-md border-slate-300 shadow-sm border p-2 truncate text-sm" 
                                     placeholder="http://... 或 data:image/..."
                                   />
                                   
                                   {/* Hidden Case File Input */}
                                   <input 
                                     type="file" 
                                     ref={caseFileRef} 
                                     className="hidden" 
                                     accept="image/*"
                                     onChange={(e) => handleFileUpload(e, 'case')}
                                   />
                                   
                                   <button 
                                     onClick={() => caseFileRef.current?.click()} 
                                     disabled={isCompressing}
                                     className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 flex items-center"
                                     title="上传本地图片"
                                   >
                                     {isCompressing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                                   </button>
                                   
                                   <button onClick={onSwitchToGenerator} className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"><Upload className="h-4 w-4" /></button>
                                 </div>
                              </div>
                              <div>
                                 <label className="block text-sm font-medium text-slate-700">详情跳转链接 (URL)</label>
                                 <input type="text" value={editCaseForm.linkUrl || ''} onChange={(e) => setEditCaseForm({...editCaseForm, linkUrl: e.target.value})} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2" />
                              </div>
                           </div>
                           {editCaseForm.imageUrl && <img src={editCaseForm.imageUrl} alt="Preview" className="h-32 object-cover rounded-md bg-slate-100 mt-2" />}
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
