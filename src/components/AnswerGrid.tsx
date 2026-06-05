import type { QuestionOption } from '../game/types';

interface AnswerGridProps {
  options: QuestionOption[];
  disabled?: boolean;
  selectedOptionId?: string | null;
  correctOptionId?: string | null;
  onSelect?: (optionId: string) => void;
}

export function AnswerGrid({ options, disabled = false, selectedOptionId = null, correctOptionId = null, onSelect }: AnswerGridProps) {
  return (
    <div className="answer-grid">
      {options.map((option) => {
        const isCorrect = option.id === correctOptionId;
        const isSelected = option.id === selectedOptionId;
        const isHangul = /[\u3131-\u318E\uAC00-\uD7A3]/.test(option.label);
        const isShort = option.label.length <= 2;
        const isMedium = option.label.length <= 4;
        const classes = [
          'answer-card',
          isHangul ? 'answer-card--hangul' : 'answer-card--latin',
          isShort ? 'answer-card--short' : isMedium ? 'answer-card--medium' : 'answer-card--long',
          isCorrect ? 'answer-card--correct' : '',
          isSelected && !isCorrect ? 'answer-card--wrong' : '',
          disabled ? 'answer-card--disabled' : ''
        ].filter(Boolean).join(' ');

        return (
          <button
            key={option.id}
            type="button"
            className={classes}
            disabled={disabled}
            onClick={() => onSelect?.(option.id)}
          >
            <span className="answer-card__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
