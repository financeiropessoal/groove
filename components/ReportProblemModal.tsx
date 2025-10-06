import React from 'react';
import Modal from './Modal';

interface ReportProblemModalProps {
  onClose: () => void;
}

const ReportProblemModal: React.FC<ReportProblemModalProps> = ({ onClose }) => {
  return (
    <Modal onClose={onClose}>
      <div className="bg-gray-800 p-6 rounded-lg text-white">
        <h2>Reportar Problema</h2>
      </div>
    </Modal>
  );
};

export default ReportProblemModal;
