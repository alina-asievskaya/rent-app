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
  bookedDates: Date[];
  rentType: 'day' | 'month';
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ 
  houseId, 
  onSelectDate, 
  selectedDate, 
  bookedDates: initialBooked,
  rentType 
}) => {
  const [startDate, setStartDate] = useState<Date | null>(selectedDate);
  const [excludedDates, setExcludedDates] = useState<Date[]>(initialBooked);

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

  const handleChange = (date: Date | null) => {
    setStartDate(date);
    if (date) {
      if (rentType === 'month') {
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() + 29);
        onSelectDate(date, endDate);
      } else {
        onSelectDate(date, null);
      }
    } else {
      onSelectDate(null, null);
    }
  };

  const filterDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;

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
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 29);
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
            <span>Дом сдается помесячно. Выберите начальную дату для бронирования на 30 дней</span>
          </div>
        ) : (
          <div className="calendar-info">
            <i className="fas fa-calendar-day"></i>
            <span>Дом сдается посуточно. Выберите дату для бронирования</span>
          </div>
        )}
      </div>
      
      <DatePicker
        selected={startDate}
        onChange={handleChange}
        inline
        monthsShown={2}
        locale="ru"
        filterDate={filterDate}
        minDate={new Date()}
        dayClassName={getDayClassName}
      />
      
      {rentType === 'month' && startDate && (
        <div className="selected-period-info">
          <i className="fas fa-clock"></i>
          <span>
            Период бронирования: {startDate.toLocaleDateString('ru-RU')} - {
              getEndDateDisplay()?.toLocaleDateString('ru-RU')
            } (30 дней)
          </span>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;