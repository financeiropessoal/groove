import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import { Artist } from '../data';
import { useToast } from '../contexts/ToastContext';
import { StorageService } from '../services/StorageService';

const EditProfilePage: React.FC = () => {
    const { artist, logout, updateArtistProfile } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: artist?.name || '',
        primaryGenre: artist?.genre?.primary || '',
        secondaryGenres: artist?.genre?.secondary?.join(', ') || '',
        phone: artist?.phone || '',
        bio: artist?.bio || '',
        instagram: artist?.socials?.instagram || '',
        spotify: artist?.socials?.spotify || '',
        facebook: artist?.socials?.facebook || '',
        imageUrl: artist?.imageUrl || '',
        youtubeVideoId: artist?.youtubeVideoId || '',
    });
    const [youtubeUrl, setYoutubeUrl] = useState(
      artist?.youtubeVideoId ? `https://www.youtube.com/watch?v=${artist.youtubeVideoId}` : ''
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isImprovingBio, setIsImprovingBio] = useState(false);
    const [aiError, setAiError] = useState('');
    const [suggestedBio, setSuggestedBio] = useState<string | null>(null);
    const [showAiSuggestion, setShowAiSuggestion] = useState(false);
    
    const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(formData.imageUrl);
    const [isUploading, setIsUploading] = useState(false);


    if (!artist) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p>Carregando dados do artista...</p>
            </div>
        );
    }
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                showToast('A imagem é muito grande. O limite é de 5MB.', 'error');
                return;
            }
            setProfileImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleYoutubeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setYoutubeUrl(url); // Update the input field display

        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(youtubeRegex);
        
        if (match && match[1]) {
            setFormData(prev => ({ ...prev, youtubeVideoId: match[1] }));
        } else if (url.length === 11 && !url.includes('/')) {
             setFormData(prev => ({ ...prev, youtubeVideoId: url }));
        } else {
             setFormData(prev => ({ ...prev, youtubeVideoId: '' })); // Clear if invalid
        }
    };


    const handleImproveBioWithAI = async () => {
        if (!formData.bio.trim()) {
            setAiError("Por favor, escreva uma biografia antes de usar a IA.");
            return;
        }
        setIsImprovingBio(true);
        setAiError('');
        setShowAiSuggestion(false);
        setSuggestedBio(null);

        try {
            // FIX: Switched to import.meta.env with VITE_ prefix, the correct way for Vite apps.
            const apiKey = import.meta.env.VITE_API_KEY;
            if (!apiKey) {
                setAiError("A chave da API de IA não está configurada. Esta funcionalidade está desabilitada.");
                setIsImprovingBio(false);
                return;
            }
            const ai = new GoogleGenAI({ apiKey });
            const prompt = `
                Você é um especialista em marketing para músicos. Revise e melhore a biografia a seguir para o perfil de um artista em uma plataforma de contratação de shows. 
                O objetivo é tornar o texto mais profissional, cativante e atraente para donos de bares, restaurantes e produtores de eventos.
                Mantenha a essência e as informações originais do artista, mas aprimore a clareza, o impacto e a gramática.
                Não adicione informações que não estão no texto original.
                Responda em português do Brasil.
                Retorne APENAS o texto aprimorado, sem nenhuma introdução, observação ou formatação especial como markdown.

                Texto original:
                "${formData.bio}"
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const improvedBio = response.text.trim();
            setSuggestedBio(improvedBio);
            setShowAiSuggestion(true);

        } catch (error) {
            console.error("Erro ao chamar a API do Gemini:", error);
            setAiError("Ocorreu um erro ao tentar melhorar o texto. Verifique sua chave de API e tente novamente.");
        } finally {
            setIsImprovingBio(false);
        }
    };
    
    const handleAcceptSuggestion = () => {
        if (suggestedBio) {
            setFormData(prev => ({ ...prev, bio: suggestedBio }));
        }
        setShowAiSuggestion(false);
        setSuggestedBio(null);
    };

    const handleDiscardSuggestion = () => {
        setShowAiSuggestion(false);
        setSuggestedBio(null);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        let uploadedImageUrl = formData.imageUrl;
    
        if (profileImageFile) {
            setIsUploading(true);
            const filePath = `artists/${artist.id}/profile.jpg`;
            const publicUrl = await StorageService.uploadFile(profileImageFile, filePath);
            setIsUploading(false);
            if (publicUrl) {
                uploadedImageUrl = publicUrl;
            } else {
                showToast("Erro ao fazer upload da imagem de perfil. Tente novamente.", 'error');
                setIsSaving(false);
                return;
            }
        }
        
        const artistUpdatePayload: Partial<Artist> = {
            name: formData.name,
            phone: formData.phone,
            genre: {
                primary: formData.primaryGenre,
                secondary: formData.secondaryGenres.split(',').map(g => g.trim()).filter(Boolean),
            },
            bio: formData.bio,
            socials: {
                instagram: formData.instagram,
                spotify: formData.spotify,
                facebook: formData.facebook,
            },
            imageUrl: uploadedImageUrl,
            youtubeVideoId: formData.youtubeVideoId,
        };

        try {
            await updateArtistProfile(artistUpdatePayload);
            showToast("Perfil atualizado com sucesso!", 'success');
            navigate('/dashboard');
        } catch (error) {
            showToast("Ocorreu um erro ao salvar. Tente novamente.", 'error');
            console.error("Failed to save profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const FormInput: React.FC<{label: string, name: string, value: string, placeholder?: string}> = ({ label, name, value, placeholder }) => (
         <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <input
                id={name}
                name={name}
                type="text"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="bg-gray-800 shadow-md">
                 <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                         <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                             <i className="fas fa-arrow-left"></i>
                         </Link>
                        <h1 className="text-xl font-bold tracking-wider">Editar Perfil</h1>
                    </div>
                     <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                     </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto bg-gray-800/50 p-8 rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Imagem de Perfil</h2>
                            <p className="text-sm text-gray-400 -mt-2 mb-6">Esta é a imagem principal que aparece no seu card de artista.</p>
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="relative w-32 h-44 shrink-0">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Pré-visualização do perfil" className="w-full h-full object-cover rounded-lg shadow-md bg-gray-900" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-900 rounded-lg flex flex-col items-center justify-center text-center p-2">
                                            <i className="fas fa-image text-4xl text-gray-600"></i>
                                            <span className="text-xs text-gray-500 mt-2">Sem imagem</span>
                                        </div>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                                            <i className="fas fa-spinner fa-spin text-2xl text-white"></i>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="imageUpload" className="cursor-pointer bg-gray-700 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                                        {imagePreview ? 'Trocar Imagem' : 'Escolher Imagem'}
                                    </label>
                                    <input
                                        id="imageUpload"
                                        name="imageUpload"
                                        type="file"
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Use uma imagem vertical (retrato) para melhor resultado. Máx 5MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-2">Informações Públicas</h2>
                            <p className="text-sm text-gray-400 -mt-2 mb-6">Estes dados serão exibidos em sua página de artista.</p>
                            <div className="space-y-6">
                                <FormInput label="Nome do Artista / Banda" name="name" value={formData.name} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">Telefone / WhatsApp</label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="(XX) XXXXX-XXXX"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="primaryGenre" className="block text-sm font-medium text-gray-300 mb-2">Gênero Principal</label>
                                        <input
                                            id="primaryGenre"
                                            name="primaryGenre"
                                            type="text"
                                            value={formData.primaryGenre}
                                            onChange={handleChange}
                                            placeholder="Ex: MPB"
                                            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="secondaryGenres" className="block text-sm font-medium text-gray-300 mb-2">Outros Gêneros (separados por vírgula)</label>
                                    <input
                                        id="secondaryGenres"
                                        name="secondaryGenres"
                                        type="text"
                                        value={formData.secondaryGenres}
                                        onChange={handleChange}
                                        placeholder="Ex: Pop Rock, Samba Rock"
                                        className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-300">Bio / Sobre</label>
                                <button 
                                    type="button"
                                    onClick={handleImproveBioWithAI}
                                    disabled={isImprovingBio || showAiSuggestion}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-wait flex items-center gap-2"
                                >
                                    {isImprovingBio ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            <span>Aprimorando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-magic"></i>
                                            <span>Ajustar com IA</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                readOnly={isImprovingBio || showAiSuggestion}
                                rows={6}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                                placeholder="Conte a sua história, sua trajetória na música..."
                            />
                            {aiError && <p className="text-red-400 text-xs mt-2">{aiError}</p>}
                             {showAiSuggestion && suggestedBio && (
                                <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-red-500/50 animate-fade-in">
                                    <h4 className="text-lg font-semibold text-white mb-3">Sugestão da IA</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h5 className="text-sm font-bold text-gray-400 mb-2">Seu Texto Original</h5>
                                            <div className="text-sm bg-gray-800 p-3 rounded-md whitespace-pre-line h-48 overflow-y-auto text-gray-300">{formData.bio}</div>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-bold text-green-400 mb-2">Texto Aprimorado</h5>
                                            <div className="text-sm bg-gray-800 p-3 rounded-md whitespace-pre-line h-48 overflow-y-auto">{suggestedBio}</div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4 mt-4">
                                        <button type="button" onClick={handleDiscardSuggestion} className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors text-sm">
                                            Descartar
                                        </button>
                                        <button type="button" onClick={handleAcceptSuggestion} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm flex items-center gap-2">
                                            <i className="fas fa-check"></i>
                                            Aceitar Sugestão
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-300 mb-2">Vídeo em Destaque (YouTube)</label>
                            <input
                                id="youtubeUrl"
                                name="youtubeUrl"
                                type="url"
                                value={youtubeUrl}
                                onChange={handleYoutubeChange}
                                placeholder="Cole o link completo do seu vídeo do YouTube"
                                className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Cole o link completo (ex: https://www.youtube.com/watch?v=c2-a_H_a2-Y). O sistema extrairá o ID do vídeo automaticamente.
                            </p>
                        </div>

                        <div className="pt-6 border-t border-gray-700">
                             <h2 className="text-xl font-bold text-white mb-2">Redes Sociais</h2>
                             <p className="text-sm text-gray-400 -mt-2 mb-6">Links para seus perfis. Deixe em branco se não tiver.</p>
                             <div className="space-y-4">
                                <FormInput label="Instagram URL" name="instagram" value={formData.instagram} placeholder="https://instagram.com/seu-usuario" />
                                <FormInput label="Spotify URL" name="spotify" value={formData.spotify} placeholder="https://open.spotify.com/artist/..." />
                                <FormInput label="Facebook URL" name="facebook" value={formData.facebook} placeholder="https://facebook.com/sua-pagina" />
                             </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                            <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors">
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-wait flex items-center gap-2"
                            >
                               {isSaving ? (
                                   <>
                                       <i className="fas fa-spinner fa-spin"></i>
                                       <span>Salvando...</span>
                                   </>
                               ) : (
                                   'Salvar Alterações'
                               )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditProfilePage;
