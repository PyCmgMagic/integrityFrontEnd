import React, { useState } from 'react';
import { Upload, message, Progress } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload';
import { uploadImageToCloud, compressImage } from '../utils/imageUpload';

/**
 * 单图片上传组件属性接口
 */
interface SingleImageUploadProps {
  /** 当前图片URL */
  value?: string;
  /** 图片变化回调 */
  onChange?: (url: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 上传按钮文本 */
  uploadText?: string;
  /** 是否显示上传进度 */
  showProgress?: boolean;
  /** 最大文件大小（MB） */
  maxSize?: number;
  /** 是否自动压缩 */
  autoCompress?: boolean;
  /** 压缩配置 */
  compressConfig?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  };
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 图片显示样式 */
  imageStyle?: React.CSSProperties;
}

/**
 * 单图片上传组件
 * 专门用于活动封面、头像等单图片上传场景
 */
const SingleImageUpload: React.FC<SingleImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  uploadText = '上传图片',
  showProgress = true,
  maxSize = 5,
  autoCompress = true,
  compressConfig = {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
  },
  className,
  style,
  imageStyle = { width: '100%', height: '100%', objectFit: 'cover' },
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * 处理图片上传
   * @param file 上传的文件
   * @returns false 阻止默认上传行为
   */
  const handleUpload = async (file: RcFile): Promise<boolean> => {
    try {
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

      setUploading(true);
      setUploadProgress(0);

      // 压缩图片（如果启用且文件大于1MB）
      let fileToUpload:File = file;
      if (autoCompress && file.size > 1024 * 1024) {
        message.info('正在压缩图片...');
        fileToUpload = await compressImage(
          file,
          compressConfig.maxWidth,
          compressConfig.maxHeight,
          compressConfig.quality
        );
      }

      // 上传到图床
      const imageUrl = await uploadImageToCloud(fileToUpload, (percent) => {
        setUploadProgress(percent);
      });

      // 调用onChange回调
      onChange?.(imageUrl);
      message.success('图片上传成功！');
    } catch (error) {
      console.error('图片上传失败:', error);
      message.error(error instanceof Error ? error.message : '图片上传失败，请重试');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }

    return false; // 阻止默认上传行为
  };

  /**
   * 渲染上传按钮内容
   */
  const renderUploadButton = () => {
    if (value) {
      return <img src={value} alt="uploaded" style={imageStyle} />;
    }

    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        {uploading ? <LoadingOutlined style={{ fontSize: 24, color: '#1890ff' }} /> : <PlusOutlined style={{ fontSize: 24, color: '#999' }} />}
        <div style={{ marginTop: 8, color: '#666' }}>
          {uploading ? '上传中...' : uploadText}
        </div>
        {uploading && showProgress && uploadProgress > 0 && (
          <Progress
            percent={uploadProgress}
            size="small"
            style={{ marginTop: 8, width: '80%', margin: '8px auto 0' }}
            showInfo={false}
          />
        )}
      </div>
    );
  };

  return (
    <Upload
      name="image"
      listType="picture-card"
      className={className}
      style={style}
      showUploadList={false}
      beforeUpload={handleUpload}
      disabled={disabled || uploading}
    >
      {renderUploadButton()}
    </Upload>
  );
};

export default SingleImageUpload;