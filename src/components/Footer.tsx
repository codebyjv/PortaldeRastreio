// components/Footer.tsx
import React from 'react';
import { Building, Mail, Phone, MapPin, Link } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Informações da Empresa */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2" />
              WL Pesos Padrão
            </h3>
            <p className="text-gray-300 mb-4">
              Mais de 15 anos de experiência em fabrição e calibração de pesos padrão em todo Brasil.
            </p>
            <p className="text-sm text-gray-400">
              CNPJ: 10.504.346/0001-80
            </p>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-red-600" />
                <span className="text-gray-300">(11) 3641-5974</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-red-600" />
                <span className="text-gray-300">comercial@wlpesospadrao.com.br</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-red-600" />
                <span className="text-gray-300">Rua Roberto de Lamenais, 248 - Vila Mangalot, São Paulo / SP</span>
              </div>
            </div>
          </div>

          {/* Desenvolvimento */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Desenvolvimento</h3>
            <p className="text-gray-300 mb-2">
              Desenvolvido por WL Pesos Padrão
            </p>
            <p className="text-sm text-gray-400 mb-2">
              Sistema de gestão de pedidos e rastreamento
            </p>
            <p className="text-sm text-gray-400">
              <Link to="/faq" className="hover:underline">Perguntas Frequentes (FAQ)</Link>
            </p>
            <p className="text-sm text-gray-400 mt-2">
              © {currentYear} - Todos os direitos reservados
            </p>
          </div>
        </div>

        {/* Divisor e informações adicionais */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-400">
            Marca Registrada ® - Os dados são de propriedade da WL Pesos Padrão LTDA.
          </p>
        </div>
      </div>
    </footer>
  );
};