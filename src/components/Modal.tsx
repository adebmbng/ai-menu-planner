import { type ReactNode } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ModalProps {
    open: boolean
    title?: string
    onClose: () => void
    children: ReactNode
    maxWidth?: string
}

export function Modal({ open, title, onClose, children, maxWidth = "max-w-lg" }: ModalProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                    onClick={onClose}
                />

                {/* Modal content */}
                <div className={`relative glass-card rounded-2xl shadow-2xl ${maxWidth} w-full mx-4 animate-in zoom-in-95 fade-in duration-200`}>
                    {/* Header */}
                    {title && (
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50">
                            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                            <button
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                onClick={onClose}
                            >
                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className="px-6 py-6">{children}</div>
                </div>
            </div>
        </div>
    )
}
