

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { isSupabaseConfigured } from '../supabaseClient';
import ConfigurationWarning from '../components/ConfigurationWarning';

const GeneratePostPage: React.FC = () => {
  const { artist } = useAuth();
  const { showToast } = useToast();
  const [platform, setPlatform] = useState('instagram');
  const [eventType, setEventType] = useState('');
  const [vibe, setVibe] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // FIX: Use `process.env.API_KEY` as per Gemini API guidelines and to resolve TypeScript error.
  const apiKey = process.env.API_KEY;

  if (!apiKey && isSupabaseConfigured) { // Show Gemini-specific warning only if Supabase is configured
    return <ConfigurationWarning />;
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      showToast('A chave de API para o serviço de IA não está configurada.', 'error');
      return;
    }
    
    setIsLoading(true);
    setGeneratedPost('');

    const prompt = `Crie um texto para um post de ${platform} para um músico chamado ${artist?.name}. O show será ${eventType}. O clima do post deve ser ${vibe}. Inclua hashtags relevantes.`;
    
    try {
      // FIX: Use `ai.models.generateContent` instead of the deprecated `getGenerativeModel` and `generateContent`.
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      // FIX: Access the generated text directly via the `.text` property on the response object.
      const text = response.text;
      setGeneratedPost(text);
    } catch (error) {
      console.error("Error generating post:", error);
      showToast('Falha ao gerar post. Verifique o console para mais detalhes.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPost);
    showToast('Post copiado para a área de transferência!', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
              <i className="fas fa-arrow-left text-2xl"></i>
          </Link>
          <h1 className="text-3xl font-bold">Gerador de Posts com IA</h1>
      </div>
      <div className="bg-gray-800 p-8 rounded-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Plataforma</label>
            <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3">
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="twitter">Twitter (X)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Evento</label>
            <input type="text" value={eventType} onChange={e => setEventType(e.target.value)} placeholder="Ex: show acústico no Bar do Zé" required className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Clima do Post</label>
            <input type="text" value={vibe} onChange={e => setVibe(e.target.value)} placeholder="Ex: animado e convidativo" required className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-3 rounded-lg disabled:opacity-50">
            {isLoading ? 'Gerando...' : 'Gerar Post'}
          </button>
        </form>

        {generatedPost && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h2 className="text-xl font-bold mb-4">Post Sugerido:</h2>
            <div className="bg-gray-900 p-4 rounded-lg whitespace-pre-wrap relative">
              <button onClick={handleCopy} className="absolute top-2 right-2 bg-gray-700 px-2 py-1 text-xs rounded hover:bg-gray-600">Copiar</button>
              {generatedPost}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratePostPage;
