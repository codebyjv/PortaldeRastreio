import { Routes, Route } from 'react-router-dom';
import { OrderTrackingPortal } from './components/OrderTrackingPortal';
import AdminPage from '../pages/admin'; 
import { FAQPage } from '../pages/faq';
import IpemPage from '../pages/ipem';
import RbcPage from '../pages/rbc';

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<OrderTrackingPortal />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/ipem" element={<IpemPage />} />
        <Route path="/rbc" element={<RbcPage />} />
      </Routes>
    </div>
  )
}