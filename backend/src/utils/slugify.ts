export default function slugify(text = "") {
    return text
        .toString()
        .normalize("NFKD") // normalize unicode characters
        .replace(/[\u0300-\u036f]/g, "") // remove accents
        .toLowerCase()
        .trim() // remove leading/trailing spaces
        .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, ""); // remove leading/trailing hyphens        
}