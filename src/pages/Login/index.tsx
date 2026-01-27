import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store';
import { useRequest } from '../../hooks/useRequest';
import API from '../../services/api';
import styles from './Login.module.css';
import horseIconUrl from '../../assets/马头.svg';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, setUserProfile } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user');

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const casLoginUrl = apiBaseUrl
    ? `${apiBaseUrl.replace(/\/$/, '')}/user/cas/login`
    : 'https://daka.sduonline.cn/api/v1/user/cas/login';

  const handleCasLogin = () => {
    window.location.href = casLoginUrl;
  };

  /** 输入框获得焦点时滚动到可见区域，避免移动端键盘挡住输入框 */
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const el = e.target;
    setTimeout(() => {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 320);
  };

  /**
   * 使用网络请求 Hook 处理登录
   */
  const { loading, run: performLogin } = useRequest(API.Auth.login, {
    manual: true,
    showError: true,
    showSuccess: true,
    successMessage: '登录成功！',
    onSuccess: async (data) => {
      // 更新认证状态
      login(data);
      
      try {
        // 获取用户个人信息
        const userProfile = await API.User.getCurrentUser();
        setUserProfile(userProfile);
      } catch (error) {
        console.error('获取用户信息失败:', error);
        // 即使获取用户信息失败，也不影响登录流程
      }
      
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
  const handleLogin = async (username1?: string, password1?: string) => {
    if(username1 && password1){
       await performLogin({
      student_id: username1,
      password: password1
    });
    }else{

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
    }
  };

  return (
    <div className={styles.screenContainer}>
      <div className={styles.background} />
      <div className={styles.bottomWave} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <img className={styles.logoIcon} src={horseIconUrl} alt="logo" />
            <div className={styles.logoWaves}>
              <div className={styles.wave} />
              <div className={styles.wave} />
              <div className={styles.wave} />
            </div>
          </div>
          <div className={styles.pageTitle}>
            <span className={styles.pageTitleQuote}>“驹光踏浪，笃行不倦”</span>
            <span className={styles.pageTitleSub}>寒假成长打卡活动</span>
          </div>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.roleSwitcher}>
            <span
              className={styles.roleIndicator}
              style={{ transform: loginType === 'admin' ? 'translateX(100%)' : 'translateX(0%)' }}
            />
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

          <div key={loginType} className={styles.formBody}>
            {loginType === 'user' ? (
              <button
                className={`${styles.submitButton} ${styles.casButton}`}
                onClick={handleCasLogin}
                disabled={loading}
              >
                <LoginOutlined className={styles.casButtonIcon} />
                使用山东大学统一认证登录
              </button>
            ) : (
              <>
              <div className={styles.inputWrapper}>
                <UserOutlined className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={handleInputFocus}
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
                  onFocus={handleInputFocus}
                  className={styles.input}
                  disabled={loading}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
                <button
                  className={styles.submitButton}
                  onClick={() => handleLogin(username, password)}
                  disabled={loading}
                >
                  {loading ? '加载中...' : '登录'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.footerLink}>学生在线，精彩无限</button>
          {/* <button 
            className={styles.footerLink}
            onClick={() => {
              message.info({
                content: '请联系山东大学学生在线技术开发工作站',
                duration: 3,
                style: {
                  marginTop: '20vh',
                },
              });
            }}
          >
            需要帮助？
          </button> */}
        </div>
      </div>
    </div>
  );  
};

export default LoginPage;
