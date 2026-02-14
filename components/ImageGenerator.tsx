import React, { useState } from 'react';
import { generateMarketingImage } from '../services/geminiService';
import { ImageSize } from '../types';
import { Wand2, Download, AlertCircle, Key, Loader2 } from 'lucide-react';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<ImageSize>('1K');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setApiKeyError(false);

    try {
      const imageUrl = await generateMarketingImage(prompt, size);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      if (err.message === 'API_KEY_MISSING' || (err.message && err.message.includes("Requested entity was not found"))) {
        setApiKeyError(true);
      } else {
        setError("生成失败，请重试。" + (err.message || ''));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectKey = async () => {
     const aistudio = (window as any).aistudio;
     if (aistudio) {
         try {
             await aistudio.openSelectKey();
             setApiKeyError(false);
             // Automatically retry generation after key selection could be handled here, 
             // but user clicking generate again is safer for race conditions.
         } catch (e) {
             console.error("Failed to select key", e);
         }
     }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Wand2 className="h-6 w-6 mr-2" />
            AI 营销素材生成器
          </h2>
          <p className="text-purple-100 mt-2">
            利用 Gemini 3 Pro 模型生成高质量产品概念图、应用场景图。
          </p>
        </div>

        <div className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                画面描述 (Prompt)
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：一个现代化的智慧城市指挥中心，大屏幕显示实时数据，蓝色科技感色调，超高清..."
                className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                分辨率 (Image Size)
              </label>
              <div className="flex space-x-4">
                {(['1K', '2K', '4K'] as ImageSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      size === s
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {apiKeyError && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800">需要 API 密钥</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    生成高分辨率图像需要使用您的付费 API 密钥。请点击下方按钮选择密钥。
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline ml-1">
                        了解计费详情
                    </a>
                  </p>
                  <button
                    onClick={handleSelectKey}
                    className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-amber-700 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    <Key className="h-4 w-4 mr-1.5" />
                    选择 API Key
                  </button>
                </div>
              </div>
            )}

            {error && !apiKeyError && (
               <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                 {error}
               </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className={`w-full py-3 rounded-lg flex items-center justify-center text-white font-semibold transition-all ${
                loading || !prompt.trim()
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  生成中... (可能需要几十秒)
                </>
              ) : (
                '开始生成'
              )}
            </button>
          </div>

          {generatedImage && (
            <div className="mt-8 border-t border-slate-100 pt-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">生成结果</h3>
              <div className="relative rounded-xl overflow-hidden shadow-lg group">
                <img src={generatedImage} alt="Generated result" className="w-full h-auto" />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <a 
                      href={generatedImage} 
                      download={`gemini-gen-${Date.now()}.png`}
                      className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium flex items-center hover:bg-slate-100"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      下载图片
                    </a>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                 您可以右键保存图片，并在管理后台上传使用。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};