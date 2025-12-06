import { memo } from "react";

const TextAnswer = memo(function TextAnswer({ questionId, value, onChoose }) {
  return (
    <div>
      <textarea
        className="w-full min-h-[140px] border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        placeholder="Nhập câu trả lời của bạn..."
        value={value || ""}
        onChange={(e) => onChoose(questionId, e.target.value)}
      />
    </div>
  );
});

export default TextAnswer;
