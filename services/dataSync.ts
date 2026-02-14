import { CloudSettings, AppData } from '../types';

// Helper to generate headers dynamically based on key type needed
const getHeaders = (apiKey: string, keyHeaderName: 'X-Master-Key' | 'X-Access-Key') => ({
  'Content-Type': 'application/json',
  [keyHeaderName]: apiKey,
  'X-Bin-Versioning': 'false' // Disable versioning to keep it simple
});

export const fetchCloudData = async (settings: CloudSettings): Promise<AppData | null> => {
  if (!settings.enabled || !settings.endpointUrl) return null;

  try {
    // ---------------------------------------------------------------------------
    // STRATEGY: "Try Both"
    // We don't know if the user provided a Master Key (Admin) or an Access Key (Public Read).
    // JSONBin is strict: sending an Access Key in 'X-Master-Key' header fails, and vice versa.
    // ---------------------------------------------------------------------------

    let response;
    let usedHeader = '';

    // Attempt 1: Try as Access Key (Most likely for Public Read / constants.ts)
    if (settings.apiKey) {
        response = await fetch(settings.endpointUrl, {
            method: 'GET',
            headers: getHeaders(settings.apiKey, 'X-Access-Key'),
        });

        // Attempt 2: If failed with auth error, Try as Master Key (Likely for Admin Dashboard)
        if (!response.ok && (response.status === 401 || response.status === 403)) {
            console.log("Access Key header failed, retrying with Master Key header...");
            response = await fetch(settings.endpointUrl, {
                method: 'GET',
                headers: getHeaders(settings.apiKey, 'X-Master-Key'),
            });
            usedHeader = 'X-Master-Key';
        } else {
            usedHeader = 'X-Access-Key';
        }
    } else {
        // No key provided (Open bin?)
        response = await fetch(settings.endpointUrl, { method: 'GET' });
    }

    if (!response.ok) {
      console.warn(`Cloud fetch failed (${usedHeader}):`, response.status, response.statusText);
      return null;
    }

    const json = await response.json();
    
    // JSONBin returns data in a 'record' wrapper usually, adapt as needed
    // We assume the root object is AppData or wrapped in 'record'
    const data = json.record || json;
    
    if (data && Array.isArray(data.products)) {
        return data as AppData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching cloud data:', error);
    return null;
  }
};

export const publishToCloud = async (settings: CloudSettings, data: AppData): Promise<boolean> => {
  if (!settings.enabled || !settings.endpointUrl) throw new Error("Cloud settings incomplete");

  try {
    const body = JSON.stringify(data);
    
    // For Publishing (Writing), we default to X-Master-Key
    const response = await fetch(settings.endpointUrl, {
      method: 'PUT', // standard for updating resource
      headers: getHeaders(settings.apiKey, 'X-Master-Key'),
      body: body,
    });

    if (!response.ok) {
        let errorMsg = `Upload failed: ${response.status} ${response.statusText}`;
        
        // Handle Payload Too Large specifically
        if (response.status === 413) {
            const sizeInKB = (body.length / 1024).toFixed(2);
            errorMsg = `上传失败：数据体积太大 (${sizeInKB} KB)，超过了服务器限制。请尝试删除一些图片或使用更小的图片。`;
        }

        // Optional: Retry with X-Access-Key if Master fails (rare for writing)
        if (response.status === 401 || response.status === 403) {
             const retryResponse = await fetch(settings.endpointUrl, {
                method: 'PUT',
                headers: getHeaders(settings.apiKey, 'X-Access-Key'),
                body: body,
             });
             if (retryResponse.ok) return true;
        }
        
        // Try to read error body
        try {
            const errJson = await response.json();
            if (errJson.message) errorMsg += ` (${errJson.message})`;
        } catch (e) {}

        throw new Error(errorMsg);
    }
    return true;
  } catch (error) {
    console.error('Error publishing to cloud:', error);
    throw error;
  }
};
