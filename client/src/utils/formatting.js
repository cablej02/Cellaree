export const capitalizeWords = (str) => {
    return str ? str.replace(/\b\w/g, (char) => char.toUpperCase()) : '';
};