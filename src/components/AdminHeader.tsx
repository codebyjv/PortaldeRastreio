import { Home, LogOut, FileCheck, FlaskConical } from 'lucide-react';
import { Button } from './ui/button';
import { ReminderBell } from './ReminderBell';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Redirect to a public page on logout
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-card sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate('/admin')} variant="outline">
          <Home className="w-4 h-4 mr-2" />
          Painel
        </Button>
        <Button onClick={() => navigate('/ipem')} variant="outline">
          <FileCheck className="w-4 h-4 mr-2" />
          Gestão IPEM
        </Button>
        <Button onClick={() => navigate('/rbc')} variant="outline">
          <FlaskConical className="w-4 h-4 mr-2" />
          Gestão RBC
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <ReminderBell />
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </header>
  );
};
