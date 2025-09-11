import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Layout } from './Layout';

export const RbcDashboard = () => {
  return (
    <Layout>
      <div className="space-y-4 p-4 md:p-6">
        <h1 className="text-2xl font-bold">Gestão de Calibração RBC</h1>
        <Card>
          <CardHeader>
            <CardTitle>Funcionalidade Futura</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Esta área será dedicada à gestão de calibrações RBC.</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};