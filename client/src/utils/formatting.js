export const capitalizeWords = (str) => {
    return str
        ? str.replace(/\b\w/g, (char, index, text) =>
            index === 0 || text[index - 1] !== "'" ? char.toUpperCase() : char
        )
        : '';
};

// remove special characters and convert to lowercase
export const normalizeText = (text) => {
    return text.normalizeText("NFD") // decompose accented characters
        .replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "") // remove non-alphanumeric characters
}