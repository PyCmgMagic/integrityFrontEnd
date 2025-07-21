import { type ReactNode } from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backPath?: string;
  headerExtra?: ReactNode;
  className?: string;
}

const PageContainer = ({ 
  children, 
  title, 
  subtitle, 
  showBack = false, 
  backPath,
  headerExtra,
  className = '' 
}: PageContainerProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`page-container ${className}`}>
      {(title || showBack || headerExtra) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {showBack && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                className="mr-3 modern-btn"
              />
            )}
            <div>
              {title && (
                <h1 className="text-2xl font-bold text-gray-800 mb-0">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-gray-600 text-sm mt-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerExtra && (
            <div>{headerExtra}</div>
          )}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};

export default PageContainer; 