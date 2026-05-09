import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { ru } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import './BookingCalendar.css';

registerLocale('ru', ru);

interface BookingCalendarProps {
  houseId: number;
  onSelectDate: (date: Date) => void;
  selectedDate: Date | null;
  bookedDates: Date[];
}


const BookingCalendar: React.FC<BookingCalendarProps> = ({ houseId, onSelectDate, selectedDate, bookedDates: initialBooked }) => {
  const [startDate, setStartDate] = useState<Date | null>(selectedDate);
  const [excludedDates, setExcludedDates] = useState<Date[]>(initialBooked);

  useEffect(() => {
    fetch(`http://localhost:5213/api/bookings/house/${houseId}/booked-dates`)
      .then(res => res.json())
      .then(data => {
        if (data.bookedDates) {
          const dates = data.bookedDates.map((d: string) => new Date(d));
          setExcludedDates(dates);
        }
      })
      .catch(console.error);
  }, [houseId]);

  const handleChange = (date: Date | null) => {
    setStartDate(date);
    if (date) {
      onSelectDate(date);
    }
  };

 const filterDate = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return false;
  

  const dateUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return !excludedDates.some(d => {
    const dUTC = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
    return dUTC === dateUTC;
  });
};

  useEffect(() => {
  fetch(`http://localhost:5213/api/bookings/house/${houseId}/booked-dates`)
    .then(res => res.json())
    .then(data => {
      if (data.bookedDates) {
        const dates = data.bookedDates.map((d: string) => {
          const [year, month, day] = d.split('-').map(Number);
          return new Date(Date.UTC(year, month - 1, day));
        });
        setExcludedDates(dates);
      }
    })
    .catch(console.error);
}, [houseId]);



  return (
    <div className="booking-calendar">
      <DatePicker
        selected={startDate}
        onChange={handleChange}
        inline
        monthsShown={2}
        locale="ru"
        filterDate={filterDate}
        minDate={new Date()}
        dayClassName={date => {
          if (excludedDates.some(d => d.toDateString() === date.toDateString())) {
            return 'booked-day';
          }
          return '';
        }}
      />
    </div>
  );
};

export default BookingCalendar;