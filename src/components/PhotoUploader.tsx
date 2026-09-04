import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";

interface PhotoUploaderProps {
    photoBase64?: string;
    onPhotoChange: (base64: string | undefined) => void;
}

const TARGET = 600;

export function PhotoUploader({ photoBase64, onPhotoChange }: PhotoUploaderProps) {
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const processFile = useCallback(
        (file: File) => {
            if (!file.type.startsWith("image/")) {
                setError("That file is not an image. Use a JPG, PNG or WebP.");
                return;
            }
            setError(null);

            const reader = new FileReader();
            reader.onerror = () => setError("That file could not be read.");
            reader.onload = (event) => {
                const image = new Image();
                image.onerror = () => setError("That image could not be decoded.");
                image.onload = () => {
                    // Square, centre-cropped: the only template that prints a
                    // photo clips it to a circle, so a square source is right.
                    const canvas = document.createElement("canvas");
                    canvas.width = TARGET;
                    canvas.height = TARGET;
                    const context = canvas.getContext("2d");
                    if (!context) {
                        setError("This browser would not give up a canvas to resize the photo.");
                        return;
                    }
                    const scale = Math.max(TARGET / image.width, TARGET / image.height);
                    const width = image.width * scale;
                    const height = image.height * scale;
                    context.drawImage(image, (TARGET - width) / 2, (TARGET - height) / 2, width, height);
                    onPhotoChange(canvas.toDataURL("image/jpeg", 0.85));
                };
                image.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        },
        [onPhotoChange],
    );

    return (
        <div>
            <span className="field-label">Photo</span>

            {photoBase64 ? (
                <div className="flex items-center gap-4">
                    <img src={photoBase64} alt="Your profile photo" className="h-24 w-24 rounded-full border border-rule object-cover" />
                    <div className="space-y-2">
                        <button type="button" className="btn btn-sm" onClick={() => inputRef.current?.click()}>
                            Replace
                        </button>
                        <button type="button" className="btn btn-sm block" onClick={() => onPhotoChange(undefined)}>
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        const file = event.dataTransfer.files[0];
                        if (file) processFile(file);
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onClick={() => inputRef.current?.click()}
                    className="flex w-full flex-col items-center gap-2 border border-dashed px-4 py-7 transition-colors duration-hinge ease-step"
                    style={{ borderColor: dragging ? "var(--division)" : "var(--rule)" }}
                >
                    <Upload size={18} strokeWidth={1.6} className="text-ink-3" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">Drop an image or click</span>
                </button>
            )}

            <p className="mt-2 font-mono text-[10px] leading-relaxed text-ink-3">
                Only Twenty Seconds prints a photo. Cropped square at 600px.
            </p>
            {error && <p className="errata mt-2">{error}</p>}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) processFile(file);
                    event.target.value = "";
                }}
            />
        </div>
    );
}
