import React from 'react';

interface AccordionItemProps {
    title: string;
    icon: string;
    children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon, children }) => (
    <details className="group bg-gray-800/50 rounded-lg open:bg-gray-800 open:shadow-lg transition-all duration-300">
        <summary className="p-4 flex items-center gap-4 cursor-pointer text-lg font-semibold text-white list-none">
            <i className={`fas ${icon} text-red-500 w-6 text-center`}></i>
            {title}
            <i className="fas fa-chevron-down ml-auto transition-transform duration-300 group-open:rotate-180"></i>
        </summary>
        <div className="p-6 border-t border-gray-700 text-gray-300 leading-relaxed space-y-4">
            {children}
        </div>
    </details>
);

const ManualPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white">Manual de Uso</h1>
                <p className="text-lg text-gray-400 mt-2">Tudo o que você precisa saber para aproveitar ao máximo o Groove Music.</p>
            </div>
            
            <div className="space-y-4">
                <AccordionItem title="Para Visitantes e Fãs de Música" icon="fa-glasses">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Encontrando Artistas</h3>
                    <p>Na página "Artistas", você pode usar a barra de busca, os filtros de gênero musical e o seletor de data para encontrar exatamente o que procura. Ordene os resultados por nome ou gênero para facilitar sua busca.</p>
                    
                    <h3 className="text-xl font-bold text-red-400 mb-2 mt-4">Explorando o Perfil de um Artista</h3>
                    <p>Ao clicar em um artista, uma janela com seu perfil completo se abrirá. Use as abas para navegar entre: <strong>Sobre</strong> (biografia e vídeo), <strong>Pacotes</strong> (opções de show e preços), <strong>Repertório</strong>, <strong>Galeria de Fotos</strong>, e mais. No lado direito, você pode ver a agenda e solicitar uma contratação.</p>
                
                    <h3 className="text-xl font-bold text-red-400 mb-2 mt-4">Agenda de Shows</h3>
                    <p>No topo da página de artistas, o botão "Agenda de Shows" mostra todos os próximos eventos já confirmados na plataforma, permitindo que você acompanhe onde seus artistas favoritos irão tocar.</p>
                </AccordionItem>

                <AccordionItem title="Para Artistas" icon="fa-microphone-alt">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Painel de Gerenciamento</h3>
                    <p>Seu painel é o centro de controle. Cada card te leva a uma área específica para gerenciar seu perfil, shows e finanças. Explore-os para manter seu perfil sempre completo e atualizado.</p>
                    
                    <h3 className="text-xl font-bold text-red-400 mb-2 mt-4">Força do Perfil</h3>
                    <p>Esta barra de progresso mostra o quão completo está seu perfil. Perfis mais completos (acima de 80%) aparecem com mais destaque e têm mais chances de serem contratados. Clique nos itens pendentes para completá-los.</p>
                
                    <h3 className="text-xl font-bold text-red-400 mb-2 mt-4">Oportunidades de Shows</h3>
                    <p>Nesta página, você vê as "Vagas Abertas" publicadas pelos contratantes. Se uma vaga combina com seu trabalho, você pode reservá-la imediatamente. Use o "Radar de Oportunidades" com IA no seu painel para encontrar as vagas mais compatíveis com seu perfil.</p>

                    <h3 className="text-xl font-bold text-red-400 mb-2 mt-4">Gerador de Post (IA)</h3>
                    <p>Selecione um de seus próximos shows, escolha um tom (ex: Animado, Intimista) e deixe nossa Inteligência Artificial criar um texto pronto para você copiar e colar nas suas redes sociais, economizando tempo na divulgação.</p>

                    <h3 className="text-xl font-bold text-red-400 mb-2 mt-4">Controle Financeiro</h3>
                    <p>Acompanhe todas as suas finanças. A página é dividida em: Balanço Geral, Suas Receitas e Despesas Pessoais (que você pode adicionar manualmente), e o Extrato de Shows da plataforma, onde você gerencia o pagamento de custos e o recebimento do seu cachê.</p>
                
                    <h3 className="text-xl font-bold text-red-400 mb-2 mt-4">Pacotes, Repertório, Agenda, etc.</h3>
                    <p>Nas respectivas páginas de edição, você pode detalhar tudo sobre seu trabalho: crie pacotes de show com preços calculados automaticamente, liste suas músicas, adicione fotos e vídeos, e marque suas datas ocupadas para que os contratantes vejam sua disponibilidade real.</p>
                </AccordionItem>

                <AccordionItem title="Para Contratantes" icon="fa-store">
                     <h3 className="text-xl font-bold text-red-400 mb-2">Painel de Gerenciamento</h3>
                     <p>Seu painel oferece acesso rápido às principais ações: encontrar artistas, publicar uma nova data para show, e editar as informações do seu estabelecimento.</p>

                     <h3 className="text-xl font-bold text-red-400 mb-2 mt-4">Contratando um Artista</h3>
                     <p>Navegue pela página "Artistas", use os filtros para encontrar o talento ideal e clique para ver o perfil completo. No perfil, verifique a agenda, selecione as datas desejadas, escolha um dos pacotes de show oferecidos pelo artista e envie a proposta. O artista será notificado para confirmar.</p>

                     <h3 className="text-xl font-bold text-red-400 mb-2 mt-4">Oferecer uma Data (Vaga Aberta)</h3>
                     <p>Se você tem uma data e um cachê definidos, use a opção "Oferecer uma Data". Preencha os detalhes como data, horário, valor e gênero musical. A vaga ficará disponível para todos os artistas da plataforma, e o primeiro a aceitar garante o show.</p>

                     <h3 className="text-xl font-bold text-red-400 mb-2 mt-4">Análise de Performance</h3>
                     <p>Em seu painel, você encontrará um resumo de seus gastos com música ao vivo, o custo médio por show e gráficos que mostram os estilos musicais que você mais contrata e seus artistas favoritos. Use esses dados para otimizar suas futuras contratações.</p>

                     <h3 className="text-xl font-bold text-red-400 mb-2 mt-4">Deixando um Depoimento</h3>
                     <p>Após um show, vá até a seção "Histórico de Shows Realizados" em seu painel. Lá, você pode clicar em "Avaliar" para deixar um depoimento sobre a performance do artista. Boas avaliações ajudam toda a comunidade!</p>
                </AccordionItem>
                
                <AccordionItem title="Para Administradores" icon="fa-shield-alt">
                     <h3 className="text-xl font-bold text-red-400 mb-2">Dashboard Principal</h3>
                     <p>A tela inicial oferece uma visão geral da saúde da plataforma, com estatísticas chave como faturamento bruto, comissão, repasses, e número total de usuários e shows. Os gráficos mostram a performance ao longo do tempo e a distribuição de gêneros musicais.</p>

                     <h3 className="text-xl font-bold text-red-400 mb-2 mt-4">Gerenciando Artistas</h3>
                     <p>Na aba "Artistas", você pode ver todos os músicos cadastrados. Use o filtro "Pendentes" para encontrar novos cadastros. A partir daqui, você pode "Aprovar" um artista para que seu perfil se torne público, ou "Remover" perfis inadequados.</p>

                     <h3 className="text-xl font-bold text-red-400 mb-2 mt-4">Gerenciando Contratantes</h3>
                     <p>A aba "Contratantes" lista todos os locais cadastrados. Você pode "Bloquear" temporariamente a conta de um local (impedindo-o de realizar novas ações) ou "Remover" permanentemente, caso necessário.</p>
                     
                     <h3 className="text-xl font-bold text-red-400 mb-2 mt-4">Log de Atividades</h3>
                     <p>A aba "Atividades" exibe um feed em tempo real de tudo o que acontece na plataforma: novos cadastros, aprovações, novas vagas de show publicadas e shows reservados. É a melhor forma de monitorar a dinâmica do ecossistema.</p>
                </AccordionItem>
            </div>
        </div>
    );
};

export default ManualPage;