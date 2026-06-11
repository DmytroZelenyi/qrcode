import Cookies from 'js-cookie';

export const setToken = (token: string) => {
  localStorage.setItem('token', token);
  Cookies.set('token', token, { expires: 7 });
};

export const getToken = () => {
  return localStorage.getItem('token') || Cookies.get('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
  Cookies.remove('token');
};

export const getAuthHeaders = () => {
  const token = getToken();
  return token ? {
    Authorization: `Bearer ${token}`
  } : {};
};