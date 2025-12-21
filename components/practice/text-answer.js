import { memo, useRef, useEffect } from "react";

const TextAnswer = memo(function TextAnswer({ questionId, value, onChoose }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.max(140, textareaRef.current.scrollHeight) + "px";
    }
  }, [value]);

  return (
    <div>
      <textarea
        ref={textareaRef}
        className="w-full min-h-[140px] border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary resize-none overflow-hidden"
        placeholder="Nhập câu trả lời của bạn..."
        value={value || ""}
        onChange={(e) => onChoose(questionId, e.target.value)}
      />
    </div>
  );
});

export default TextAnswer;
