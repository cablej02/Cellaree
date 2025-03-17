// remove special characters and convert to lowercase
export const normalizeText = (text) => {
    return text.normalize("NFD") // decompose accented characters
        .replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "") // remove non-alphanumeric characters
};