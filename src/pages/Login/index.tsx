import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store';
import { useRequest } from '../../hooks/useRequest';
import API from '../../services/api';
import styles from './Login.module.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');

  /**
   * 使用网络请求 Hook 处理登录
   */
  const { loading, run: performLogin } = useRequest(API.Auth.login, {
    manual: true,
    showError: true,
    showSuccess: true,
    successMessage: '登录成功！',
    onSuccess: (data) => {
      // 更新认证状态
      login(data);
      // 根据角色跳转到相应页面
      const targetPath = data.role_id === 1 ? '/admin/home' : '/user/home';
      navigate(targetPath);
    },
    onError: (error) => {
      console.error('登录失败:', error);
    },
  });
  /**
   * 处理登录表单提交
   */
  const handleLogin = async () => {
    // 基础验证
    if (!username.trim()) {
      message.error('请输入用户名');
      return;
    }
    
    if (!password.trim()) {
      message.error('请输入密码');
      return;
    }
    // 执行登录请求
    await performLogin({
      student_id: username,
      password
    });
  };

  return (
    <div className={styles.screenContainer}>
      <div className={styles.background} />
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <span className={styles.titleText}>打卡</span>
            <div className={styles.logoWaves}>
              <div className={styles.wave} />
              <div className={styles.wave} />
              <div className={styles.wave} />
            </div>
          </div>
        </div>

        <div className={styles.formContainer}>
          {/* 切换按钮下移到输入框上方 */}
          <div className={styles.roleSwitcher}>
            <button
              className={`${styles.roleButton} ${loginType === 'user' ? styles.active : ''}`}
              onClick={() => setLoginType('user')}
              disabled={loading}
            >
              用户登录
            </button>
            <button
              className={`${styles.roleButton} ${loginType === 'admin' ? styles.active : ''}`}
              onClick={() => setLoginType('admin')}
              disabled={loading}
            >
              管理员登录
            </button>
          </div>
          <div className={styles.inputWrapper}>
            <UserOutlined className={styles.inputIcon} />
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              disabled={loading}
            />
          </div>
          <div className={styles.inputWrapper}>
            <LockOutlined className={styles.inputIcon} />
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              disabled={loading}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <button 
            className={styles.submitButton} 
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? '加载中...' : '登录'}
          </button>
        </div>

        <div className={styles.footer}>
          <button className={styles.footerLink}>注册账号</button>
          <button className={styles.footerLink}>需要帮助？</button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;