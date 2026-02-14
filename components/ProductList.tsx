import React from 'react';
import { Product } from '../types';
import { Check, Info, Cpu, Layers, ExternalLink } from 'lucide-react';

interface ProductListProps {
  products: Product[];
}

export const ProductList: React.FC<ProductListProps> = ({ products }) => {
  const categories = Array.from(new Set(products.map(p => p.category)));

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
            核心产品与服务
          </h2>
          <p className="mt-4 text-xl text-slate-500">
            全方位的数智化安防解决方案，满足您的各类场景需求
          </p>
        </div>

        {categories.map(category => (
          <div key={category} className="mb-16">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 border-l-4 border-blue-500 pl-4 flex items-center">
              {category === 'Hardware' ? '智能硬件' : category === 'Software' ? '软件平台' : '专业服务'}
              <span className="ml-2 text-sm font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                {products.filter(p => p.category === category).length} 款产品
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.filter(p => p.category === category).map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-56 w-full bg-slate-200 relative overflow-hidden group">
                     <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-mono px-2 py-1 rounded">
                      {product.model}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded shadow-lg">
                      {product.subCategory}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-slate-900 leading-tight">{product.name}</h4>
                    </div>
                    <div className="mb-4">
                       <span className="text-lg font-bold text-blue-600">{product.price}</span>
                    </div>
                    
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                      {product.description}
                    </p>

                    <div className="space-y-4 mb-6 flex-1">
                      <div>
                        <h5 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center">
                          <Layers className="h-3 w-3 mr-1" /> 核心亮点
                        </h5>
                        <ul className="space-y-1">
                          {product.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center text-sm text-slate-700 font-medium">
                              <Check className="h-3.5 w-3.5 text-blue-500 mr-2 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {product.specs.length > 0 && (
                        <div className="pt-4 border-t border-slate-100">
                          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
                            <Cpu className="h-3 w-3 mr-1" /> 技术规格
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {product.specs.map((spec, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                {spec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {product.brochureUrl ? (
                      <a 
                        href={product.brochureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center font-medium"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        查看完整彩页
                      </a>
                    ) : (
                      <button disabled className="w-full bg-slate-100 text-slate-400 py-2.5 px-4 rounded-lg flex items-center justify-center font-medium cursor-not-allowed">
                        <Info className="h-4 w-4 mr-2" />
                        暂无彩页链接
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
