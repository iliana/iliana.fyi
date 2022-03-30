import { html } from "htm/preact";

export default function SrOnly({ children }) {
  return html`
    <span className="sr-only">${children}</span>
  `;
}
