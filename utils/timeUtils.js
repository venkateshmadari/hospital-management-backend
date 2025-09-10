function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours + minutes / 60;
}

function formatTime(decimal) {
  const hours = Math.floor(decimal);
  const minutes = (decimal - hours) * 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}

function generateSlots(startTime, endTime, breakStartTime, breakEndTime) {
  let slots = [];
  let current = parseTime(startTime);
  const end = parseTime(endTime);
  const breakStart = parseTime(breakStartTime);
  const breakEnd = parseTime(breakEndTime);

  while (current < end) {
    const next = current + 0.5;
    if (!(current >= breakStart && next <= breakEnd)) {
      slots.push(`${formatTime(current)} - ${formatTime(next)}`);
    }
    current = next;
  }
  return slots;
}

module.exports = {
  parseTime,
  formatTime,
  generateSlots,
};
