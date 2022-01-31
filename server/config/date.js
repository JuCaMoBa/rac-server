const dateOb = new Date();

// current date
// adjust 0 before single digit date
const date = `0${dateOb.getDate()}`.slice(-2);

// current month
const month = `0${dateOb.getMonth() + 1}`.slice(-2);

// current year
const year = dateOb.getFullYear();

// current hours
const hours = dateOb.getHours();

// current minutes
const minutes = dateOb.getMinutes();

// current seconds
const seconds = dateOb.getSeconds();

// prints date & time in YYYY-MM-DD HH:MM:SS format
const fullDate = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
module.exports = fullDate;
