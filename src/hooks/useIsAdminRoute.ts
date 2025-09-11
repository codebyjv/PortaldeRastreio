import { useLocation } from 'react-router-dom';

export const useIsAdminPage = () => {
  const location = useLocation();
  const adminPaths = ['/admin', '/ipem', '/rbc'];
  return adminPaths.some(path => location.pathname.startsWith(path));
};
