import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMusicianAuth } from '../contexts/MusicianAuthContext';
import { useToast } from '../contexts/ToastContext';
import { Musician } from '../types';
import Tooltip from '../components/Tooltip';

const EditMusicianProfilePage: React.FC = () => {
    const { musician, updateMusicianProfile } = useMusicianAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: musician?.name || '',
        instrument: musician?.instrument || '',
        city: musician?.city || '',
        phone: musician?.phone || '',
        bio: musician?.bio || '',
        imageUrl: musician?.imageUrl || '',
        youtubeVideoId: musician?.youtubeVideoId || '',
        styles: musician?.styles?.join(', ') || '',
        instagram: musician?.socials?.instagram || '',
        facebook: musician?.socials?.facebook || '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [youtubeId, setYoutubeId] = useState('');

    if (!musician) {
         return <div className="text-center py-12"><i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i></div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

    const styleTags = useMemo(() => {
        return formData.styles.split(',').map(s => s.trim()).filter(Boolean);
    }, [formData.styles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        const updatePayload: Partial<Musician> = {
            name: formData.name,
            instrument: formData.instrument,
            city: formData.city,
            phone: formData.phone,
            bio: formData.bio,
            imageUrl: formData.imageUrl,
            youtubeVideoId: getYoutubeId(formData.youtubeVideoId),
            styles: formData.styles.split(',').map(s => s.trim()).filter(Boolean),
            socials: {
                instagram: formData.instagram,
                facebook: formData.facebook
            }
        };

        try {
            await updateMusicianProfile(updatePayload);
            showToast("Perfil atualizado com sucesso!", 'success');
            navigate('/musician-dashboard');
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
                        <Link to="/musician-dashboard" className="text-gray-400 hover:text-white transition-colors" aria-label="Voltar ao painel">
                            <i className="fas fa-arrow-left text-2xl"></i>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Editar Perfil de Músico</h1>
                            <p className="text-gray-400">Gerencie seu perfil público para ser encontrado.</p>
                        </div>
                    </div>
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-pink-600 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-500 flex items-center justify-center gap-2">
                        {isSaving ? <><i className="fas fa-spinner fa-spin"></i>Salvando...</> : 'Salvar Alterações'}
                    </button>
                </div>

                <div className="space-y-8">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2"><i className="fas fa-user text-pink-400"></i>Informações Básicas</h2>
                            <Tooltip text="Estes são os primeiros dados que bandas e contratantes verão. Um nome claro e um instrumento bem definido ajudam você a ser encontrado nas buscas.">
                                <i className="fas fa-question-circle text-gray-400 cursor-help"></i>
                            </Tooltip>
                        </div>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Seu Nome</label>
                                <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" required />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Instrumento Principal</label>
                                    <input name="instrument" value={formData.instrument} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Sua Cidade</label>
                                    <input name="city" value={formData.city} onChange={handleChange} placeholder="Ex: São Paulo, SP" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" required />
                                </div>
                            </div>
                        </div>
                    </div>
                     <div className="bg-gray-800 p-6 rounded-lg">
                         <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2"><i className="fas fa-photo-video text-pink-400"></i>Mídia e Apresentação</h2>
                            <Tooltip text="Uma boa imagem e um vídeo de performance são cruciais! É a melhor forma de mostrar seu talento e profissionalismo para quem quer te contratar.">
                                <i className="fas fa-question-circle text-gray-400 cursor-help"></i>
                            </Tooltip>
                        </div>
                         <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Sua Bio</label>
                                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={5} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" placeholder="Fale sobre sua experiência, influências e o que você busca." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">URL da sua foto de perfil</label>
                                <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://..." className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Link ou ID de vídeo do YouTube</label>
                                <div className="flex flex-col sm:flex-row gap-4 items-start">
                                    <input name="youtubeVideoId" value={formData.youtubeVideoId} onChange={handleChange} placeholder="Cole a URL ou ID do vídeo" className="flex-grow w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
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
                            <h2 className="text-xl font-bold flex items-center gap-2"><i className="fas fa-guitar text-pink-400"></i>Estilos e Contato</h2>
                            <Tooltip text="Informe os estilos que você toca para aparecer nas buscas certas. O telefone é opcional, mas ajuda na comunicação direta após o contato inicial.">
                                <i className="fas fa-question-circle text-gray-400 cursor-help"></i>
                            </Tooltip>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Estilos Musicais (separados por vírgula)</label>
                                <input name="styles" value={formData.styles} onChange={handleChange} placeholder="Ex: Forró, Sertanejo, MPB" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                                {styleTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {styleTags.map(tag => (
                                            <span key={tag} className="bg-gray-700 text-gray-200 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Telefone / WhatsApp</label>
                                <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Instagram URL</label>
                                    <input name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/seu_usuario" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Facebook URL</label>
                                    <input name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/sua_pagina" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2.5 px-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditMusicianProfilePage;