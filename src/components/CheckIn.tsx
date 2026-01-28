import React, { useState } from 'react';
import { Button, Toast, TextArea, ImageUploader,Divider } from 'antd-mobile';
import type { ImageUploadItem  } from 'antd-mobile';
import { API } from '../services/api';
import { uploadImageToCloud, compressImage } from '../utils/imageUpload';
import { FIELD_LIMITS } from '../utils/fieldLimits';
// 定义传递给组件的 props 类型
interface CheckInPageProps {
  columnId: number; // 添加column_id参数
  onSuccess?: (data: { content: string; images: ImageUploadItem[] }) => void;
  setGotoCheckIn: (gotoCheckIn: boolean) => void;
}
/**
 * 真实图片上传函数
 * @param file 用户选择的文件
 * @returns 返回一个包含图片URL的Promise
 */
async function realUpload(file: File): Promise<ImageUploadItem> {
  try {
    // 如果文件大于1MB，先进行压缩
    let fileToUpload: File = file;
    if (file.size > 1024 * 1024) {
      Toast.show({
        content: '正在压缩图片...',
        duration: 1000,
      });
      fileToUpload = await compressImage(file, 1920, 1080, 0.8);
    }

    // 上传到 OSS
    const imageUrl = await uploadImageToCloud(fileToUpload);
    return {
      url: imageUrl,
    };
  } catch (error) {
    console.error('图片上传失败:', error);
    Toast.show({
      content: error instanceof Error ? error.message : '图片上传失败',
      position: 'bottom',
    });
    throw error;
  }
}
/**
 * 打卡页面组件
 */
const CheckIn: React.FC<CheckInPageProps> = ({ columnId, onSuccess, setGotoCheckIn }) => {
  // 图片文件列表状态
  const [fileList, setFileList] = useState<ImageUploadItem[]>([]);
  // 提交按钮的加载状态
  const [loading, setLoading] = useState(false);
  // 文本域内容状态
  const [content, setContent] = useState('');
  /**
   * 处理提交打卡逻辑
   */
  const handleSubmit = async () => {
    // 可以增加文本内容的校验
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      Toast.show({
        content: '请输入打卡内容(不超过500字)',
        position: 'bottom',
      });
      return;
    }
    if (trimmedContent.length > FIELD_LIMITS.checkInContent) {
      Toast.show({
        content: `打卡内容不能超过 ${FIELD_LIMITS.checkInContent} 个字符`,
        position: 'bottom',
      });
      return;
    }
    setLoading(true);
    try {
      // 提取图片URL
      const images = fileList.map(item => item.url).filter(Boolean) as string[];
      
      // 调用API提交打卡记录
      const response = await API.Column.insertPunchRecord({
        column_id: columnId,
        content: trimmedContent,
        images: images
      });

      // 根据审核状态显示不同的提示信息
      const statusMessage = response.status === 0 ? '打卡提交成功，正在审核中...' : '打卡成功！';
      
      Toast.show({
        content: statusMessage,
        duration: 2000,
      });
      
      // 成功后清空表单
      setFileList([]);
      setContent('');
      
      // 调用成功回调
      if (onSuccess) {
        onSuccess({ content, images: fileList });
      }
      
    } catch (error) {
      console.error('打卡提交失败:', error);
      Toast.show({
        content: '打卡提交失败，请重试',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
    setGotoCheckIn(false);
  };

  return (
    // 页面主容器 
    <div className="flex flex-col h-80vh bg-gray-50 font-sans">
      {/* 主要内容区 */}
      <main className="flex-grow p-4 overflow-y-auto">
        {/* 打卡任务描述和文本输入 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <TextArea
            value={content}
            onChange={setContent}
            placeholder="请输入打卡内容（不超过500字）"
            maxLength={FIELD_LIMITS.checkInContent}
            showCount
            autoSize={{ minRows: 4, maxRows: 6 }}
            className="text-base"
          />
        </div>
        
        {/* 图片上传区域 - 添加自定义样式 */}
            <Divider>最多上传8张图片</Divider>
          <div>
            <ImageUploader
              value={fileList}
              onChange={setFileList}
              upload={realUpload}
              style={{ '--cell-size': '90px' }}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  Toast.show('只能上传图片文件！');
                  return null;
                }
                const isLt10M = file.size / 1024 / 1024 < 10;
                if (!isLt10M) {
                  Toast.show('图片大小不能超过 10MB！');
                  return null;
                }
                return file;
              }}
              multiple
              maxCount={8}
            />
          </div>
      </main>
      
      {/* 固定的提交按钮区域 */}
      <div className="px-6 py-4 bg-gray-50 flex-shrink-0">
         <Button
           block
           shape="rounded"
           color="primary"
           size="large"
           loading={loading}
           onClick={handleSubmit}
         >
           提交打卡
         </Button>
      </div>

      {/* 全局样式来修复 ImageUploader 的居中问题 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .adm-image-uploader-cell {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .adm-image-uploader-cell-add {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-direction: column !important;
            width: 100% !important;
            height: 100% !important;
          }
          
          .adm-image-uploader-cell-add-icon {
            font-size: 24px !important;
            margin-bottom: 4px !important;
          }
          
          .adm-image-uploader-cell-add-text {
            font-size: 12px !important;
            color: #999 !important;
          }
        `
      }} />
    </div>
  );
};

export default CheckIn;
