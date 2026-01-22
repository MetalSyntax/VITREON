import React, { useState, useRef, useEffect } from 'react';

interface VoiceNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (audioUrl: string) => void;
}

export const VoiceNoteModal: React.FC<VoiceNoteModalProps> = ({ isOpen, onClose, onSave }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isOpen) {
            stopRecording();
        }
    }, [isOpen]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    onSave(reader.result as string);
                };
                reader.readAsDataURL(blob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);
            timerRef.current = window.setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Failed to start recording", err);
            alert("Microphone access denied or not available.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel text-white rounded-[40px] w-full max-w-sm shadow-2xl p-8 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center mb-6">
                    <span className={`material-symbols-rounded text-4xl ${isRecording ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`}>mic</span>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">{isRecording ? 'Recording...' : 'Voice Note'}</h3>
                <div className="text-4xl font-mono mb-10 tracking-widest">{formatTime(duration)}</div>

                <div className="flex gap-6 w-full">
                    {!isRecording ? (
                        <>
                            <button onClick={onClose} className="flex-1 py-4 rounded-3xl glass-panel bg-white/5 font-bold uppercase tracking-widest text-slate-400 transition-all">Cancel</button>
                            <button onClick={startRecording} className="flex-1 py-4 rounded-3xl bg-indigo-500 text-white font-bold uppercase tracking-widest shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">Start</button>
                        </>
                    ) : (
                        <button onClick={stopRecording} className="w-full py-4 rounded-3xl bg-red-500 text-white font-bold uppercase tracking-widest shadow-xl shadow-red-500/20 active:scale-95 transition-all">Stop & Save</button>
                    )}
                </div>
            </div>
        </div>
    );
};
