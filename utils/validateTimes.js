function toMinutes(time) {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
}
function validateTimes(start, end, breakStart, breakEnd) {
    const s = toMinutes(start);
    const e = toMinutes(end);
    const bs = toMinutes(breakStart);
    const be = toMinutes(breakEnd);

    if (!(s < bs && bs < be && be < e)) {
        return "Time order must be: startTime < breakStartTime < breakEndTime < endTime";
    }
    if (s >= e) {
        return "startTime must be earlier than endTime";
    }
    if (e - s < 60) {
        return "Shift duration must be at least 1 hour";
    }
    return null;
};
module.exports = validateTimes
