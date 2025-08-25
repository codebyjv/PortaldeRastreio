import { useLocation } from 'react-router-dom';

export const useIsAdminRoute = () => {
  const location = useLocation();
  return location.pathname.startsWith('/admin');
};