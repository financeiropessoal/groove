import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Testimonial } from '../data';
import { useToast } from '../contexts/ToastContext';

const EditTestimonialsPage: React.FC = () => {
    const { artist, logout, updateArtistProfile } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [testimonials, setTestimonials] = useState<Testimonial[]>(artist?.testimonials || []);
    const [isSaving, setIsSaving] = useState(false);

    if (!artist) {
        return (
             <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p>Carregando dados do artista...</p>
            </div>
        );
    }
    
    const handleChange = (index: number, field: keyof Testimonial, value: string) => {
       const newTestimonials = [...testimonials];
       newTestimonials[index][field] = value;
       setTestimonials(newTestimonials);
    };

    const addTestimonial = () => {
        setTestimonials([...testimonials, { quote: '', author: '', source: '' }]);
    };
    
    const removeTestimonial = (index: number) => {
        const newTestimonials = testimonials.filter((_, i) => i !== index);
        setTestimonials(newTestimonials);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateArtistProfile({ testimonials });
            showToast("Depoimentos atualizados com sucesso!", 'success');
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to save testimonials:", error);
            showToast("Ocorreu um erro ao salvar os depoimentos. Tente novamente.", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
             <header className="bg-gray-800 shadow-md">
                 <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                         <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-700">
                             <i className="fas fa-arrow-left"></i>
                         </Link>
                        <h1 className="text-xl font-bold tracking-wider">Editar Depoimentos</h1>
                    </div>
                     <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                     </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                 <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-gray-800/50 p-6 rounded-lg relative">
                             <button type="button" onClick={() => removeTestimonial(index)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors" aria-label="Remover Depoimento">
                                <i className="fas fa-trash-alt"></i>
                            </button>
                            <h3 className="text-lg font-bold text-red-400 mb-4">Depoimento #{index + 1}</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Depoimento (Citação)</label>
                                    <textarea value={testimonial.quote} onChange={(e) => handleChange(index, 'quote', e.target.value)} rows={4} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Ex: 'O show foi incrível!'"/>
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Autor</label>
                                        <input type="text" value={testimonial.author} onChange={(e) => handleChange(index, 'author', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Ex: Mariana Costa" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Fonte</label>
                                        <input type="text" value={testimonial.source} onChange={(e) => handleChange(index, 'source', e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Ex: Gerente, Bar do Zé" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button type="button" onClick={addTestimonial} className="w-full border-2 border-dashed border-gray-600 hover:border-red-500 text-gray-400 hover:text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                        <i className="fas fa-plus mr-2"></i>Adicionar Novo Depoimento
                    </button>
                    
                     <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
                        <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-wait flex items-center gap-2">
                            {isSaving ? (<><i className="fas fa-spinner fa-spin"></i><span>Salvando...</span></>) : ('Salvar Depoimentos')}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default EditTestimonialsPage;
