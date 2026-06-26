import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import './BookingCalendar.css';

registerLocale('ru', ru);

interface BookingCalendarProps {
  houseId: number;
  onSelectDate: (date: Date | null, endDate?: Date | null) => void;
  selectedDate: Date | null;
  selectedEndDate?: Date | null; 
  bookedDates: Date[];
  rentType: 'day' | 'month';
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  houseId, 
  onSelectDate, 
  selectedDate, 
  selectedEndDate,
  bookedDates: initialBooked,
  rentType 
}) => {
  const [startDate, setStartDate] = useState<Date | null>(selectedDate);
  const [endDate, setEndDate] = useState<Date | null>(selectedEndDate || null);
  const [excludedDates, setExcludedDates] = useState<Date[]>(initialBooked);

  // Вычисляем завтрашнюю дату (с 00:00:00)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  useEffect(() => {
    fetch(`http://localhost:5213/api/bookings/house/${houseId}/booked-dates`)
      .then(res => res.json())
      .then(data => {
        if (data.bookedDates) {
          const dates = data.bookedDates.map((d: string) => {
            const [year, month, day] = d.split('-').map(Number);
            return new Date(year, month - 1, day);
          });
          setExcludedDates(dates);
        }
      })
      .catch(console.error);
  }, [houseId]);

  const handleRangeChange = (update: [Date | null, Date | null]) => {
    const [start, end] = update;
    setStartDate(start);
    setEndDate(end);
    onSelectDate(start, end);
  };

  const handleSingleChange = (date: Date | null) => {
    setStartDate(date);
    setEndDate(null);
    if (date) {
      const autoEnd = new Date(date);
      autoEnd.setDate(autoEnd.getDate() + 29);
      setEndDate(autoEnd);
      onSelectDate(date, autoEnd);
    } else {
      onSelectDate(null, null);
    }
  };

  const filterDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date <= today) return false;

    const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const isBooked = excludedDates.some(d => {
      const dUTC = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
      return dUTC === dateUTC;
    });
    if (isBooked) return false;
    
    if (rentType === 'month') {
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(date);
        checkDate.setDate(checkDate.getDate() + i);
        const checkDateUTC = Date.UTC(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate());
        const isDateBooked = excludedDates.some(d => {
          const dUTC = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
          return dUTC === checkDateUTC;
        });
        if (isDateBooked) return false;
      }
    }
    return true;
  };

  const getDayClassName = (date: Date) => {
    let classes = '';
    if (excludedDates.some(d => d.toDateString() === date.toDateString())) {
      classes += 'booked-day';
    }
    if (rentType === 'day' && startDate && endDate) {
      const dateTime = date.getTime();
      const startTime = startDate.getTime();
      const endTime = endDate.getTime();
      if (dateTime >= startTime && dateTime <= endTime) {
        classes += ' selected-range';
      }
    }
    if (rentType === 'month' && startDate) {
      const dateTime = date.getTime();
      const startTime = startDate.getTime();
      const endTime = startTime + (29 * 24 * 60 * 60 * 1000);
      if (dateTime >= startTime && dateTime <= endTime) {
        classes += ' selected-range';
      }
    }
    return classes.trim();
  };

  const getEndDateDisplay = () => {
    if (rentType === 'month' && startDate) {
      const end = new Date(startDate);
      end.setDate(end.getDate() + 29);
      return end;
    }
    if (rentType === 'day' && endDate) {
      return endDate;
    }
    return null;
  };

  return (
    <div className="booking-calendar">
      <div className="calendar-type-info">
        {rentType === 'month' ? (
          <div className="calendar-info">
            <i className="fas fa-calendar-week"></i>
            <span>Дом сдается помесячно. Выберите начальную дату (бронируется 30 дней)</span>
          </div>
        ) : (
          <div className="calendar-info">
            <i className="fas fa-calendar-day"></i>
            <span>Дом сдается посуточно. Выберите даты заезда и выезда</span>
          </div>
        )}
      </div>
      
      {rentType === 'day' ? (
        <DatePicker
          selected={startDate}
          onChange={handleRangeChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange={true}
          inline
          monthsShown={2}
          locale="ru"
          filterDate={filterDate}
          minDate={tomorrow}  // изменено: минимальная дата - завтра
          dayClassName={getDayClassName}
        />
      ) : (
        <DatePicker
          selected={startDate}
          onChange={handleSingleChange}
          inline
          monthsShown={2}
          locale="ru"
          filterDate={filterDate}
          minDate={tomorrow}  // изменено: минимальная дата - завтра
          dayClassName={getDayClassName}
        />
      )}
      
      {startDate && getEndDateDisplay() && (
        <div className="selected-period-info">
          <i className="fas fa-clock"></i>
          <span>
            Период: {startDate.toLocaleDateString('ru-RU')} – {getEndDateDisplay()?.toLocaleDateString('ru-RU')}
            {rentType === 'month' && ' (30 дней)'}
            {rentType === 'day' && endDate && ` (${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000*60*60*24)) + 1} дней)`}
          </span>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;