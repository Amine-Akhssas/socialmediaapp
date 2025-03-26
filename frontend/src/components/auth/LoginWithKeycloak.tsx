import React from 'react';

const LoginWithKeycloak = () => {
  const handleLogin = () => {
    const clientId = 'fs202-app';
    const redirectUri = encodeURIComponent('http://localhost:5173/auth/callback');
    const authUrl = `http://localhost:8081/realms/FS-202/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;
    window.location.href = authUrl;
  };

  return <button onClick={handleLogin}>Login with Keycloak</button>;
};

export default LoginWithKeycloak;
