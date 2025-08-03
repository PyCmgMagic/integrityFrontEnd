import React, { useState } from 'react';
import { Button, Toast, TextArea, ImageUploader,Divider } from 'antd-mobile';
import type { ImageUploadItem  } from 'antd-mobile';
// 定义传递给组件的 props 类型
interface CheckInPageProps {
  onSuccess?: (data: { content: string; images: ImageUploadItem[] }) => void;
  setIsCheckedIn: (isCheckIn: boolean) => void;
setGotoCheckIn: (gotoCheckIn: boolean) => void;
}
/**
 * 模拟上传函数
 * @param file 用户选择的文件
 * @returns 返回一个包含图片URL的Promise
 */
async function mockUpload(file: File): Promise<ImageUploadItem> {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  // 返回一个包含本地预览 URL 的对象
  return {
    url: URL.createObjectURL(file),
  };
}

/**
 * 打卡页面组件
 * (已使用 antd-mobile 的 ImageUploader)
 */
const CheckInPage: React.FC<CheckInPageProps> = ({ onSuccess, setIsCheckedIn, setGotoCheckIn }) => {
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
    if (!content.trim()) {
      Toast.show({
        content: '请输入打卡内容',
        position: 'bottom',
      });
      return;
    }
    if (fileList.length === 0) {
      Toast.show({
        content: '请至少上传一张图片',
        position: 'bottom',
      });
      return;
    }

    setLoading(true);
    // 模拟异步提交过程
    try {
      console.log('提交的内容:', content);
      console.log('提交的图片:', fileList);
      await new Promise(resolve => setTimeout(resolve, 1500));
      Toast.show({
        content: '打卡成功！',
      });
      // 成功后清空表单
      setFileList([]);
      setContent('');
    } catch (error) {
      Toast.show({
        content: '打卡失败，请重试',
      });
    } finally {
      setLoading(false);
    }
    setGotoCheckIn(false);
    setIsCheckedIn(true);
  };

  return (
    // 页面主容器
    <div className="flex flex-col h-screen bg-gray-50 font-sans">
      {/* 主要内容区 */}
      <main className="flex-grow p-4 overflow-y-auto">
        {/* 打卡任务描述和文本输入 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <TextArea
            value={content}
            onChange={setContent}
            placeholder="请输入打卡内容"
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
              upload={mockUpload}
              style={{ '--cell-size': '90px' }}
              beforeUpload={(file, files) => {
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

export default CheckInPage;