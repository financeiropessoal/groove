import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-400 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Groove Music</h3>
            <p className="text-sm">Conectando talentos musicais a oportunidades únicas. Encontre o som perfeito para o seu evento.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/artists" className="hover:text-red-400 transition-colors">Artistas</Link></li>
              <li><Link to="/how-it-works" className="hover:text-red-400 transition-colors">Como Funciona</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-red-400 transition-colors">Termos de Serviço</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-red-400 transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/admin/login" className="hover:text-red-400 transition-colors inline-flex items-center gap-2"><i className="fas fa-shield-alt"></i>Admin</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Siga-nos</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:text-red-400 transition-colors" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:text-red-400 transition-colors" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-xl hover:text-red-400 transition-colors" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Groove Music. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
