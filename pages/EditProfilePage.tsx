import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Artist } from '../data';
import Tooltip from '../components/Tooltip';
import ToggleSwitch from '../components/admin/ToggleSwitch';

const EditProfilePage: React.FC = () => {
    const { artist, updateArtistProfile } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: artist?.name || '',
        primaryGenre: artist?.genre?.primary || '',
        secondaryGenres: artist?.genre?.secondary?.join(', ') || '',
        city: artist?.city || '',
        bio: artist?.bio || '',
        imageUrl: artist?.imageUrl || '',
        youtubeVideoId: artist?.youtubeVideoId || '',
        instagram: artist?.socials?.instagram || '',
        spotify: artist?.socials?.spotify || '',
        facebook: artist?.socials?.facebook || '',
        is_freelancer: artist?.is_freelancer || false,
        freelancer_instruments: artist?.freelancer_instruments?.join(', ') || '',
        freelancer_rate: artist?.freelancer_rate || '',
        freelancer_rate_unit: artist?.freelancer_rate_unit || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [youtubeId, setYoutubeId] = useState('');

    if (!artist) {
        return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const getYoutubeId = (url: string) => {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') return urlObj.pathname.slice(1);
            if (urlObj.hostname.includes('youtube.com')) return urlObj.searchParams.get('v') || '';
        } catch (e) {
            return url;
        }
        return url;
    }

    useEffect(() => {
        setYoutubeId(getYoutubeId(formData.youtubeVideoId));
    }, [formData.youtubeVideoId]);
    
    const genreTags = useMemo(() => {
        return formData.secondaryGenres.split(',').map(s => s.trim()).filter(Boolean);
    }, [formData.secondaryGenres]);
    
    const freelancerInstrumentTags = useMemo(() => {
        return formData.freelancer_instruments.split(',').map(s => s.trim()).filter(Boolean);
    }, [formData.freelancer_instruments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        const updatePayload: Partial<Artist> = {
            name: formData.name,
            genre: {
                primary: formData.primaryGenre,
                secondary: formData.secondaryGenres.split(',').map(s => s.trim()).filter(Boolean)
            },
            city: formData.city,
            bio: formData.bio,
            imageUrl: formData.imageUrl,
            youtubeVideoId: getYoutubeId(formData.youtubeVideoId),
            socials: {
                instagram: formData.instagram,
                spotify: formData.spotify,
                facebook: formData.facebook
            },
            is_freelancer: formData.is_freelancer,
            freelancer_instruments: formData.is_freelancer ? formData.freelancer_instruments.split(',').map(s => s.trim()).filter(Boolean) : [],
            freelancer_rate: formData.is_freelancer ? Number(formData.freelancer_rate) || 0 : 0,
            freelancer_rate_unit: formData.is_freelancer ? formData.freelancer_rate_unit : '',
        };

        try {
            await updateArtistProfile(updatePayload);
            showToast("Perfil atualizado com sucesso!", 'success');
            navigate('/dashboard');
        } catch (error) {
            showToast("Ocorreu um erro ao salvar.", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
             <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                            <i className="fas fa-arrow-left text-2xl"></i>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Editar Perfil da Banda/Artista</h1>
                            <p className="text-gray-400">Gerencie as informações públicas da sua banda.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-gray-600 rounded-lg font-semibold hover:bg-gray-500 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-pink-600 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-500 flex items-center gap-2">
                             {isSaving ? <><i className="fas fa-spinner fa-spin"></i>Salvando...</> : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <i className="fas fa-id-card text-pink-400"></i>
                                Informações da Banda
                            </h2>
                            <Tooltip text="Dados essenciais para que os contratantes encontrem e identifiquem sua banda ou projeto.">
                                <i className="fas fa-question-circle text-gray-400 cursor-help"></i>
                            </Tooltip>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Nome da Banda / Artístico</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 focus:ring-2 focus:ring-pink-500 focus:outline-none" required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Sua Cidade</label>
                                <input name="city" value={formData.city} onChange={handleChange} placeholder="Ex: São Paulo, SP" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 focus:ring-2 focus:ring-pink-500 focus:outline-none" required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Gênero Principal</label>
                                    <input name="primaryGenre" value={formData.primaryGenre} onChange={handleChange} placeholder="Ex: Rock, MPB, Samba" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 focus:ring-2 focus:ring-pink-500 focus:outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Gêneros Secundários (separados por vírgula)</label>
                                    <input name="secondaryGenres" value={formData.secondaryGenres} onChange={handleChange} placeholder="Ex: Indie, Pop Rock, Soul" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                                </div>
                            </div>
                            {genreTags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {genreTags.map(tag => (
                                        <span key={tag} className="bg-gray-700 text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 p-6 rounded-lg">
                         <div className="flex items-center gap-3 mb-4">
                             <h2 className="text-xl font-bold flex items-center gap-2">
                                <i className="fas fa-photo-video text-pink-400"></i>
                                Mídia e Apresentação
                            </h2>
                             <Tooltip text="Sua vitrine! Uma boa foto, um vídeo de performance e uma bio bem escrita são essenciais para chamar a atenção.">
                                <i className="fas fa-question-circle text-gray-400 cursor-help"></i>
                            </Tooltip>
                        </div>
                         <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Sua Bio</label>
                                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={5} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 focus:ring-2 focus:ring-pink-500 focus:outline-none" placeholder="Fale sobre sua história, influências e o que torna seu show especial." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">URL da sua foto de perfil</label>
                                <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Link ou ID de vídeo do YouTube</label>
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    <input name="youtubeVideoId" value={formData.youtubeVideoId} onChange={handleChange} placeholder="Cole a URL ou ID do vídeo" className="flex-grow w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                                    {youtubeId && (
                                        <div className="flex-shrink-0 w-full sm:w-40">
                                            <img src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`} alt="YouTube video preview" className="rounded-lg w-full aspect-video object-cover bg-gray-900"/>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <i className="fas fa-guitar text-pink-400"></i>
                                Perfil Freelancer
                            </h2>
                            <Tooltip text="Ative esta opção se você também está disponível para tocar como músico contratado em outros projetos ou bandas.">
                                <i className="fas fa-question-circle text-gray-400 cursor-help"></i>
                            </Tooltip>
                        </div>
                        <div className="space-y-4">
                             <ToggleSwitch
                                label="Quero atuar como Músico Freelancer"
                                checked={formData.is_freelancer}
                                onChange={e => setFormData(prev => ({ ...prev, is_freelancer: e.target.checked }))}
                            />
                            {formData.is_freelancer && (
                                <div className="space-y-4 pt-4 border-t border-gray-700 animate-fade-in">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Instrumentos/Habilidades (separados por vírgula)</label>
                                        <input name="freelancer_instruments" value={formData.freelancer_instruments} onChange={handleChange} placeholder="Ex: Guitarra base, Vocal de apoio, Sanfona" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                                        {freelancerInstrumentTags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {freelancerInstrumentTags.map(tag => (
                                                    <span key={tag} className="bg-gray-700 text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Seu Valor/Cachê (R$)</label>
                                            <input name="freelancer_rate" type="number" value={formData.freelancer_rate} onChange={handleChange} placeholder="Ex: 200" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Unidade</label>
                                            <input name="freelancer_rate_unit" value={formData.freelancer_rate_unit} onChange={handleChange} placeholder="Ex: por hora, por evento" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                     <div className="bg-gray-800 p-6 rounded-lg">
                         <div className="flex items-center gap-3 mb-4">
                             <h2 className="text-xl font-bold flex items-center gap-2">
                                <i className="fas fa-share-alt text-pink-400"></i>
                                Redes Sociais
                            </h2>
                             <Tooltip text="Facilite para os contratantes te encontrarem fora da plataforma e para a equipe de produção entrar em contato.">
                                <i className="fas fa-question-circle text-gray-400 cursor-help"></i>
                            </Tooltip>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Instagram URL</label>
                                    <input name="instagram" value={formData.instagram} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Spotify URL</label>
                                    <input name="spotify" value={formData.spotify} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Facebook URL</label>
                                    <input name="facebook" value={formData.facebook} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4 focus:ring-2 focus:ring-pink-500 focus:outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditProfilePage;