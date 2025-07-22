"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityCheck = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
class SecurityCheck {
    containsHTML(input) {
        const clean = (0, sanitize_html_1.default)(input, { allowedTags: [], allowedAttributes: {} });
        return clean !== input;
    }
}
exports.SecurityCheck = SecurityCheck;
