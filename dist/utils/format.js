"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTracking = formatTracking;
function formatTracking(date, num) {
    // format date parts
    const dd = date.getDate().toString().padStart(2, "0");
    const mm = (date.getMonth() + 1).toString().padStart(2, "0");
    const yy = date.getFullYear().toString().slice(-2);
    // pad number to at least 4 digits, but don’t cut off if it's longer
    const formattedNum = num.toString().padStart(4, "0");
    return `VIN${dd}${mm}${yy}-${formattedNum}`;
}
