import { Routes, Route } from 'react-router-dom';
import { OrderTrackingPortal } from './components/OrderTrackingPortal';
import AdminPage from '../pages/admin'; // ← Importe a página admin

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<OrderTrackingPortal />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  )
}