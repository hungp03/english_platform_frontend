import { memo } from "react";

const MCQOptions = memo(function MCQOptions({ question, selectedAnswer, onChoose }) {
  return (
    <div className="space-y-3">
      {(question.options || [])
        .slice()
        .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
        .map((op) => {
          const checked = selectedAnswer === op.id;
          return (
            <label
              key={op.id}
              className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-all ${
                checked
                  ? "border-primary bg-primary/5 ring-2 ring-primary"
                  : "hover:bg-muted/50 hover:border-muted-foreground/30"
              }`}
            >
              <input
                type="radio"
                name={`q-${question.id}`}
                checked={checked}
                onChange={() => onChoose(question.id, op.id)}
                className="w-4 h-4 mt-1"
              />
              <span className="text-sm flex-1">{op.content}</span>
            </label>
          );
        })}
    </div>
  );
});

export default MCQOptions;
