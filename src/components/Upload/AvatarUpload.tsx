import React from 'react';
import { Upload, Avatar } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload';
import { useImageUpload } from '../../hooks/useImageUpload';

/**
 * 头像上传组件属性接口
 */
interface AvatarUploadProps {
  /** 当前头像URL */
  value?: string;
  /** 头像变化回调 */
  onChange?: (url: string) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 头像大小 */
  size?: number;
  /** 最大文件大小（MB） */
  maxSize?: number;
  /** 自定义样式类名 */
  className?: string;
  /** 自定义样式 */
  style?: React.CSSProperties;
}

/**
 * 圆形头像上传组件
 * 专门用于头像上传场景，保持圆形样式
 */
const AvatarUpload: React.FC<AvatarUploadProps> = ({
  value,
  onChange,
  disabled = false,
  size = 100,
  maxSize = 5,
  className,
  style,
}) => {
  // 使用图片上传Hook
  const { uploading, uploadImage } = useImageUpload({
    maxSize,
    onSuccess: (url) => {
      onChange?.(url);
    },
  });

  /**
   * 处理头像上传
   * @param file 上传的文件
   * @returns false 阻止默认上传行为
   */
  const handleUpload = async (file: RcFile): Promise<boolean> => {
    await uploadImage(file);
    return false; // 阻止默认上传行为
  };

  return (
    <Upload
      name="avatar"
      listType="picture-circle"
      className={className}
      style={style}
      showUploadList={false}
      beforeUpload={handleUpload}
      disabled={disabled || uploading}
    >
      {value ? (
        <Avatar src={value} size={size} />
      ) : (
        <div>
          <UploadOutlined 
            style={{ 
              fontSize: 24, 
              color: uploading ? '#1890ff' : '#999' 
            }} 
          />
          <div style={{ marginTop: 8, color: '#666' }}>
            {uploading ? '上传中...' : '上传'}
          </div>
        </div>
      )}
    </Upload>
  );
};

export default AvatarUpload;