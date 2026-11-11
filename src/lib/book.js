//TODO : later move to database

export const BOOK_TITLE = "AI for Students";
export const BOOK_PRICE_INR = 699; 
export const BOOK_OFFER_PRICE_INR = 320;
export const BOOK_SAVE_PERCENT = Math.round((1 - BOOK_OFFER_PRICE_INR / BOOK_PRICE_INR) * 100);

export const formatOrderNo = (n) => `AIK-${n}`;