import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700/50 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Groove Music</h3>
            <p className="text-sm text-gray-400">Conectando artistas e contratantes para criar momentos inesquecíveis.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/how-it-works" className="text-gray-400 hover:text-white">Como Funciona</Link></li>
              <li><Link to="/artists" className="text-gray-400 hover:text-white">Artistas</Link></li>
              <li><Link to="/venues" className="text-gray-400 hover:text-white">Locais</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-gray-400 hover:text-white">Termos de Serviço</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-white">Política de Privacidade</Link></li>
              <li><Link to="/admin/login" className="text-gray-400 hover:text-white">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Conecte-se</h3>
            <div className="flex space-x-4 text-2xl">
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-instagram"></i></a>
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-facebook"></i></a>
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-twitter"></i></a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Groove Music. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;