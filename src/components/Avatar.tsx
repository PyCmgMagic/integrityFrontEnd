import React from 'react';

interface AvatarProps {
  src?: string;
  size?: number;
  name?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, size = 40, name = 'User' }) => (
  <div 
    className="avatar"
    style={{ 
      width: size, 
      height: size, 
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #8B7EDB 0%, #A594F0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: size * 0.4,
      fontWeight: 600
    }}
  >
    {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /> : name[0]}
  </div>
); 