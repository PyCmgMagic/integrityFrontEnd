import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store';
import styles from './Login.module.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');

  const handleLogin = async () => {
    if (!username || !password) {
      message.error('请输入用户名和密码');
      return;
    }

    setLoading(true);
    try {
      // 模拟登录过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const role = loginType;
      
      const user = {
        id: role === 'admin' ? 'admin-001' : 'user-001',
        name: role === 'admin' ? '管理员' : username,
        role: role,
        avatar: '',
        email: role === 'admin' ? 'admin@example.com' : `${username}@example.com`
      };

      login(user);
      message.success('登录成功！');
      
      // 根据角色跳转
      navigate(role === 'admin' ? '/admin/home' : '/user/home');
    } catch (error) {
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
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
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
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