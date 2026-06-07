import React, { useRef, useState, useEffect } from 'react';
import { useI18n } from '../../services/i18n';

interface DrawingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dataUrl: string) => void;
}

export const DrawingModal: React.FC<DrawingModalProps> = ({ isOpen, onClose, onSave }) => {
    const { t } = useI18n();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const ctx = canvas.getContext('2d');
            if(ctx) {
                ctx.strokeStyle = '#000'; // Could be themed
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
            }
        }
    }, [isOpen]);

    const startDrawing = (e: any) => {
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        setIsDrawing(true);
        const { offsetX, offsetY } = getCoordinates(e);
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
    };

    const draw = (e: any) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const { offsetX, offsetY } = getCoordinates(e);
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const getCoordinates = (e: any) => {
        if (e.touches && e.touches[0]) {
            const rect = canvasRef.current!.getBoundingClientRect();
            return {
                offsetX: e.touches[0].clientX - rect.left,
                offsetY: e.touches[0].clientY - rect.top
            };
        }
        return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
    };

    const handleSave = () => {
        if (canvasRef.current) {
            onSave(canvasRef.current.toDataURL());
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col h-[70vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">{t('sketch')}</h3>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="text-slate-500 font-medium px-3">{t('cancel')}</button>
                        <button onClick={handleSave} className="bg-indigo-500 text-white px-4 py-1.5 rounded-lg font-medium">{t('done')}</button>
                    </div>
                </div>
                <div className="flex-1 bg-white relative touch-none">
                    <canvas 
                        ref={canvasRef}
                        className="w-full h-full cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={() => setIsDrawing(false)}
                        onMouseLeave={() => setIsDrawing(false)}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={() => setIsDrawing(false)}
                    />
                </div>
            </div>
        </div>
    );
};