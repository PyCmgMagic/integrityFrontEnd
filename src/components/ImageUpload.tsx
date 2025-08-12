import { useState } from 'react';
import { Upload, message, Modal, Image, Progress } from 'antd';
import { PlusOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { uploadImageToCloud, compressImage } from '../utils/imageUpload';

interface ImageUploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
  disabled?: boolean;
  className?: string;
}

const ImageUpload = ({ 
  value = [], 
  onChange, 
  maxCount = 9, 
  disabled = false,
  className = '' 
}: ImageUploadProps) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileList, setFileList] = useState<UploadFile[]>(
    value.map((url, index) => ({
      uid: `-${index}`,
      name: `image-${index}`,
      status: 'done',
      url: url,
    }))
  );

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || file.response?.url || '');
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    const updatedFileList = newFileList.map(file => {
      if (file.response && !file.url) {
        file.url = file.response.url;
      }
      return file;
    });
    
    setFileList(updatedFileList);
    
    // 提取所有成功上传的图片URL
    const urls = updatedFileList
      .filter(file => file.status === 'done' && file.url)
      .map(file => file.url!);
    
    onChange?.(urls);
  };

  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
    
    const urls = newFileList
      .filter(item => item.status === 'done' && item.url)
      .map(item => item.url!);
    
    onChange?.(urls);
  };

  /**
   * 自定义上传请求，使用图床API
   */
  const customRequest = async ({ 
    file, 
    onSuccess, 
    onError 
  }: {
    file: RcFile;
    onSuccess?: (response: any) => void;
    onError?: (error: any) => void;
  }) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // 压缩图片（如果文件大于1MB）
      let fileToUpload: File = file;
      if (file.size > 1024 * 1024) {
        message.info('正在压缩图片...');
        fileToUpload = await compressImage(file, 1920, 1080, 0.8);
      }

      // 上传到图床
      const imageUrl = await uploadImageToCloud(fileToUpload, (percent) => {
        setUploadProgress(percent);
      });

      // 调用成功回调
      onSuccess?.({
        url: imageUrl,
        name: file.name,
      });
      
      message.success('图片上传成功！');
    } catch (error) {
      console.error('图片上传失败:', error);
      onError?.(error);
      message.error(error instanceof Error ? error.message : '图片上传失败！');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('图片大小不能超过 10MB！');
      return false;
    }

    return true;
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors">
      {uploading ? (
        <LoadingOutlined className="text-2xl text-blue-500 mb-2" />
      ) : (
        <PlusOutlined className="text-2xl text-gray-400 mb-2" />
      )}
      <div className="text-gray-600 text-sm">
        {uploading ? '上传中...' : '点击上传'}
      </div>
      {uploading && uploadProgress > 0 && (
        <Progress
          percent={uploadProgress}
          size="small"
          style={{ marginTop: 8, width: '80%' }}
          showInfo={false}
        />
      )}
    </div>
  );

  return (
    <div className={className}>
      <Upload
        // customRequest={customRequest}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={handleRemove}
        beforeUpload={beforeUpload}
        disabled={disabled || uploading}
        className="image-upload-grid"
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>
      
      <Modal
        open={previewOpen}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
        centered
      >
        <Image
          alt="preview"
          style={{ width: '100%' }}
          src={previewImage}
          preview={false}
        />
      </Modal>
      

    </div>
  );
};

export default ImageUpload;