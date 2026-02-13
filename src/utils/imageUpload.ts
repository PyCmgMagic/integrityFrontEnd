/**
 * 图片上传工具函数
 * 封装图床API调用，提供统一的图片上传接口
 */

import request from './request';

/**
 * OSS 预签名上传接口的 data 结构
 */
interface PresignedUploadData {
  upload_url: string;
  backup_upload_url: string;
  file_key: string;
  file_url: string;
  backup_file_url: string;
  expires_at: string;
  method: string;
  headers: Record<string, string>;
}

/**
 * 上传图片到 OSS（预签名方式，项目统一使用）
 * 流程：1) POST /punch/presigned-upload-url 获取预签名信息  2) 使用 PUT 将文件上传到 OSS
 * @param file 要上传的图片文件
 * @param onProgress 上传进度回调函数
 * @returns Promise<string> 返回图片可访问的 URL (file_url)
 */
export const uploadImageToCloud = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    throw new Error('只能上传图片文件');
  }
  const maxSize = 10 * 1024 * 1024; // 10MB，与各组件校验一致
  if (file.size > maxSize) {
    throw new Error('图片大小不能超过10MB');
  }

  // 1. 请求预签名 URL（由调用方统一展示错误，此处不自动 message）
  const presigned = await request.post<PresignedUploadData>(
    '/punch/presigned-upload-url',
    { filename: file.name, content_type: file.type || 'image/png' },
    { showError: false }
  );

  const { upload_url, backup_upload_url, method, headers: presignedHeaders, file_url, backup_file_url } = presigned;
  const uploadMethod = (method || 'PUT').toUpperCase();

  /**
   * 通过 XHR 将文件上传到指定 URL
   * @param targetUrl 上传目标地址
   * @param resultUrl 上传成功后返回的文件访问地址
   */
  const doUpload = (targetUrl: string, resultUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(resultUrl);
        } else {
          reject(new Error(`上传失败，状态码: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => reject(new Error('网络错误，上传失败')));
      xhr.addEventListener('timeout', () => reject(new Error('上传超时，请重试')));
      xhr.timeout = 60000;

      xhr.open(uploadMethod, targetUrl);

      if (presignedHeaders && typeof presignedHeaders === 'object') {
        for (const [key, value] of Object.entries(presignedHeaders)) {
          if (key.toLowerCase() !== 'host' && value) {
            xhr.setRequestHeader(key, value);
          }
        }
      }
      if (!presignedHeaders?.['Content-Type']) {
        xhr.setRequestHeader('Content-Type', file.type || 'image/png');
      }

      xhr.send(file);
    });
  };

  // 2. 先尝试主地址上传，失败后自动回退到备用地址
  try {
    return await doUpload(upload_url, file_url);
  } catch (primaryError) {
    console.warn('主地址上传失败，尝试备用地址:', primaryError);
    if (backup_upload_url) {
      return await doUpload(backup_upload_url, backup_file_url || file_url);
    }
    throw primaryError;
  }
};

/**
 * 批量上传图片
 * @param files 要上传的图片文件数组
 * @param onProgress 整体进度回调函数
 * @param onSingleProgress 单个文件进度回调函数
 * @returns Promise<string[]> 返回图片URL数组
 */
export const uploadMultipleImages = async (
  files: File[],
  onProgress?: (percent: number) => void,
  onSingleProgress?: (index: number, percent: number) => void
): Promise<string[]> => {
  const results: string[] = [];
  const total = files.length;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      const imageUrl = await uploadImageToCloud(file, (percent) => {
        onSingleProgress?.(i, percent);
      });
      
      results.push(imageUrl);
      
      // 更新整体进度
      if (onProgress) {
        const overallProgress = Math.round(((i + 1) / total) * 100);
        onProgress(overallProgress);
      }
    } catch (error) {
      console.error(`上传第${i + 1}张图片失败:`, error);
      throw error;
    }
  }
  
  return results;
};

/**
 * 将Base64数据URL转换为File对象
 * @param dataUrl Base64数据URL
 * @param filename 文件名
 * @returns File对象
 */
export const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

/**
 * 压缩图片
 * @param file 原始图片文件
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @param quality 压缩质量 (0-1)
 * @returns Promise<File> 压缩后的图片文件
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // 计算压缩后的尺寸
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // 设置canvas尺寸
      canvas.width = width;
      canvas.height = height;
      
      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height);
      
      // 转换为Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('图片压缩失败'));
          }
        },
        file.type,
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};