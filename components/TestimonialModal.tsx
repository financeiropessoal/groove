import React from 'react';
import Modal from './Modal';
import { Testimonial } from '../data';

// This component was empty. Providing a basic structure.

interface TestimonialModalProps {
    testimonial: Testimonial | null;
    onClose: () => void;
}

const TestimonialModal: React.FC<TestimonialModalProps> = ({ testimonial, onClose }) => {
    if (!testimonial) return null;
    
    return (
        <Modal onClose={onClose}>
             <div className="bg-gray-800 p-6 rounded-lg text-white max-w-lg">
                <blockquote className="text-lg italic">"{testimonial.quote}"</blockquote>
                <p className="text-right mt-2 text-gray-400">- {testimonial.author}, {testimonial.source}</p>
            </div>
        </Modal>
    );
};

export default TestimonialModal;
