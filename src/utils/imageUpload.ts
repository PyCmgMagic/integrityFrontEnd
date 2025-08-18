/**
 * 图片上传工具函数
 * 封装图床API调用，提供统一的图片上传接口
 */

/**
 * 图床API响应类型
 */
interface ImageUploadResponse {
  code: number;
  data: string;
  msg: string;
}

/**
 * 上传图片到图床
 * @param file 要上传的图片文件
 * @param onProgress 上传进度回调函数
 * @returns Promise<string> 返回图片URL
 */
export const uploadImageToCloud = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 验证文件类型
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      reject(new Error('只能上传图片文件'));
      return;
    }

    // 验证文件大小 (限制为5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      reject(new Error('图片大小不能超过5MB'));
      return;
    }

    // 创建FormData
    const formData = new FormData();
    formData.append('image', file);

    // 创建XMLHttpRequest以支持进度监听
    const xhr = new XMLHttpRequest();

    // 监听上传进度
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });
    }

    // 监听请求完成
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response: ImageUploadResponse = JSON.parse(xhr.responseText);
          
          if (response.code === 200 && response.data) {
            // 清理响应数据中的多余空格和引号
            const imageUrl = response.data.trim().replace(/^["']|["']$/g, '');
            resolve(imageUrl);
          } else {
            reject(new Error(response.msg || '上传失败'));
          }
        } catch (error) {
          reject(new Error('解析响应数据失败'));
        }
      } else {
        reject(new Error(`上传失败，状态码: ${xhr.status}`));
      }
    });

    // 监听请求错误
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误，上传失败'));
    });

    // 监听请求超时
    xhr.addEventListener('timeout', () => {
      reject(new Error('上传超时，请重试'));
    });

    // 设置超时时间 (30秒)
    xhr.timeout = 30000;

    // 发送请求
    const uploadUrl = import.meta.env.VITE_IMAGE_UPLOAD_URL;
    xhr.open('POST', uploadUrl);
    xhr.send(formData);
  });
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