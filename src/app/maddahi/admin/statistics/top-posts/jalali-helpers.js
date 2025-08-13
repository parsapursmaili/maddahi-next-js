import moment from "jalali-moment";

// این آبجکت، زبان فارسی را به کتابخانه جدید معرفی می‌کند
export const jalaliLocale = {
  code: "fa",
  months: [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ],
  weekdays: [
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنجشنبه",
    "جمعه",
    "شنبه",
  ],
  weekdaysShort: ["ی", "د", "س", "چ", "پ", "ج", "ش"],
  today: "امروز",
  direction: "rtl",
  // این تابع مسئول فرمت‌بندی تاریخ در هدر و ... است
  format: (date, formatStr) => moment(date).locale("fa").format(formatStr),
};

// این تابع، هدر تقویم (مثلا: "مرداد ۱۴۰۴") را به درستی نمایش می‌دهد
export function formatCaption(date, options) {
  return moment(date).locale("fa").format("jMMMM jYYYY");
}
