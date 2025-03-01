export const capitalizeWords = (str) => {
    return str
        ? str.replace(/\b\w/g, (char, index, text) =>
            index === 0 || text[index - 1] !== "'" ? char.toUpperCase() : char
        )
        : '';
};