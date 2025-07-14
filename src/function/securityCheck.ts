import sanitizeHtml from "sanitize-html";

export class SecurityCheck {

    containsHTML(input: string): boolean {
        const clean = sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
        return clean !== input;
    }
}