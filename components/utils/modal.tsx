'use client';

import React from 'react';
import { Transition } from '@headlessui/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        
        <Transition.Child
          as={React.Fragment}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div
            className="relative bg-white/90 dark:bg-gray-800/90 p-8 rounded-lg shadow-xl border border-gray-200/50 dark:border-gray-700/50 max-w-md w-full backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-700 dark:text-gray-300 text-2xl font-bold hover:text-gray-900 dark:hover:text-white"
            >
              &times;
            </button>
            {children}
          </div>
        </Transition.Child>
      </div>
    </Transition>
  );
};

export default Modal; 