import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { message } from 'antd';
import { uploadImageToCloud } from '../../utils/imageUpload';

interface CoverUploadProps {
  /** 当前封面图片 URL */
  value?: string;
  /** 封面变化回调函数 */
  onChange?: (imageUrl: string) => void;
  /** 是否禁用上传 */
  disabled?: boolean;
  /** 自定义样式类名 */
  className?: string;
  /** 上传区域高度，默认为 h-32 */
  height?: string;
  /** 占位文本 */
  placeholder?: string;
}

/**
 * 封面上传组件
 * 支持图片上传到图床，显示上传进度和预览
 */
export const CoverUpload: React.FC<CoverUploadProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  height = 'h-32',
  placeholder = '添加封面'
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 处理封面上传按钮点击
   */
  const handleUploadClick = () => {
    if (!uploading && !disabled) {
      fileInputRef.current?.click();
    }
  };

  /**
   * 处理文件选择和上传
   * @param event - 文件输入事件
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const imageUrl = await uploadImageToCloud(file);
        onChange?.(imageUrl);
        message.success('封面上传成功');
      } catch (error) {
        console.error('封面上传失败:', error);
        message.error('封面上传失败，请重试');
      } finally {
        setUploading(false);
        // 清空文件输入，允许重新选择同一文件
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading || disabled}
      />
      
      {value ? (
        // 显示已上传的封面图片
        <div className={`w-full ${height} relative group cursor-pointer`} onClick={handleUploadClick}>
          <img 
            src={value} 
            alt="封面预览" 
            className={`w-full h-full object-cover rounded-lg ${disabled ? 'opacity-50' : ''}`} 
          />
          {!disabled && (
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <div className="text-white text-sm font-medium">
                {uploading ? '上传中...' : '点击更换封面'}
              </div>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="text-white text-sm font-medium flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                上传中...
              </div>
            </div>
          )}
        </div>
      ) : (
        // 显示上传按钮
        <button
          onClick={handleUploadClick}
          disabled={uploading || disabled}
          className={`w-full ${height} bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {uploading ? (
            <>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
              <span className="text-sm text-blue-500">上传中...</span>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Plus size={24} className="text-blue-500" />
              </div>
              <span className="text-sm">{placeholder}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default CoverUpload;