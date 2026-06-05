import type { PropsWithChildren } from 'react';
import { Button } from './Button';

interface ModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function Modal({ title, description, onConfirm, onCancel }: PropsWithChildren<ModalProps>) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">{title}</h2>
        <p>{description}</p>
        <div className="modal__actions">
          <Button tone="ghost" onClick={onCancel}>Cancel</Button>
          <Button tone="danger" onClick={onConfirm}>Reset</Button>
        </div>
      </div>
    </div>
  );
}
