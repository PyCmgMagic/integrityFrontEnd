import { useState } from 'react';
import { Upload, message, Modal, Image, Progress } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { uploadImageToCloud, compressImage } from '../../utils/imageUpload';
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
   * 处理图片上传
   * @param file 上传的文件
   * @returns false 阻止默认上传行为
   */
  const handleUpload = async (file: RcFile): Promise<boolean> => {
    // 验证文件类型
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }

    // 验证文件大小
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('图片大小不能超过 10MB！');
      return false;
    }

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

      // 添加到文件列表
      const newFile: UploadFile = {
        uid: Date.now().toString(),
        name: file.name,
        status: 'done',
        url: imageUrl,
      };
      
      const newFileList = [...fileList, newFile];
      setFileList(newFileList);
      
      // 通知父组件
      const newUrls = newFileList.map(f => f.url!).filter(Boolean);
      onChange?.(newUrls);
      
      message.success('图片上传成功！');
    } catch (error) {
      console.error('图片上传失败:', error);
      message.error(error instanceof Error ? error.message : '图片上传失败！');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
    
    return false; // 阻止默认上传行为
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
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={handleRemove}
        beforeUpload={handleUpload}
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