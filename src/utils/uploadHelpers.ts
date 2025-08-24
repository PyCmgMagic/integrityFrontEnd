import { message } from 'antd';
import { uploadImageToCloud, compressImage } from './imageUpload';

/**
 * 上传配置选项
 */
export interface UploadOptions {
  /** 最大文件大小（MB） */
  maxSize?: number;
  /** 是否自动压缩 */
  autoCompress?: boolean;
  /** 压缩阈值（MB），超过此大小才压缩 */
  compressThreshold?: number;
  /** 压缩质量 (0-1) */
  compressQuality?: number;
  /** 压缩后的最大宽度 */
  maxWidth?: number;
  /** 压缩后的最大高度 */
  maxHeight?: number;
  /** 成功回调 */
  onSuccess?: (url: string) => void;
  /** 失败回调 */
  onError?: (error: Error) => void;
  /** 进度回调 */
  onProgress?: (percent: number) => void;
}

/**
 * 通用图片上传函数
 * @param file 要上传的文件
 * @param options 上传配置选项
 * @returns Promise<string> 返回上传后的图片URL
 */
export const uploadImageFile = async (
  file: File,
  options: UploadOptions = {}
): Promise<string> => {
  const {
    maxSize = 5,
    autoCompress = true,
    compressThreshold = 1,
    compressQuality = 0.8,
    maxWidth = 1920,
    maxHeight = 1080,
    onSuccess,
    onError,
    onProgress,
  } = options;

  try {
    // 验证文件类型
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      const error = new Error('只能上传图片文件！');
      message.error(error.message);
      onError?.(error);
      throw error;
    }

    // 验证文件大小
    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      const error = new Error(`图片大小不能超过 ${maxSize}MB！`);
      message.error(error.message);
      onError?.(error);
      throw error;
    }

    onProgress?.(10);

    // 压缩图片（如果需要）
    let fileToUpload: File = file;
    if (autoCompress && file.size > compressThreshold * 1024 * 1024) {
      message.info('正在压缩图片...');
      onProgress?.(30);
      fileToUpload = await compressImage(file, maxWidth, maxHeight, compressQuality);
      onProgress?.(50);
    }

    // 上传到图床
    onProgress?.(70);
    const imageUrl = await uploadImageToCloud(fileToUpload);
    onProgress?.(100);
    
    message.success('图片上传成功！');
    onSuccess?.(imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('图片上传失败:', error);
    const errorMessage = error instanceof Error ? error.message : '图片上传失败，请重试';
    message.error(errorMessage);
    const uploadError = new Error(errorMessage);
    onError?.(uploadError);
    throw uploadError;
  }
};

/**
 * 批量上传图片
 * @param files 要上传的文件数组
 * @param options 上传配置选项
 * @returns Promise<string[]> 返回上传后的图片URL数组
 */
export const uploadMultipleImages = async (
  files: File[],
  options: UploadOptions = {}
): Promise<string[]> => {
  const urls: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const url = await uploadImageFile(file, {
        ...options,
        onProgress: (percent) => {
          const totalProgress = ((i * 100) + percent) / files.length;
          options.onProgress?.(totalProgress);
        },
      });
      urls.push(url);
    } catch (error) {
      console.error(`文件 ${file.name} 上传失败:`, error);
      // 继续上传其他文件，不中断整个流程
    }
  }
  
  return urls;
};

/**
 * 验证图片文件
 * @param file 要验证的文件
 * @param maxSize 最大文件大小（MB）
 * @returns boolean 是否通过验证
 */
export const validateImageFile = (file: File, maxSize: number = 5): boolean => {
  // 验证文件类型
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件！');
    return false;
  }

  // 验证文件大小
  const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
  if (!isLtMaxSize) {
    message.error(`图片大小不能超过 ${maxSize}MB！`);
    return false;
  }

  return true;
};