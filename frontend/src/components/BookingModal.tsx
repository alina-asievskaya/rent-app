import React, { useState } from 'react';
import Modal from 'react-modal';
import BookingCalendar from './BookingCalendar';
import FoodSelector from './FoodSelector';
import DecorationSelector from './DecorationSelector';
import type { CreateBookingDto, FoodItem, DecorationItem } from '../types/booking';
import './BookingModal.css';

Modal.setAppElement('#root');

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  houseId: number;
  onBookingSuccess: () => void;
}

type Step = 'calendar' | 'food' | 'decoration' | 'confirm';

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, houseId, onBookingSuccess }) => {
  const [step, setStep] = useState<Step>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedFood, setSelectedFood] = useState<FoodItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = () => {
    setStep('calendar');
    setSelectedDate(null);
    setSelectedFood([]);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleCalendarNext = () => {
    if (selectedDate) {
      setStep('food');
    }
  };

  const handleFoodNext = (items: FoodItem[]) => {
    setSelectedFood(items);
    setStep('decoration');
  };

  const handleFoodSkip = () => {
    setSelectedFood([]);
    setStep('decoration');
  };

  const handleDecorationComplete = (items: DecorationItem[]) => {
    submitBooking(items);
  };

  const handleDecorationSkip = () => {
    submitBooking([]);
  };

  const submitBooking = async (decorations: DecorationItem[]) => {
  if (!selectedDate) return;
  setIsSubmitting(true);
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Необходимо авторизоваться');
    setIsSubmitting(false);
    return;
  }

  const bookingDateUTC = new Date(Date.UTC(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  ));
  const bookingDateString = bookingDateUTC.toISOString().split('T')[0];

  const bookingData: CreateBookingDto = {
    houseId,
    bookingDate: bookingDateString, 
    foodItems: selectedFood,
    decorationItems: decorations,
  };

    try {
      const response = await fetch('http://localhost:5213/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert('Бронирование успешно завершено');
        onBookingSuccess();
        handleClose();
      } else {
        alert(result.message || 'Ошибка при создании бронирования');
      }
    } catch (error) {
      console.error(error);
      alert('Ошибка сети');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className="booking-modal"
      overlayClassName="booking-modal-overlay"
      contentLabel="Бронирование дома"
    >
      <div className="modal-header">
        <h2>Бронирование дома</h2>
        <button onClick={handleClose} className="close-btn">&times;</button>
      </div>

      <div className="modal-body">
        {step === 'calendar' && (
          <div className="calendar-step">
            <BookingCalendar
              houseId={houseId}
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              bookedDates={[]}
            />
            <div className="step-actions">
              <button onClick={handleClose} className="cancel-btn">Отмена</button>
              <button
                onClick={handleCalendarNext}
                className="next-btn"
                disabled={!selectedDate}
              >
                Далее
              </button>
            </div>
          </div>
        )}

        {step === 'food' && (
          <FoodSelector onNext={handleFoodNext} onSkip={handleFoodSkip} />
        )}

        {step === 'decoration' && (
          <DecorationSelector onComplete={handleDecorationComplete} onSkip={handleDecorationSkip} />
        )}
      </div>

      {isSubmitting && <div className="loading-overlay">Отправка...</div>}
    </Modal>
  );
};

export default BookingModal;