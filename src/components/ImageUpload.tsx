import { useState } from 'react';
import { Upload, message, Modal, Image } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

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

  const customRequest = async ({ file, onSuccess, onError }: any) => {
    // 模拟上传过程
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 创建本地预览URL
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        onSuccess?.({
          url: imageUrl,
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
      
      message.success('图片上传成功！');
    } catch (error) {
      onError?.(error);
      message.error('图片上传失败！');
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
      <PlusOutlined className="text-2xl text-gray-400 mb-2" />
      <div className="text-gray-600 text-sm">点击上传</div>
    </div>
  );

  return (
    <div className={className}>
      <Upload
        customRequest={customRequest}
        listType="picture-card"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={handleRemove}
        beforeUpload={beforeUpload}
        disabled={disabled}
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