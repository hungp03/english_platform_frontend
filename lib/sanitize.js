"use client";
import DOMPurify from "isomorphic-dompurify";

/** Làm sạch HTML sinh từ Editor (giữ style/width/height/class & align) */
export function sanitizeHtml(html) {
  // Loại class tạm của editor nếu còn sót
  const input = typeof html === "string" ? html.replace(/\bimage-selected\b/g, "") : "";

  const clean = DOMPurify.sanitize(input, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["style", "class", "width", "height", "alt"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  });
  return clean;
}
