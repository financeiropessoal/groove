import React, { useState } from 'react';

interface CalendarProps {
    selectedDates: Date[];
    onDateSelect: (date: Date) => void;
    bookedDates?: Date[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDates, onDateSelect, bookedDates = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const renderDays = () => {
        const days = [];
        // Dias em branco antes do início do mês
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-start-${i}`} className="p-2"></div>);
        }

        // Dias do mês
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            date.setHours(0,0,0,0);

            const isSelected = selectedDates.some(d => d.getTime() === date.getTime());
            const isToday = date.getTime() === today.getTime();
            const isPast = date.getTime() < today.getTime();
            const isBooked = bookedDates.some(d => d.getTime() === date.getTime());

            let dayClasses = `p-2 text-center rounded-full flex items-center justify-center w-10 h-10 transition-colors duration-200`;

            if (isPast || isBooked) {
                dayClasses += ' bg-red-900/30 text-gray-500 cursor-not-allowed line-through';
            } else {
                dayClasses += ' cursor-pointer hover:bg-gray-600';
                if(isSelected) {
                    dayClasses += ' bg-red-600 text-white ring-2 ring-offset-2 ring-offset-gray-800 ring-red-500';
                } else if(isToday) {
                    dayClasses += ' bg-red-800 text-white font-bold';
                }
            }
            
            days.push(
                <div key={day} className={dayClasses} onClick={() => !isPast && !isBooked && onDateSelect(date)}>
                    {day}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="bg-gray-900 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="text-white hover:bg-gray-700 p-2 rounded-full w-10 h-10 flex justify-center items-center" aria-label="Mês anterior">
                    <i className="fas fa-chevron-left"></i>
                </button>
                <h3 className="text-lg font-semibold text-white">
                    {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => changeMonth(1)} className="text-white hover:bg-gray-700 p-2 rounded-full w-10 h-10 flex justify-center items-center" aria-label="Próximo mês">
                    <i className="fas fa-chevron-right"></i>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-gray-400 text-sm">
                {daysOfWeek.map(day => <div key={day} className="font-medium">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2 mt-2">
                {renderDays()}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4 pt-4 border-t border-gray-700 text-xs text-gray-400">
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-600 rounded-full"></span>Selecionado</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-800 rounded-full"></span>Hoje</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-900/30 rounded-full"></span>Reservado/Passado</div>
            </div>
        </div>
    );
};

export default Calendar;
