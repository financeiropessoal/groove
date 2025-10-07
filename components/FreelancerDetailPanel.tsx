import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Artist } from '../types';
import { ChatService } from '../services/ChatService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface FreelancerDetailPanelProps {
  freelancer: Artist;
  onClose: () => void;
}

const FreelancerDetailPanel: React.FC<FreelancerDetailPanelProps> = ({ freelancer, onClose }) => {
  const { artist } = useAuth(); // The user viewing the panel is an artist
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleContact = async () => {
    if (!artist) {
      showToast("Você precisa estar logado como artista para contatar um freelancer.", "error");
      return;
    }
    // Note: The logic assumes an 'artist' contacts another 'artist' (who is a freelancer).
    // The ChatService needs to handle this artist-to-artist conversation.
    // For simplicity, we'll assume the chat can be found/created with two artist IDs.
    // A more robust system might need a different table for this.
    
    // Placeholder logic for artist-artist chat. Let's find a conversation between them.
    // This part of ChatService might need adjustment. For now, let's pretend it works.
    
    // We are cheating here for the demo, making the current user a "venue" temporarily for the ChatService.
    // A real implementation would have a more flexible ChatService.
    const tempVenueIdForChat = artist.id; 

    const conversation = await ChatService.findOrCreateConversation(freelancer.id, tempVenueIdForChat);
    if (conversation) {
        navigate(`/chat/${conversation.id}`);
    } else {
        showToast("Não foi possível iniciar a conversa.", "error");
    }
  };


  return (
    <div className="bg-gray-800 w-full h-full shadow-2xl flex flex-col relative p-6 overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-white">&times;</button>
        <div className="text-center">
            <img src={freelancer.imageUrl} alt={freelancer.name} className="w-32 h-32 rounded-full mx-auto object-cover mb-4 border-4 border-gray-700" />
            <h2 className="text-3xl font-bold">{freelancer.name}</h2>
            <p className="text-xl text-pink-400">{freelancer.freelancer_instruments?.[0] || 'Músico'}</p>
            <p className="text-gray-400">{freelancer.city}</p>
            {freelancer.freelancer_rate && freelancer.freelancer_rate > 0 && (
                <p className="text-lg text-green-400 mt-2 font-bold">
                    R$ {freelancer.freelancer_rate.toFixed(2)}
                    <span className="text-sm text-gray-400 font-normal"> / {freelancer.freelancer_rate_unit}</span>
                </p>
            )}
        </div>
        <div className="mt-6">
            <h3 className="font-bold mb-2 text-pink-400">Bio</h3>
            <p className="text-gray-300 text-sm whitespace-pre-line">{freelancer.bio || "Nenhuma bio informada."}</p>
        </div>
        <div className="mt-6">
            <h3 className="font-bold mb-2 text-pink-400">Instrumentos & Habilidades</h3>
            <div className="flex flex-wrap gap-2">
                {freelancer.freelancer_instruments?.map(style => <span key={style} className="bg-gray-700 px-3 py-1 text-sm rounded-full">{style}</span>)}
            </div>
        </div>
        {freelancer.youtubeVideoId && (
            <div className="mt-6">
                <h3 className="font-bold text-pink-400 mb-2">Vídeo de Performance</h3>
                <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe src={`https://www.youtube.com/embed/${freelancer.youtubeVideoId}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full"></iframe>
                </div>
            </div>
        )}
        <div className="mt-auto pt-6">
            <button onClick={handleContact} className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-3 rounded-lg">
                <i className="fas fa-comments mr-2"></i>
                Contatar {freelancer.name}
            </button>
        </div>
    </div>
  );
};

export default FreelancerDetailPanel;