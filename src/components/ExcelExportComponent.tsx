import React, { useState } from 'react';
import { Button, Modal, Progress, message, Typography, Spin } from 'antd';
import { DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { formatBeijingDateYmd } from '../utils/beijingTime';

const { Text, Title } = Typography;

/**
 * 打卡记录数据接口
 */
export interface CheckInRecord {
  id: string;
  userName: string;
  checkInTime: string;
  score: number;
  categoryName: string;
}

/**
 * 活动数据接口
 */
export interface ActivityData {
  id: string;
  title: string;
  checkInRecords: CheckInRecord[];
}

/**
 * Excel导出组件属性接口
 */
export interface ExcelExportComponentProps {
  /** 活动数据 */
  activityData: ActivityData;
  /** 按钮文本 */
  buttonText?: string;
  /** 按钮类型 */
  buttonType?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  /** 按钮大小 */
  buttonSize?: 'small' | 'middle' | 'large';
  /** 自定义样式类名 */
  className?: string;
  /** 导出成功回调 */
  onExportSuccess?: (fileName: string) => void;
  /** 导出失败回调 */
  onExportError?: (error: Error) => void;
}

/**
 * Excel导出组件
 * 支持将活动数据按栏目分工作表导出为Excel文件
 */
const ExcelExportComponent: React.FC<ExcelExportComponentProps> = ({
  activityData,
  buttonText = '导出Excel',
  buttonType = 'primary',
  buttonSize = 'middle',
  className = '',
  onExportSuccess,
  onExportError,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [showProgressModal, setShowProgressModal] = useState(false);

  /**
   * 按栏目分组打卡记录
   * @param records 打卡记录数组
   * @returns 按栏目分组的记录对象
   */
  const groupRecordsByCategory = (records: CheckInRecord[]) => {
    const grouped: { [categoryName: string]: CheckInRecord[] } = {};
    
    records.forEach(record => {
      const categoryName = record.categoryName || '未分类';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(record);
    });
    
    return grouped;
  };

  /**
   * 创建工作表数据
   * @param records 打卡记录数组
   * @returns 工作表数据数组
   */
  const createWorksheetData = (records: CheckInRecord[]) => {
    // 表头
    const headers = ['用户名称', '打卡时间', '打卡分数'];
    
    // 数据行
    const dataRows = records.map(record => [
      record.userName,
      record.checkInTime,
      record.score
    ]);
    
    return [headers, ...dataRows];
  };

  /**
   * 执行Excel导出
   */
  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);
      setShowProgressModal(true);

      // 检查数据
      if (!activityData || !activityData.checkInRecords || activityData.checkInRecords.length === 0) {
        message.warning('暂无打卡记录可导出');
        return;
      }

      setExportProgress(20);

      // 按栏目分组记录
      const groupedRecords = groupRecordsByCategory(activityData.checkInRecords);
      const categoryNames = Object.keys(groupedRecords);

      if (categoryNames.length === 0) {
        message.warning('没有找到有效的栏目数据');
        return;
      }

      setExportProgress(40);

      // 创建工作簿
      const workbook = XLSX.utils.book_new();

      // 为每个栏目创建工作表
      categoryNames.forEach((categoryName, index) => {
        const records = groupedRecords[categoryName];
        const worksheetData = createWorksheetData(records);
        
        // 创建工作表
        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        
        // 设置列宽
        const columnWidths = [
          { wch: 15 }, // 用户名称
          { wch: 20 }, // 打卡时间
          { wch: 10 }  // 打卡分数
        ];
        worksheet['!cols'] = columnWidths;
        
        // 添加工作表到工作簿
        const sheetName = categoryName.length > 31 ? categoryName.substring(0, 31) : categoryName;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        
        // 更新进度
        const progress = 40 + ((index + 1) / categoryNames.length) * 40;
        setExportProgress(Math.round(progress));
      });

      setExportProgress(90);

      // 生成Excel文件
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });

      // 创建Blob并下载
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const fileName = `${activityData.title}_打卡记录_${formatBeijingDateYmd(Date.now())}.xlsx`;
      saveAs(blob, fileName);

      setExportProgress(100);
      
      // 延迟关闭进度弹窗
      setTimeout(() => {
        setShowProgressModal(false);
        message.success('Excel文件导出成功！');
        onExportSuccess?.(fileName);
      }, 500);

    } catch (error) {
      console.error('Excel导出失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      message.error(`导出失败: ${errorMessage}`);
      onExportError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsExporting(false);
      if (!showProgressModal) {
        setExportProgress(0);
      }
    }
  };

  return (
    <>
      <Button
        type={buttonType}
        size={buttonSize}
        icon={<DownloadOutlined />}
        loading={isExporting}
        onClick={handleExport}
        className={`${className} transition-all duration-200 hover:shadow-md`}
        disabled={!activityData.checkInRecords || activityData.checkInRecords.length === 0}
      >
        {buttonText}
      </Button>

      {/* 导出进度弹窗 */}
      <Modal
        title={
          <div className="flex items-center">
            <FileExcelOutlined className="text-green-500 mr-2" />
            <span>导出Excel文件</span>
          </div>
        }
        open={showProgressModal}
        footer={null}
        closable={false}
        centered
        width={400}
      >
        <div className="py-4">
          <div className="mb-4 text-center">
            <Spin spinning={exportProgress < 100}>
              <Title level={4} className="mb-2">
                {activityData.title}
              </Title>
              <Text type="secondary">
                正在导出打卡记录...
              </Text>
            </Spin>
          </div>
          
          <Progress
            percent={exportProgress}
            status={exportProgress === 100 ? 'success' : 'active'}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            className="mb-4"
          />
          
          <div className="text-center text-sm text-gray-500">
            {exportProgress < 20 && '准备导出数据...'}
            {exportProgress >= 20 && exportProgress < 40 && '分析打卡记录...'}
            {exportProgress >= 40 && exportProgress < 90 && '生成Excel工作表...'}
            {exportProgress >= 90 && exportProgress < 100 && '保存文件...'}
            {exportProgress === 100 && '导出完成！'}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ExcelExportComponent;
