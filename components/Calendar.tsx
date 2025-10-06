import React, { useState } from 'react';

interface CalendarProps {
  selectedDates: Date[];
  onDateSelect: (date: Date) => void;
  bookedDates?: Date[];
  selectedDay?: Date | null;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDates, onDateSelect, bookedDates = [], selectedDay }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  const isBooked = (date: Date) => bookedDates.some(bookedDate => isSameDay(date, bookedDate));
  const isSelected = (date: Date) => selectedDates.some(selectedDate => isSameDay(date, selectedDate));

  const changeMonth = (amount: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button onClick={() => changeMonth(-1)} className="text-gray-400 hover:text-white">&lt;</button>
      <h3 className="font-bold text-lg">{currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h3>
      <button onClick={() => changeMonth(1)} className="text-gray-400 hover:text-white">&gt;</button>
    </div>
  );

  const renderDays = () => (
    <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-400">
      {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => <div key={index}>{day}</div>)}
    </div>
  );

  const renderCells = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    
    const cells = [];
    let day = startDate;

    while (day <= monthEnd || day.getDay() !== 0) {
      const date = new Date(day);
      const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
      const isToday = isSameDay(date, new Date());
      const isPast = date < new Date() && !isToday;
      const isCurrentlySelected = selectedDay ? isSameDay(date, selectedDay) : false;

      let classes = 'w-10 h-10 flex items-center justify-center rounded-full transition-colors';
      if (isCurrentlySelected) {
          classes += ' ring-2 ring-offset-2 ring-offset-gray-800 ring-pink-500';
      }
      
      if (!isCurrentMonth) {
        classes += ' text-gray-600';
      } else if (isBooked(date)) {
        classes += ' bg-pink-500/50 border border-pink-500 text-white font-bold cursor-pointer';
      } else if (isSelected(date)) {
        classes += ' bg-pink-500 text-white font-bold';
      } else if (isPast) {
        classes += ' text-gray-600 cursor-not-allowed';
      } else {
        classes += ' hover:bg-gray-700 cursor-pointer';
        if (isToday) classes += ' border-2 border-pink-500';
      }
      
      cells.push(
        <div key={day.toString()} className={classes} onClick={() => isCurrentMonth && !isPast && onDateSelect(date)}>
          {date.getDate()}
        </div>
      );
      day.setDate(day.getDate() + 1);
       if (cells.length > 42) break; // Safety break
    }

    return <div className="grid grid-cols-7 gap-1 mt-2">{cells}</div>;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default Calendar;