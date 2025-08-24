import { useState } from 'react';
import { uploadImageFile, type UploadOptions } from '../utils/uploadHelpers';
import type { RcFile } from 'antd/es/upload';

/**
 * 图片上传Hook配置选项
 */
interface UseImageUploadOptions extends Omit<UploadOptions, 'onProgress'> {
  /** 上传进度回调 */
  onProgress?: (percent: number) => void;
}

/**
 * 图片上传Hook返回值接口
 */
interface UseImageUploadReturn {
  /** 是否正在上传 */
  uploading: boolean;
  /** 上传进度 */
  progress: number;
  /** 上传图片方法 */
  uploadImage: (file: RcFile) => Promise<string | null>;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 图片上传Hook
 * 封装图片上传逻辑，提供统一的上传接口
 * 
 * @param config 上传配置
 * @returns 上传状态和方法
 */
export const useImageUpload = (options: UseImageUploadOptions = {}): UseImageUploadReturn => {
  const {
    onProgress,
    ...uploadOptions
  } = options;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * 上传图片方法
   * @param file 要上传的文件
   * @returns Promise<string | null> 返回图片URL或null（失败时）
   */
  const uploadImage = async (file: RcFile): Promise<string | null> => {
    try {
      setUploading(true);
      setProgress(0);

      // 使用统一的上传方法
      const imageUrl = await uploadImageFile(file, {
        ...uploadOptions,
        onProgress: (percent) => {
          setProgress(percent);
          onProgress?.(percent);
        },
      });

      return imageUrl;
    } catch (error) {
      console.error('图片上传失败:', error);
      return null;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  /**
   * 重置上传状态
   */
  const reset = () => {
    setUploading(false);
    setProgress(0);
  };

  return {
    uploading,
    progress,
    uploadImage,
    reset,
  };
};

export default useImageUpload;