import React, { useState } from 'react';
import { Lock, ArrowRight, AlertCircle, Eye, EyeOff, Server } from 'lucide-react';
import { PUBLIC_READ_CONFIG } from '../constants';

interface AdminLoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded password as requested
    if (password === 'xunmei2026') {
      onLogin();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-6 text-center flex-shrink-0">
          <div className="mx-auto bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Lock className="text-white h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white">管理员身份验证</h2>
          <p className="text-slate-400 text-sm mt-1">请输入密码以访问后台配置</p>
        </div>
        
        <div className="p-8 flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">访问密码</label>
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="••••••••••"
              />
              {error && (
                <div className="flex items-center text-red-600 text-sm mt-2 animate-pulse">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  密码错误，请重试
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-600 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                返回
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
              >
                验证
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-4 border-t border-slate-100">
            <button 
                onClick={() => setShowDebug(!showDebug)} 
                className="flex items-center justify-center w-full text-xs text-slate-400 hover:text-blue-500 transition-colors"
            >
                <Server className="h-3 w-3 mr-1" />
                {showDebug ? '隐藏系统诊断' : '显示系统诊断 (部署检查)'}
            </button>
            
            {showDebug && (
                <div className="mt-3 bg-slate-50 rounded p-3 text-xs font-mono break-all border border-slate-200">
                    <div className="mb-2">
                        <strong className="text-slate-700 block">当前已部署的 Endpoint:</strong>
                        <span className={PUBLIC_READ_CONFIG.endpointUrl ? "text-green-600" : "text-red-500"}>
                            {PUBLIC_READ_CONFIG.endpointUrl || "(未配置)"}
                        </span>
                    </div>
                    <div>
                        <strong className="text-slate-700 block">当前已部署的 API Key:</strong>
                        <span className="text-slate-500">
                            {PUBLIC_READ_CONFIG.apiKey ? `...${PUBLIC_READ_CONFIG.apiKey.slice(-6)}` : "(未配置)"}
                        </span>
                    </div>
                    <p className="mt-2 text-[10px] text-slate-400 leading-tight">
                        * 如果此处显示的地址不是您最新修改的地址，说明您的代码尚未重新 Build/Deploy 到服务器。
                    </p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
