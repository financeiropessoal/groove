import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Calendar from '../components/Calendar'; // Re-using the calendar component
import { useToast } from '../contexts/ToastContext';

const EditCalendarPage: React.FC = () => {
    const { artist, logout, updateArtistProfile } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // The logic is inverted here: we manage booked dates
    const [bookedDates, setBookedDates] = useState<Date[]>(
        artist?.bookedDates?.map(d => new Date(`${d}T00:00:00`)) || []
    );
    const [isSaving, setIsSaving] = useState(false);

    if (!artist) {
        return (
             <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <p>Carregando dados do artista...</p>
            </div>
        );
    }
    
    const handleDateToggle = (date: Date) => {
        setBookedDates(prevDates => {
            if(prevDates.some(d => d.getTime() === date.getTime())) {
                return prevDates.filter(d => d.getTime() !== date.getTime());
            } else {
                return [...prevDates, date];
            }
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        const dateStrings = bookedDates.map(date => date.toISOString().split('T')[0]);
        
        try {
            await updateArtistProfile({ bookedDates: dateStrings });
            showToast("Agenda atualizada com sucesso!", 'success');
            navigate('/dashboard');
        } catch (error) {
            console.error("Failed to save calendar:", error);
            showToast("Ocorreu um erro ao salvar a agenda. Tente novamente.", 'error');
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
                        <h1 className="text-xl font-bold tracking-wider">Editar Agenda</h1>
                    </div>
                     <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Sair</span>
                     </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                 <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                     <div className="bg-gray-800/50 p-6 rounded-lg">
                        <h2 className="text-2xl font-bold text-white mb-2">Gerenciar Disponibilidade</h2>
                        <p className="text-sm text-gray-400 mb-6">Clique em uma data para marcá-la como <span className="font-bold text-red-400">reservada</span>. Contratantes não poderão solicitar estas datas.</p>
                        
                        <Calendar 
                            selectedDates={[]} // Not used for selection here
                            onDateSelect={handleDateToggle}
                            bookedDates={bookedDates}
                        />

                     </div>
                     
                     <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-700">
                        <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-500 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-500 disabled:cursor-wait flex items-center gap-2">
                            {isSaving ? (<><i className="fas fa-spinner fa-spin"></i><span>Salvando...</span></>) : ('Salvar Agenda')}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default EditCalendarPage;
