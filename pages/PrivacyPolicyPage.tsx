import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-gray-800/50 p-8 rounded-lg">
      <h1 className="text-3xl font-bold text-white mb-6">Política de Privacidade</h1>
      <div className="space-y-4 text-gray-300">
        <p>Sua privacidade é importante para nós. Esta política de privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você visita nosso site.</p>
        
        <h2 className="text-xl font-semibold text-red-400 pt-4">1. Coleta de Informações</h2>
        <p>Coletamos informações pessoalmente identificáveis, como seu nome, endereço de e-mail, etc., quando você se registra voluntariamente em nosso site. Também coletamos informações sobre seu uso da plataforma.</p>

        <h2 className="text-xl font-semibold text-red-400 pt-4">2. Uso das Informações</h2>
        <p>Usamos as informações coletadas para:</p>
        <ul className="list-disc list-inside ml-4">
          <li>Fornecer, operar e manter nossa plataforma.</li>
          <li>Melhorar, personalizar e expandir nossa plataforma.</li>
          <li>Entender e analisar como você usa nossa plataforma.</li>
          <li>Desenvolver novos produtos, serviços, recursos e funcionalidades.</li>
          <li>Comunicar com você, diretamente ou através de um de nossos parceiros.</li>
        </ul>

        <h2 className="text-xl font-semibold text-red-400 pt-4">3. Segurança dos Dados</h2>
        <p>Usamos medidas de segurança administrativas, técnicas e físicas para proteger suas informações pessoais. No entanto, nenhum sistema de segurança é impenetrável e não podemos garantir a segurança de nossos sistemas 100%.</p>
        
        <h2 className="text-xl font-semibold text-red-400 pt-4">4. Seus Direitos</h2>
        <p>Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Você pode fazer isso através das configurações de sua conta ou entrando em contato conosco.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
