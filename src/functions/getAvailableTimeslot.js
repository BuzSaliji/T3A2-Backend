

const getAvailableTimeSlots = async (courtId, date) => {
    // Define court operating hours and booking duration (in minutes)
    const operatingHours = { start: '09:00', end: '21:00' };
    const bookingDuration = 60;
  
    // Convert operating hours to minutes
    const startMinutes = parseInt(operatingHours.start.split(':')[0]) * 60 + parseInt(operatingHours.start.split(':')[1]);
    const endMinutes = parseInt(operatingHours.end.split(':')[0]) * 60 + parseInt(operatingHours.end.split(':')[1]);
  
    // Find existing bookings for the court on the given date
    const existingBookings = await Booking.find({
        court: courtId,
        date: { $gte: new Date(date), $lt: new Date(date).setDate(new Date(date).getDate() + 1) }
    });
  
    // Convert booking times to minutes for easier comparison
    const bookedSlots = existingBookings.map(booking => {
        const start = booking.timeSlot.start.getHours() * 60 + booking.timeSlot.start.getMinutes();
        const end = booking.timeSlot.end.getHours() * 60 + booking.timeSlot.end.getMinutes();
        return { start, end };
    });
  
    // Generate all possible time slots for the day
    let availableTimeSlots = [];
    for (let minutes = startMinutes; minutes < endMinutes; minutes += bookingDuration) {
        let isAvailable = true;
  
        // Check if the slot overlaps with any existing bookings
        for (const slot of bookedSlots) {
            if ((minutes >= slot.start && minutes < slot.end) || 
                (minutes + bookingDuration > slot.start && minutes + bookingDuration <= slot.end)) {
                isAvailable = false;
                break;
            }
        }
  
        if (isAvailable) {
            // Convert minutes back to HH:mm format for the available slot
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            availableTimeSlots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
        }
    }
  
    return availableTimeSlots;
  };