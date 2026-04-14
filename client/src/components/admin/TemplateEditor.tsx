
"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from './PlaceholderExtension';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface TemplateEditorProps {
    id: string;
    content: string;
    onChange: (value: string) => void;
    onFocus?: () => void;
    className?: string;
}

export interface TemplateEditorRef {
    insertPlaceholder: (placeholder: string) => void;
}

export const TemplateEditor = forwardRef<TemplateEditorRef, TemplateEditorProps>(({ content, onChange, onFocus, id, className }, ref) => {
    // Helper to convert plain text with {{TAG}} to HTML that Tiptap understands
    const textToHtml = (text: string) => {
        if (!text) return "";
        return text
            .replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, '<span data-placeholder="{{$1}}"></span>')
            .replace(/\n/g, '<br />');
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder,
        ],
        content: textToHtml(content),
        editorProps: {
            attributes: {
                id: id,
                class: `prose prose-sm dark:prose-invert max-w-none min-h-[160px] w-full rounded-2xl border border-border/40 bg-background/50 px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all ${className || ""}`,
            },
            handleDOMEvents: {
                focus: () => {
                   if (onFocus) onFocus();
                   return false;
                }
            }
        },
        onUpdate({ editor }) {
            const plainText = editor.getText({ blockSeparator: "\n" });
            onChange(plainText);
        },
    });

    useImperativeHandle(ref, () => ({
        insertPlaceholder: (placeholder: string) => {
            if (editor) {
                editor.chain().focus().setPlaceholder({ label: placeholder }).run();
            }
        }
    }));

    // Handle external content updates (e.g., when inserting placeholder via button)
    useEffect(() => {
        if (!editor || content === editor.getText({ blockSeparator: "\n" })) return;
        
        // Save current selection to restore it after update
        const { from, to } = editor.state.selection;
        editor.commands.setContent(textToHtml(content));
        // Try to restore selection if it's within bounds
        try {
            editor.commands.setTextSelection({ from, to });
        } catch (e) {}
    }, [content, editor]);

    if (!editor) return null;

    return (
        <div className="w-full">
            <EditorContent editor={editor} />
        </div>
    );
});
