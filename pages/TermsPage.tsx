import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto bg-gray-800/50 p-8 rounded-lg">
      <h1 className="text-3xl font-bold text-white mb-6">Termos de Serviço e Código de Conduta</h1>
      <div className="space-y-4 text-gray-300">
        <p>Bem-vindo ao Groove Music. Ao utilizar nossa plataforma, você concorda com estes termos. Por favor, leia-os com atenção.</p>
        
        <h2 className="text-xl font-semibold text-red-400 pt-4">1. Nosso Papel</h2>
        <p>A Groove Music é uma plataforma que atua como um hub para conectar artistas musicais a contratantes (bares, restaurantes, produtores de eventos). Nosso objetivo é facilitar essa conexão. Não somos parte de nenhum contrato ou acordo firmado entre artistas e contratantes. A responsabilidade por negociações, pagamentos, e execução dos serviços é exclusivamente das partes envolvidas.</p>

        <h2 className="text-xl font-semibold text-red-400 pt-4">2. Contas</h2>
        <p>Você é responsável por manter a segurança de sua conta e por todas as atividades que ocorrem sob ela. Você deve nos notificar imediatamente sobre qualquer uso não autorizado de sua conta.</p>

        <h2 className="text-xl font-semibold text-red-400 pt-4">3. Código de Conduta</h2>
        <p>Para manter um ambiente profissional e respeitoso, todos os usuários devem seguir as seguintes regras:</p>
        <ul className="list-disc list-inside ml-4 space-y-2">
            <li><strong>Respeito Mútuo:</strong> Toda comunicação na plataforma deve ser profissional e respeitosa. Não toleramos assédio, discriminação, discurso de ódio ou qualquer tipo de comportamento abusivo.</li>
            <li><strong>Conteúdo Apropriado:</strong> Todo conteúdo enviado (fotos, vídeos, biografias, mensagens) não deve conter material ofensivo, ilegal, difamatório, pornográfico ou que viole direitos autorais de terceiros.</li>
            <li><strong>Veracidade das Informações:</strong> As informações fornecidas em seu perfil devem ser verdadeiras e precisas. Falsificar informações sobre suas habilidades, repertório ou estrutura do local é uma violação destes termos.</li>
            <li><strong>Responsabilidade Pessoal:</strong> Cada usuário é responsável por suas próprias ações e acordos. A Groove Music não se responsabiliza por cancelamentos de shows, problemas de pagamento, danos a equipamentos ou qualquer outra disputa que possa surgir entre artista e contratante.</li>
        </ul>

        <h2 className="text-xl font-semibold text-red-400 pt-4">4. Pagamentos e Taxas</h2>
        <p>A plataforma cobra uma taxa de serviço sobre as transações realizadas. Esta taxa é claramente indicada durante o processo de contratação e é usada para manter e melhorar nossos serviços. Todos os pagamentos são processados através de um gateway seguro.</p>
        
        <h2 className="text-xl font-semibold text-red-400 pt-4">5. Moderação e Rescisão</h2>
        <p>Reservamo-nos o direito de suspender, bloquear ou encerrar sua conta a qualquer momento, sem aviso prévio, caso identifiquemos uma violação destes Termos de Serviço ou do Código de Conduta. A decisão de reativar uma conta é de nossa inteira discrição.</p>
      </div>
    </div>
  );
};

export default TermsPage;