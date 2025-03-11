export const capitalizeWords = (str) => {
    return str
        ? str.replace(/\b\w/g, (char, index, text) =>
            index === 0 || text[index - 1] !== "'" ? char.toUpperCase() : char
        )
        : '';
};

// remove special characters and convert to lowercase
export const normalizeText = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, "");