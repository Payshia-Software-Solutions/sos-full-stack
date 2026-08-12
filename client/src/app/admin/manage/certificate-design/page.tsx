"use client";

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Move, Image as ImageIcon, Eye, Plus, Trash2, AlignLeft, AlignCenter, AlignRight, Type, Check, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getParentCourses } from '@/lib/actions/courses';
import { getCertificateTemplate, saveCertificateTemplate } from '@/lib/actions/certificates';

// Type definitions for drag-and-drop template elements
export interface CertificateElement {
    id: string;
    type: 'title' | 'paragraph' | 'course_name' | 'student_name' | 'sentence' | 'qr_code' | 'info_block' | 'company_br';
    content: string;
    x: number; // percentage (0 - 100)
    y: number; // percentage (0 - 100)
    fontSize: number; // in pixels (scaled down in preview)
    fontWeight: 'normal' | 'semibold' | 'bold' | 'black';
    color: string;
    align: 'left' | 'center' | 'right';
    width?: number;
    fontFamily?: string;
}

const DEFAULT_BACKGROUNDS = [
    { name: "English Course Standard", url: "https://content-provider.pharmacollege.lk/certificates/certificate-bg-english-free-v1.png" },
    { name: "Pharma Course Standard", url: "https://content-provider.pharmacollege.lk/certificates/certificate-bg-standard.png" },
    { name: "Workshop General", url: "https://content-provider.pharmacollege.lk/certificates/certificate-bg-workshop.png" }
];

export default function CertificateDesignPage() {
    const queryClient = useQueryClient();
    
    const [selectedCourseCode, setSelectedCourseCode] = useState<string>('');
    const [templateName, setTemplateName] = useState<string>('');
    const [isActive, setIsActive] = useState<boolean>(true);
    const [backImage, setBackImage] = useState<string>('');
    const [orientation, setOrientation] = useState<'Landscape' | 'Portrait'>('Landscape');
    const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
    const [elements, setElements] = useState<CertificateElement[]>([]);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
    const [zoom, setZoom] = useState<number>(1.0);

    // Bounding container ref for calculating drag positions
    const canvasRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef<{
        elementId: string;
        startX: number;
        startY: number;
        initialX: number;
        initialY: number;
    } | null>(null);

    // Fetch courses
    const { data: courses, isLoading: isLoadingCourses } = useQuery({
        queryKey: ['parentCourses'],
        queryFn: getParentCourses,
    });

    // Fetch template for selected course
    const { data: templateResponse, isLoading: isLoadingTemplate, refetch: refetchTemplate } = useQuery({
        queryKey: ['certificateTemplate', selectedCourseCode],
        queryFn: () => getCertificateTemplate(selectedCourseCode),
        enabled: !!selectedCourseCode,
    });

    const handleCourseChange = (courseCode: string) => {
        setSelectedCourseCode(courseCode);
    };

    const saveMutation = useMutation({
        mutationFn: saveCertificateTemplate,
        onSuccess: (data) => {
            if (data.success) {
                toast({ title: 'Success', description: 'Certificate template saved successfully!' });
                queryClient.invalidateQueries({ queryKey: ['certificateTemplate', selectedCourseCode] });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: data.error || 'Failed to save template.' });
            }
        },
        onError: (err: any) => {
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'An error occurred while saving.' });
        }
    });

    // Populate editor when course template is loaded
    useEffect(() => {
        if (templateResponse?.success && templateResponse.template) {
            const t = templateResponse.template;
            setTemplateName(t.template_name || '');
            setIsActive(Number(t.is_active) === 1);
            setBackImage(t.back_image || '');
            setOrientation((t.orientation as 'Landscape' | 'Portrait') || 'Landscape');
            
            // Try loading dynamic elements from template_json
            if (t.template_json) {
                try {
                    const parsed = JSON.parse(t.template_json);
                    setElements(parsed.elements || []);
                    setPageSize(parsed.pageSize || 'A4');
                } catch (e) {
                    // Fallback to legacy fields converted into elements
                    loadLegacyElements(t);
                }
            } else {
                loadLegacyElements(t);
            }
            setSelectedElementId(null);
        } else {
            // Default template initialization
            setTemplateName('');
            setIsActive(true);
            setBackImage(DEFAULT_BACKGROUNDS[0].url);
            setOrientation('Landscape');
            setPageSize('A4');
            loadDefaultElements();
            setSelectedElementId(null);
        }
    }, [templateResponse]);

    // Keydown listeners for arrow key navigation (nudging), delete element, and duplicate (Ctrl+D)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedElementId) return;
            
            const activeEl = document.activeElement;
            if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
                return;
            }

            const step = e.shiftKey ? 5 : 1;

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setElements(prev => prev.map(item => 
                    item.id === selectedElementId ? { ...item, y: Math.max(0, item.y - step) } : item
                ));
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setElements(prev => prev.map(item => 
                    item.id === selectedElementId ? { ...item, y: Math.min(100, item.y + step) } : item
                ));
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setElements(prev => prev.map(item => 
                    item.id === selectedElementId ? { ...item, x: Math.max(0, item.x - step) } : item
                ));
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setElements(prev => prev.map(item => 
                    item.id === selectedElementId ? { ...item, x: Math.min(100, item.x + step) } : item
                ));
            } else if ((e.key === 'd' || e.key === 'D') && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleDuplicateElement(selectedElementId);
            } else if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                removeElement(selectedElementId);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElementId, elements]);

    const loadLegacyElements = (t: any) => {
        const legacy: CertificateElement[] = [
            {
                id: 'student-name',
                type: 'student_name',
                content: 'JOHN SMITH',
                x: Number(t.left_margin) || 50,
                y: Number(t.top_to_name) / 10 || 45,
                fontSize: 48,
                fontWeight: 'bold',
                color: '#111827',
                align: 'center'
            },
            {
                id: 'qr-code',
                type: 'qr_code',
                content: '[QR Code Verification]',
                x: Number(t.left_to_qr) || 80,
                y: Number(t.top_to_qr) / 10 || 75,
                fontSize: 15, // width in percentage
                fontWeight: 'normal',
                color: '#000000',
                align: 'center'
            },
            {
                id: 'info-block',
                type: 'info_block',
                content: "Certificate ID - CPC-12345\nIssued Date - August 12, 2026\nStudent Number - 2026-001",
                x: Number(t.left_to_date) || 80,
                y: Number(t.top_to_date) / 10 || 85,
                fontSize: 12,
                fontWeight: 'normal',
                color: '#6b7280',
                align: 'left'
            }
        ];
        setElements(legacy);
    };

    const loadDefaultElements = () => {
        setElements([
            {
                id: 'title',
                type: 'title',
                content: 'CERTIFICATE OF COMPLETION',
                x: 50,
                y: 20,
                fontSize: 32,
                fontWeight: 'bold',
                color: '#374151',
                align: 'center'
            },
            {
                id: 'p-awarded',
                type: 'paragraph',
                content: 'This certificate is awarded to',
                x: 50,
                y: 35,
                fontSize: 18,
                fontWeight: 'normal',
                color: '#4b5563',
                align: 'center'
            },
            {
                id: 'student-name',
                type: 'student_name',
                content: '{{STUDENT_NAME}}',
                x: 50,
                y: 45,
                fontSize: 48,
                fontWeight: 'bold',
                color: '#111827',
                align: 'center'
            },
            {
                id: 'sentence',
                type: 'sentence',
                content: 'in recognition of the successful completion and dedication to the course',
                x: 50,
                y: 56,
                fontSize: 16,
                fontWeight: 'normal',
                color: '#4b5563',
                align: 'center'
            },
            {
                id: 'course-name',
                type: 'course_name',
                content: '{{COURSE_NAME}}',
                x: 50,
                y: 65,
                fontSize: 24,
                fontWeight: 'bold',
                color: '#0f172a',
                align: 'center'
            },
            {
                id: 'qr-code',
                type: 'qr_code',
                content: '[QR Code]',
                x: 82,
                y: 75,
                fontSize: 14, // width percentage
                fontWeight: 'normal',
                color: '#000000',
                align: 'center'
            },
            {
                id: 'info-block',
                type: 'info_block',
                content: "Certificate ID - {{CERTIFICATE_ID}}\nIssued Date - {{ISSUED_DATE}}\nStudent Number - {{STUDENT_ID}}",
                x: 15,
                y: 82,
                fontSize: 12,
                fontWeight: 'normal',
                color: '#6b7280',
                align: 'left'
            },
            {
                id: 'company-br',
                type: 'company_br',
                content: 'Company Reg No: PV00253555',
                x: 82,
                y: 92,
                fontSize: 10,
                fontWeight: 'normal',
                color: '#9ca3af',
                align: 'right'
            }
        ]);
    };

    const addElement = (type: CertificateElement['type']) => {
        const id = `${type}-${Date.now()}`;
        let defaultContent = '';
        let fontSize = 16;
        let fontWeight: CertificateElement['fontWeight'] = 'normal';
        let color = '#374151';

        switch (type) {
            case 'title':
                defaultContent = 'CERTIFICATE TITLE';
                fontSize = 28;
                fontWeight = 'bold';
                break;
            case 'paragraph':
                defaultContent = 'Custom Paragraph Text';
                fontSize = 16;
                break;
            case 'course_name':
                defaultContent = '{{COURSE_NAME}}';
                fontSize = 24;
                fontWeight = 'bold';
                break;
            case 'student_name':
                defaultContent = '{{STUDENT_NAME}}';
                fontSize = 44;
                fontWeight = 'bold';
                break;
            case 'sentence':
                defaultContent = 'in recognition of the successful completion of the course';
                fontSize = 14;
                break;
            case 'qr_code':
                defaultContent = '[QR Code]';
                fontSize = 12; // width percentage
                break;
            case 'info_block':
                defaultContent = "Certificate ID - {{CERTIFICATE_ID}}\nIssued Date - {{ISSUED_DATE}}\nStudent Number - {{STUDENT_ID}}";
                fontSize = 11;
                color = '#6b7280';
                break;
            case 'company_br':
                defaultContent = 'PV00253555';
                fontSize = 10;
                color = '#9ca3af';
                break;
        }

        const newEl: CertificateElement = {
            id,
            type,
            content: defaultContent,
            x: 50,
            y: 50,
            fontSize,
            fontWeight,
            color,
            align: 'center'
        };

        setElements([...elements, newEl]);
        setSelectedElementId(id);
    };

    const removeElement = (id: string) => {
        setElements(elements.filter(el => el.id !== id));
        if (selectedElementId === id) setSelectedElementId(null);
        setSelectedElementIds(prev => prev.filter(item => item !== id));
    };

    const handleDuplicateElement = (id: string) => {
        const source = elements.find(el => el.id === id);
        if (!source) return;
        
        const newElement: CertificateElement = {
            ...source,
            id: `el_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            x: Math.min(95, source.x + 4),
            y: Math.min(95, source.y + 4),
            content: source.content + " (Copy)"
        };
        
        setElements(prev => [...prev, newElement]);
        setSelectedElementId(newElement.id);
        toast({ title: 'Element Duplicated', description: 'Created a copy of the selected element.' });
    };

    const updateSelectedElement = (updates: Partial<CertificateElement>) => {
        setElements(elements.map(el => {
            if (el.id === selectedElementId) {
                return { ...el, ...updates };
            }
            return el;
        }));
    };

    const handleBgSelect = (url: string) => {
        setBackImage(url);
    };

    // Drag-and-drop Mouse Handlers
    const handleElementMouseDown = (e: React.MouseEvent, element: CertificateElement) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedElementId(element.id);
        
        if (e.shiftKey) {
            setSelectedElementIds(prev => 
                prev.includes(element.id) ? prev.filter(id => id !== element.id) : [...prev, element.id]
            );
        } else {
            setSelectedElementIds(prev => 
                prev.includes(element.id) ? prev : [element.id]
            );
        }

        if (!canvasRef.current) return;

        draggingRef.current = {
            elementId: element.id,
            startX: e.clientX,
            startY: e.clientY,
            initialX: element.x,
            initialY: element.y
        };

        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
        const dragInfo = draggingRef.current;
        if (!dragInfo || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        
        const deltaX = e.clientX - dragInfo.startX;
        const deltaY = e.clientY - dragInfo.startY;

        const pctDeltaX = (deltaX / rect.width) * 100;
        const pctDeltaY = (deltaY / rect.height) * 100;

        let newX = Math.round((dragInfo.initialX + pctDeltaX) * 10) / 10;
        let newY = Math.round((dragInfo.initialY + pctDeltaY) * 10) / 10;

        // Clamp inside canvas (0-100)
        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));

        setElements(prev => prev.map(el => {
            if (el.id === dragInfo.elementId) {
                return { ...el, x: newX, y: newY };
            }
            return el;
        }));
    };

    const handleGlobalMouseUp = () => {
        draggingRef.current = null;
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
    };

    const handleResizeMouseDown = (e: React.MouseEvent, el: CertificateElement) => {
        e.stopPropagation();
        e.preventDefault();
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const canvasRect = canvas.getBoundingClientRect();
        const startWidth = el.width || 90;
        const startMouseX = e.clientX;
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startMouseX;
            const deltaPct = (deltaX / canvasRect.width) * 100;
            
            let newWidth = startWidth;
            if (el.align === 'center') {
                newWidth = Math.min(100, Math.max(10, startWidth + deltaPct * 2));
            } else if (el.align === 'right') {
                newWidth = Math.min(100, Math.max(10, startWidth - deltaPct));
            } else {
                newWidth = Math.min(100, Math.max(10, startWidth + deltaPct));
            }
            
            setElements(prev => prev.map(item => 
                item.id === el.id ? { ...item, width: Math.round(newWidth) } : item
            ));
        };
        
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleBulkAlign = (type: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-v' | 'distribute-h' | 'canvas-center-x' | 'canvas-center-y') => {
        if (selectedElementIds.length <= 1) return;
        
        const refEl = elements.find(e => e.id === selectedElementIds[0]);
        if (!refEl) return;
        
        if (type === 'canvas-center-x') {
            setElements(prev => prev.map(item => 
                selectedElementIds.includes(item.id) ? { ...item, x: 50 } : item
            ));
            toast({ title: 'Canvas Align', description: 'Selected elements centered horizontally on canvas.' });
        } else if (type === 'canvas-center-y') {
            setElements(prev => prev.map(item => 
                selectedElementIds.includes(item.id) ? { ...item, y: 50 } : item
            ));
            toast({ title: 'Canvas Align', description: 'Selected elements centered vertically on canvas.' });
        } else if (type === 'top') {
            const sorted = [...elements].filter(e => selectedElementIds.includes(e.id)).sort((a, b) => a.y - b.y);
            const topY = sorted[0].y;
            setElements(prev => prev.map(item => 
                selectedElementIds.includes(item.id) ? { ...item, y: topY } : item
            ));
            toast({ title: 'Align Top', description: 'Selected elements aligned to the top-most element.' });
        } else if (type === 'bottom') {
            const sorted = [...elements].filter(e => selectedElementIds.includes(e.id)).sort((a, b) => b.y - a.y);
            const bottomY = sorted[0].y;
            setElements(prev => prev.map(item => 
                selectedElementIds.includes(item.id) ? { ...item, y: bottomY } : item
            ));
            toast({ title: 'Align Bottom', description: 'Selected elements aligned to the bottom-most element.' });
        } else if (type === 'middle') {
            const selected = elements.filter(e => selectedElementIds.includes(e.id));
            const avgY = selected.reduce((sum, e) => sum + e.y, 0) / selected.length;
            setElements(prev => prev.map(item => 
                selectedElementIds.includes(item.id) ? { ...item, y: avgY } : item
            ));
            toast({ title: 'Align Middle', description: 'Selected elements aligned to vertical center.' });
        } else if (type === 'left') {
            const sorted = [...elements].filter(e => selectedElementIds.includes(e.id)).sort((a, b) => a.x - b.x);
            const leftX = sorted[0].x;
            setElements(prev => prev.map(item => 
                selectedElementIds.includes(item.id) ? { ...item, x: leftX } : item
            ));
            toast({ title: 'Align Left', description: 'Selected elements aligned to the left-most element.' });
        } else if (type === 'right') {
            const sorted = [...elements].filter(e => selectedElementIds.includes(e.id)).sort((a, b) => b.x - a.x);
            const rightX = sorted[0].x;
            setElements(prev => prev.map(item => 
                selectedElementIds.includes(item.id) ? { ...item, x: rightX } : item
            ));
            toast({ title: 'Align Right', description: 'Selected elements aligned to the right-most element.' });
        } else if (type === 'center') {
            const selected = elements.filter(e => selectedElementIds.includes(e.id));
            const avgX = selected.reduce((sum, e) => sum + e.x, 0) / selected.length;
            setElements(prev => prev.map(item => 
                selectedElementIds.includes(item.id) ? { ...item, x: avgX } : item
            ));
            toast({ title: 'Align Center', description: 'Selected elements aligned to horizontal center.' });
        } else if (type === 'distribute-v') {
            const selected = elements.filter(e => selectedElementIds.includes(e.id)).sort((a, b) => a.y - b.y);
            if (selected.length < 3) {
                toast({ title: 'Distribute', description: 'Select at least 3 elements to distribute.', variant: 'destructive' });
                return;
            }
            const minY = selected[0].y;
            const maxY = selected[selected.length - 1].y;
            const step = (maxY - minY) / (selected.length - 1);
            
            setElements(prev => prev.map(item => {
                const index = selected.findIndex(e => e.id === item.id);
                if (index !== -1) {
                    return { ...item, y: minY + index * step };
                }
                return item;
            }));
            toast({ title: 'Distribute Vertically', description: 'Selected elements distributed evenly vertically.' });
        } else if (type === 'distribute-h') {
            const selected = elements.filter(e => selectedElementIds.includes(e.id)).sort((a, b) => a.x - b.x);
            if (selected.length < 3) {
                toast({ title: 'Distribute', description: 'Select at least 3 elements to distribute.', variant: 'destructive' });
                return;
            }
            const minX = selected[0].x;
            const maxX = selected[selected.length - 1].x;
            const step = (maxX - minX) / (selected.length - 1);
            
            setElements(prev => prev.map(item => {
                const index = selected.findIndex(e => e.id === item.id);
                if (index !== -1) {
                    return { ...item, x: minX + index * step };
                }
                return item;
            }));
            toast({ title: 'Distribute Horizontally', description: 'Selected elements distributed evenly horizontally.' });
        }
    };

    const handleBulkTextAlign = (align: 'left' | 'center' | 'right') => {
        if (selectedElementIds.length <= 1) return;
        setElements(prev => prev.map(item => 
            selectedElementIds.includes(item.id) ? { ...item, align } : item
        ));
        toast({ title: 'Text Alignment', description: `Set typography alignment to ${align} for all selected elements.` });
    };

    const handleBulkStyleMatch = () => {
        if (selectedElementIds.length <= 1) return;
        const refEl = elements.find(e => e.id === selectedElementIds[0]);
        if (!refEl) return;
        
        setElements(prev => prev.map(item => 
            selectedElementIds.includes(item.id) 
                ? { 
                    ...item, 
                    fontSize: refEl.fontSize, 
                    fontWeight: refEl.fontWeight, 
                    fontFamily: refEl.fontFamily || 'Inter', 
                    color: refEl.color 
                  } 
                : item
        ));
        toast({ title: 'Bulk Style Match', description: 'Applied font styles across all selected elements.' });
    };

    const handleSave = () => {
        if (!selectedCourseCode) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a course first.' });
            return;
        }

        // Sync legacy columns for backward compatibility
        const nameEl = elements.find(el => el.type === 'student_name');
        const qrEl = elements.find(el => el.type === 'qr_code');
        const infoEl = elements.find(el => el.type === 'info_block');

        const left_margin = nameEl ? Math.round(nameEl.x) : 20;
        const top_to_name = nameEl ? Math.round(nameEl.y * 10) : 500;
        
        // Find left_to_date and top_to_date from info block (or fallback to student name)
        const left_to_date = infoEl ? Math.round(infoEl.x) : 50;
        const top_to_date = infoEl ? Math.round(infoEl.y * 10) : 800;

        const left_to_qr = qrEl ? Math.round(qrEl.x) : 80;
        const top_to_qr = qrEl ? Math.round(qrEl.y * 10) : 800;
        const qr_width = qrEl ? Math.round(qrEl.fontSize) : 15; // qr width uses fontSize as legacy width

        const payload = {
            course_code: selectedCourseCode,
            template_name: templateName || `Template for ${selectedCourseCode}`,
            left_margin,
            top_to_name,
            left_to_date,
            top_to_date,
            left_to_qr,
            top_to_qr,
            qr_width,
            is_active: isActive ? 1 : 0,
            back_image: backImage,
            orientation: orientation,
            template_json: {
                pageSize,
                orientation,
                elements
            }
        };

        saveMutation.mutate(payload);
    };

    const selectedElement = elements.find(el => el.id === selectedElementId);

    if (!selectedCourseCode) {
        return (
            <div className="p-4 md:p-8 space-y-6 pb-20 bg-[#0c0d0e] text-white min-h-[80vh] flex flex-col justify-center items-center border border-gray-800 rounded-2xl shadow-2xl">
                {/* Dynamic Google Fonts Link */}
                <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400..900&family=Great+Vibes&family=Inter:wght@300..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Montserrat:wght@300..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
                <div className="max-w-md w-full space-y-6 text-center">
                    <header className="space-y-2">
                        <div className="text-4xl justify-center flex mb-2">🎨</div>
                        <h1 className="text-3xl font-headline font-bold text-white tracking-tight">
                            Certificate Studio
                        </h1>
                        <p className="text-gray-400 text-sm">Choose a course template to begin visual vector layout design.</p>
                    </header>
                    <Card className="border-gray-800 bg-gray-900 shadow-xl text-white">
                        <CardHeader className="text-left pb-3">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Project Workspace</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isLoadingCourses ? (
                                <div className="flex items-center justify-center gap-2 py-4 text-gray-400 text-sm">
                                    <Loader2 className="animate-spin h-5 w-5 text-primary"/> Loading project courses...
                                </div>
                            ) : (
                                <Select value={selectedCourseCode} onValueChange={handleCourseChange}>
                                    <SelectTrigger className="w-full bg-gray-950 border-gray-850 text-white focus:ring-primary h-10">
                                        <SelectValue placeholder="Select a course..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                        {courses?.map((course: any) => (
                                            <SelectItem key={course.id} value={course.course_code} className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">
                                                {course.course_name} ({course.course_code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const selectedCourse = courses?.find(c => c.course_code === selectedCourseCode);
    const selectedCourseName = selectedCourse ? selectedCourse.course_name : 'English Language Development Program';

    return (
        <div className="flex flex-col w-full h-[calc(100vh-80px)] md:h-[calc(100vh-8px)] min-h-[600px] bg-[#0e0f11] text-gray-200 border border-gray-850 rounded-2xl rounded-b-none overflow-hidden shadow-2xl font-sans -mb-4 md:-mb-8">
            {/* Dynamic Google Fonts Link */}
            <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400..900&family=Great+Vibes&family=Inter:wght@300..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Montserrat:wght@300..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />

            {/* Photoshop/Word Top Action Bar */}
            <div className="h-14 bg-gray-900/95 border-b border-gray-800 flex items-center justify-between px-4 gap-4 flex-shrink-0">
                {/* Brand & Project Selector */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white tracking-wider flex items-center gap-1.5 mr-2">
                        <span className="text-primary">🎨</span> Studio
                    </span>
                    <Select value={selectedCourseCode} onValueChange={handleCourseChange}>
                        <SelectTrigger className="w-56 h-8 bg-gray-950 border-gray-800 text-xs text-white font-medium">
                            <SelectValue placeholder="Select course..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800 text-white text-xs">
                            {courses?.map((course: any) => (
                                <SelectItem key={course.id} value={course.course_code} className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer">
                                    {course.course_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Quick Selection Typography Settings (Like Photoshop Option Bar / MS Word Ribbon) */}
                {selectedElement && selectedElement.type !== 'qr_code' ? (
                    <div className="hidden lg:flex items-center gap-3.5 border-l border-gray-800 pl-4 flex-1 justify-start">
                        {/* Font Family */}
                        <div className="flex items-center gap-1.5">
                            <Select 
                                value={selectedElement.fontFamily || 'Inter'} 
                                onValueChange={(val: any) => updateSelectedElement({ fontFamily: val })}
                            >
                                <SelectTrigger className="w-36 h-8 bg-gray-950 border-gray-800 text-xs text-white font-mono">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                    <SelectItem value="Inter">Inter</SelectItem>
                                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                                    <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                                    <SelectItem value="Cinzel">Cinzel</SelectItem>
                                    <SelectItem value="Lora">Lora</SelectItem>
                                    <SelectItem value="Great Vibes">Great Vibes</SelectItem>
                                    <SelectItem value="Alex Brush">Alex Brush</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {/* Font size quick input */}
                        <div className="flex items-center border border-gray-800 rounded bg-gray-950 h-8 px-1">
                            <span className="text-[10px] text-gray-500 px-1 font-mono">Size</span>
                            <input 
                                type="number"
                                value={selectedElement.fontSize}
                                onChange={(e) => updateSelectedElement({ fontSize: Math.max(5, parseInt(e.target.value) || 12) })}
                                className="w-10 bg-transparent text-xs text-white border-none focus:outline-none text-center font-mono font-semibold"
                            />
                            <span className="text-[10px] text-gray-500 pr-1">px</span>
                        </div>
                        
                        {/* Alignment Toggles */}
                        <div className="flex border border-gray-800 rounded overflow-hidden bg-gray-950 h-8">
                            <Button 
                                variant={selectedElement.align === 'left' ? "default" : "ghost"}
                                size="icon" 
                                className="h-full w-8 rounded-none border-none text-gray-400 hover:text-white"
                                onClick={() => updateSelectedElement({ align: 'left' })}
                                title="Align Text Left"
                            >
                                <AlignLeft className="h-3.5 w-3.5"/>
                            </Button>
                            <Button 
                                variant={selectedElement.align === 'center' ? "default" : "ghost"}
                                size="icon" 
                                className="h-full w-8 rounded-none border-none text-gray-400 hover:text-white"
                                onClick={() => updateSelectedElement({ align: 'center' })}
                                title="Align Text Center"
                            >
                                <AlignCenter className="h-3.5 w-3.5"/>
                            </Button>
                            <Button 
                                variant={selectedElement.align === 'right' ? "default" : "ghost"}
                                size="icon" 
                                className="h-full w-8 rounded-none border-none text-gray-400 hover:text-white"
                                onClick={() => updateSelectedElement({ align: 'right' })}
                                title="Align Text Right"
                            >
                                <AlignRight className="h-3.5 w-3.5"/>
                            </Button>
                        </div>

                        {/* Font Weight */}
                        <Select 
                            value={selectedElement.fontWeight} 
                            onValueChange={(val: any) => updateSelectedElement({ fontWeight: val })}
                        >
                            <SelectTrigger className="w-24 h-8 bg-gray-950 border-gray-800 text-xs text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="semibold">Semibold</SelectItem>
                                <SelectItem value="bold">Bold</SelectItem>
                                <SelectItem value="black">Black</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        {/* Color Swatch */}
                        <div className="flex items-center gap-1.5 bg-gray-950 border border-gray-800 h-8 px-2 rounded">
                            <input 
                                type="color" 
                                value={selectedElement.color}
                                onChange={(e) => updateSelectedElement({ color: e.target.value })}
                                className="w-4 h-4 p-0 cursor-pointer bg-transparent border-none"
                            />
                            <span className="text-[10px] font-mono text-gray-300">{selectedElement.color.toUpperCase()}</span>
                        </div>
                    </div>
                ) : (
                    <div className="hidden lg:flex items-center text-xs text-gray-500 font-sans italic flex-1 justify-start">
                        Select a canvas element to edit typography, alignments, and widths in real-time.
                    </div>
                )}

                {/* Actions & Buttons */}
                <div className="flex gap-2 items-center">
                    {/* Top Toolbar Zoom Controls */}
                    <div className="flex items-center gap-1.5 bg-gray-950 border border-gray-850 rounded-md px-1.5 h-8 mr-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-gray-400 hover:text-white border-none"
                            onClick={() => setZoom(prev => Math.max(0.5, Math.round((prev - 0.1) * 10) / 10))}
                            disabled={zoom <= 0.5}
                            title="Zoom Out"
                        >
                            -
                        </Button>
                        <span className="text-[11px] font-mono font-bold text-white min-w-[32px] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-gray-400 hover:text-white border-none"
                            onClick={() => setZoom(prev => Math.min(2.0, Math.round((prev + 0.1) * 10) / 10))}
                            disabled={zoom >= 2.0}
                            title="Zoom In"
                        >
                            +
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-[9px] text-gray-500 hover:text-white py-0.5 px-1 h-auto font-sans font-medium"
                            onClick={() => setZoom(1.0)}
                        >
                            Reset
                        </Button>
                    </div>

                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(`/print/certificate/preview?course_code=${selectedCourseCode}`, '_blank')}
                        className="h-8 text-xs border-gray-850 hover:bg-gray-800 text-gray-200"
                    >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5"/> Preview print
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => refetchTemplate()}
                        className="h-8 text-xs border-gray-850 hover:bg-gray-850 text-gray-300"
                    >
                        Reset
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={saveMutation.isPending} 
                        size="sm"
                        className="h-8 text-xs bg-primary hover:bg-primary-hover text-white font-semibold"
                    >
                        {saveMutation.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin"/> : <Save className="mr-1.5 h-3.5 w-3.5"/>}
                        Save Template
                    </Button>
                </div>
            </div>

            {/* Photoshop Three-Pane Studio Layout */}
            <div className="flex flex-1 overflow-hidden h-[calc(100%-56px)]">
                {/* 1. LEFT PANEL: Layers, Preset Library & Page Sizing (280px) */}
                <div className="w-72 bg-gray-950 border-r border-gray-850 flex flex-col h-full flex-shrink-0 overflow-y-auto p-4 space-y-5">
                    {/* Presets & Elements Adder */}
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Canvas Library Elements</Label>
                        <div className="grid grid-cols-2 gap-1.5">
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('title')}>
                                <Plus className="h-3 w-3 mr-1"/> Title
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('paragraph')}>
                                <Plus className="h-3 w-3 mr-1"/> Paragraph
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('student_name')}>
                                <Plus className="h-3 w-3 mr-1"/> Student Name
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('course_name')}>
                                <Plus className="h-3 w-3 mr-1"/> Course Name
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('sentence')}>
                                <Plus className="h-3 w-3 mr-1"/> Sentence
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('qr_code')}>
                                <Plus className="h-3 w-3 mr-1"/> QR Code
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('info_block')}>
                                <Plus className="h-3 w-3 mr-1"/> Info Block
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('company_br')}>
                                <Plus className="h-3 w-3 mr-1"/> Company BR
                            </Button>
                        </div>
                    </div>

                    {/* Layers Panel */}
                    <div className="space-y-2 border-t border-gray-850 pt-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Placed Layers</Label>
                            <span className="text-[9px] font-mono bg-gray-800 px-1 py-0.5 rounded text-gray-400">
                                {elements.length} Total
                            </span>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1 bg-gray-950 border border-gray-850 rounded p-1.5">
                            {elements.map(el => {
                                const isSelected = selectedElementId === el.id;
                                const isMultiSelected = selectedElementIds.includes(el.id);
                                return (
                                    <div 
                                        key={el.id}
                                        className={`flex justify-between items-center px-2 py-1 rounded text-xs cursor-pointer border transition-colors ${
                                            isSelected 
                                                ? 'bg-primary/20 border-primary text-white font-semibold' 
                                                : isMultiSelected
                                                    ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
                                                    : 'hover:bg-gray-900 border-transparent text-gray-400 hover:text-gray-200'
                                        }`}
                                        onClick={(e) => {
                                            if (e.shiftKey) {
                                                setSelectedElementIds(prev => 
                                                    prev.includes(el.id) ? prev.filter(id => id !== el.id) : [...prev, el.id]
                                                );
                                            } else {
                                                setSelectedElementId(el.id);
                                                setSelectedElementIds(prev => prev.includes(el.id) ? prev : [el.id]);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-2 truncate flex-1">
                                            <input 
                                                type="checkbox" 
                                                checked={isMultiSelected}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedElementIds(prev => 
                                                        prev.includes(el.id) ? prev.filter(id => id !== el.id) : [...prev, el.id]
                                                    );
                                                }}
                                                className="h-3 w-3 accent-primary cursor-pointer rounded"
                                            />
                                            <span className="capitalize truncate font-mono text-[10px] flex items-center">
                                                <Type className="h-3 w-3 mr-1 text-gray-500"/> {el.type.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-5 w-5 text-gray-500 hover:text-destructive hover:bg-destructive/10" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeElement(el.id);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3"/>
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Page & Canvas Setup */}
                    <div className="space-y-4 border-t border-gray-850 pt-4 flex-1">
                        <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Page Configurations</Label>
                        
                        <div className="space-y-1.5">
                            <Label htmlFor="templateName" className="text-xs text-gray-400">Template Title</Label>
                            <Input 
                                id="templateName" 
                                value={templateName} 
                                onChange={(e) => setTemplateName(e.target.value)}
                                className="h-8 bg-gray-900 border-gray-850 text-xs text-white focus:ring-1 focus:ring-primary"
                                placeholder="Template Title..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label htmlFor="pageSize" className="text-[10px] text-gray-400">Paper Sizing</Label>
                                <Select value={pageSize} onValueChange={(val: any) => setPageSize(val)}>
                                    <SelectTrigger id="pageSize" className="h-7 bg-gray-900 border-gray-850 text-[11px] text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                        <SelectItem value="A4">A4 Sheet</SelectItem>
                                        <SelectItem value="Letter">Letter Size</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="orientation" className="text-[10px] text-gray-400">Orientation</Label>
                                <Select value={orientation} onValueChange={(val: any) => setOrientation(val)}>
                                    <SelectTrigger id="orientation" className="h-7 bg-gray-900 border-gray-850 text-[11px] text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                        <SelectItem value="Landscape">Landscape</SelectItem>
                                        <SelectItem value="Portrait">Portrait</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="backImage" className="text-xs text-gray-400 font-sans">Background Asset</Label>
                            <Input 
                                id="backImage" 
                                value={backImage} 
                                onChange={(e) => setBackImage(e.target.value)}
                                className="h-8 bg-gray-900 border-gray-850 text-xs text-white font-mono"
                                placeholder="Background image URL..."
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-[10px] text-gray-400">Ceylon Preset Backgrounds</Label>
                            <div className="flex flex-col gap-1.5">
                                {DEFAULT_BACKGROUNDS.map((bg) => (
                                    <button
                                        key={bg.name}
                                        onClick={() => handleBgSelect(bg.url)}
                                        className={`px-2 py-1 text-left rounded text-[10px] truncate border transition-colors ${
                                            backImage === bg.url 
                                                ? 'bg-primary/20 border-primary text-white font-semibold' 
                                                : 'bg-gray-900 hover:bg-gray-850 border-gray-850 text-gray-400'
                                        }`}
                                    >
                                        {bg.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-850 pt-3 mt-3">
                            <Label htmlFor="isActive" className="text-xs text-gray-400 font-medium">Activate Layout</Label>
                            <Switch 
                                id="isActive"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                            />
                        </div>
                    </div>
                </div>

                {/* 2. CENTER PANEL: Scrollable Vector Viewport */}
                <div className="flex-1 bg-[#121316] overflow-hidden flex flex-col items-center justify-start relative p-4 select-none">
                    {/* Canvas Scroll wrapper */}
                    <div className="w-full h-full overflow-auto flex justify-center items-center p-8 py-20">
                        {isLoadingTemplate ? (
                            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2"/>
                                <p className="text-sm">Loading Visual Canvas...</p>
                            </div>
                        ) : (
                            <div className="flex-shrink-0 transition-transform duration-100 ease-out py-8 px-12" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
                                {/* Drag Bounding Box representing A4 sheet */}
                                <div 
                                    ref={canvasRef}
                                    className={`relative border border-white/10 bg-white text-black shadow-[0_20px_50px_rgba(0,0,0,0.8)] select-none overflow-hidden ${
                                        orientation === 'Landscape' 
                                            ? 'w-[800px] aspect-[297/210]' 
                                            : 'w-[560px] aspect-[210/297]'
                                    }`}
                                    style={{
                                        backgroundImage: backImage ? `url('${backImage}')` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundColor: '#fafafa'
                                    }}
                                >
                                    {/* Grid background guide */}
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:3%_3%] opacity-25 pointer-events-none"/>

                                    {/* Placed Elements */}
                                    {elements.map(el => {
                                        const isSelected = selectedElementId === el.id;
                                        const isMultiSelected = selectedElementIds.includes(el.id);
                                        
                                        // Preview replacement text
                                        let displayText = el.content;
                                        if (displayText) {
                                            displayText = displayText
                                                .replace(/{{STUDENT_NAME}}/g, 'JOHN SMITH')
                                                .replace(/\[Student Name\]/g, 'JOHN SMITH')
                                                .replace(/{{COURSE_NAME}}/g, selectedCourseName)
                                                .replace(/\[Course Name\]/g, selectedCourseName)
                                                .replace(/{{CERTIFICATE_ID}}/g, 'CPC-108745')
                                                .replace(/\[Certificate ID\]/g, 'CPC-108745')
                                                .replace(/{{STUDENT_ID}}/g, '2026-0034')
                                                .replace(/\[Student ID\]/g, '2026-0034')
                                                .replace(/{{ISSUED_DATE}}/g, 'August 12, 2026')
                                                .replace(/\[Issued Date\]/g, 'August 12, 2026')
                                                .replace(/{{BATCH}}/g, 'EN-26')
                                                .replace(/\[Batch\]/g, 'EN-26');
                                        }

                                        if (el.type === 'qr_code') {
                                            return (
                                                <div
                                                    key={el.id}
                                                    className={`absolute cursor-move transform -translate-x-1/2 -translate-y-1/2 transition-[outline] duration-150 p-1 flex items-center justify-center bg-white/70 border rounded ${
                                                        isSelected 
                                                            ? 'outline-2 outline outline-primary outline-offset-1 z-30' 
                                                            : isMultiSelected
                                                                ? 'outline-2 outline outline-yellow-500 outline-offset-1 z-20'
                                                                : 'outline-none hover:bg-black/5 hover:border-black/20'
                                                    }`}
                                                    style={{
                                                        left: `${el.x}%`,
                                                        top: `${el.y}%`,
                                                        width: `${el.fontSize}%`,
                                                        aspectRatio: '1/1'
                                                    }}
                                                    onMouseDown={(e) => handleElementMouseDown(e, el)}
                                                >
                                                    <div className="bg-gray-200 border border-gray-400 w-full h-full flex flex-col items-center justify-center font-mono text-[9px] text-gray-700">
                                                        <span>QR Code</span>
                                                    </div>
                                                    {isSelected && (
                                                        <div 
                                                            className="absolute -top-7 left-0 bg-gray-900 border border-gray-700 text-white rounded shadow-lg flex items-center divide-x divide-gray-850 z-50 overflow-hidden h-6 select-none" 
                                                            onMouseDown={e => e.stopPropagation()}
                                                        >
                                                            <div className="flex items-center px-1.5 gap-1 text-[8px] font-mono text-gray-400">
                                                                <Move className="h-2 w-2"/> Move
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleDuplicateElement(el.id)}
                                                                className="px-1.5 py-0.5 text-[8px] hover:bg-gray-800 flex items-center gap-1 transition-colors text-blue-400 hover:text-blue-300 border-l border-gray-800"
                                                                title="Duplicate Element (Ctrl+D)"
                                                            >
                                                                Copy
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => removeElement(el.id)}
                                                                className="px-1.5 py-0.5 text-[8px] hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors border-l border-gray-800"
                                                                title="Delete Element"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }

                                        // CSS font weights mapping
                                        const weightClass = 
                                            el.fontWeight === 'black' ? 'font-black' :
                                            el.fontWeight === 'bold' ? 'font-bold' :
                                            el.fontWeight === 'semibold' ? 'font-semibold' : 'font-normal';

                                        return (
                                            <div
                                                key={el.id}
                                                className={`absolute cursor-move transform -translate-x-1/2 -translate-y-1/2 p-1 select-none transition-[outline] duration-150 rounded ${
                                                    isSelected 
                                                        ? 'bg-primary/5 border border-dashed border-primary outline-2 outline outline-primary outline-offset-1 z-30' 
                                                        : isMultiSelected
                                                            ? 'bg-yellow-500/5 border border-dashed border-yellow-500 outline-2 outline outline-yellow-500 outline-offset-1 z-20'
                                                            : 'border border-transparent hover:bg-black/[0.02] hover:border-gray-300'
                                                }`}
                                                style={{
                                                    left: `${el.x}%`,
                                                    top: `${el.y}%`,
                                                    textAlign: el.align,
                                                    width: `${el.width || 90}%`,
                                                    maxWidth: '100%'
                                                }}
                                                onMouseDown={(e) => handleElementMouseDown(e, el)}
                                            >
                                                <div 
                                                    className={weightClass}
                                                    style={{
                                                        fontSize: `${el.fontSize * 0.71}px`, // scaled relative to A4 print template layout
                                                        fontFamily: el.fontFamily || 'Inter',
                                                        color: el.color,
                                                        whiteSpace: 'pre-wrap',
                                                        lineHeight: 1.2
                                                    }}
                                                >
                                                    {displayText}
                                                </div>
                                                {isSelected && (
                                                    <>
                                                        <div 
                                                            className="absolute -top-7 left-0 bg-gray-900 border border-gray-700 text-white rounded shadow-lg flex items-center divide-x divide-gray-850 z-50 overflow-hidden h-6 select-none" 
                                                            onMouseDown={e => e.stopPropagation()}
                                                        >
                                                            <div className="flex items-center px-1.5 gap-1 text-[8px] font-mono text-gray-400">
                                                                <Move className="h-2 w-2"/> Move
                                                            </div>
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleDuplicateElement(el.id)}
                                                                className="px-1.5 py-0.5 text-[8px] hover:bg-gray-800 flex items-center gap-1 transition-colors text-blue-400 hover:text-blue-300 border-l border-gray-800"
                                                                title="Duplicate Element (Ctrl+D)"
                                                            >
                                                                Copy
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => removeElement(el.id)}
                                                                className="px-1.5 py-0.5 text-[8px] hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors border-l border-gray-800"
                                                                title="Delete Element"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                        <div 
                                                            className="absolute right-0 top-0 bottom-0 w-2.5 cursor-col-resize bg-primary/20 hover:bg-primary/50 border-r border-primary flex items-center justify-center rounded-r z-40"
                                                            onMouseDown={(e) => handleResizeMouseDown(e, el)}
                                                            title="Drag right edge to change width"
                                                        >
                                                            <div className="h-3.5 w-[1px] bg-primary" />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. RIGHT PANEL: Property Inspector & Alignment Controls (320px) */}
                <div className="w-80 bg-gray-950 border-l border-gray-850 flex flex-col h-full flex-shrink-0 overflow-y-auto p-4 space-y-4">
                    {selectedElementIds.length > 1 ? (
                        /* Bulk Selection Card */
                        <div className="space-y-4">
                            <h3 className="text-xs uppercase font-bold text-yellow-500 tracking-wider flex items-center gap-1.5">
                                ⚡ Bulk Inspector
                            </h3>
                            <Card className="border-gray-800 bg-gray-900/60 text-white">
                                <CardContent className="p-3.5 space-y-4">
                                    <div className="text-xs text-gray-400">
                                        <span className="font-bold text-white font-mono text-sm mr-1">{selectedElementIds.length}</span> 
                                        elements currently selected.
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <Label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block border-b border-gray-800 pb-1">Horizontal Align</Label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white px-1"
                                                onClick={() => handleBulkAlign('left')}
                                                title="Align left edges to leftmost item"
                                            >
                                                Align Left
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white px-1"
                                                onClick={() => handleBulkAlign('center')}
                                                title="Align centers horizontally"
                                            >
                                                Align Center
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white px-1"
                                                onClick={() => handleBulkAlign('right')}
                                                title="Align right edges to rightmost item"
                                            >
                                                Align Right
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block border-b border-gray-800 pb-1">Vertical Align</Label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white px-1"
                                                onClick={() => handleBulkAlign('top')}
                                                title="Align top edges to uppermost item"
                                            >
                                                Align Top
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-855 text-gray-300 hover:text-white px-1"
                                                onClick={() => handleBulkAlign('middle')}
                                                title="Align middle coordinates vertically"
                                            >
                                                Align Middle
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white px-1"
                                                onClick={() => handleBulkAlign('bottom')}
                                                title="Align bottom edges to lowest item"
                                            >
                                                Align Bottom
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block border-b border-gray-800 pb-1">Distribute Elements (3+ items)</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white"
                                                onClick={() => handleBulkAlign('distribute-h')}
                                                title="Distribute horizontally"
                                            >
                                                Distribute H
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-855 text-gray-300 hover:text-white"
                                                onClick={() => handleBulkAlign('distribute-v')}
                                                title="Distribute vertically"
                                            >
                                                Distribute V
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block border-b border-gray-800 pb-1">Align relative to Canvas</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white"
                                                onClick={() => handleBulkAlign('canvas-center-x')}
                                                title="Center items horizontally on canvas"
                                            >
                                                Center X
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-855 text-gray-300 hover:text-white"
                                                onClick={() => handleBulkAlign('canvas-center-y')}
                                                title="Center items vertically on canvas"
                                            >
                                                Center Y
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block border-b border-gray-800 pb-1">Typography Alignment (Text)</Label>
                                        <div className="grid grid-cols-3 gap-1.5">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white px-1"
                                                onClick={() => handleBulkTextAlign('left')}
                                                title="Set text-align left"
                                            >
                                                Text Left
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-855 text-gray-300 hover:text-white px-1"
                                                onClick={() => handleBulkTextAlign('center')}
                                                title="Set text-align center"
                                            >
                                                Text Center
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white px-1"
                                                onClick={() => handleBulkTextAlign('right')}
                                                title="Set text-align right"
                                            >
                                                Text Right
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 border-t border-gray-800 pt-3">
                                        <Label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Uniform Styling</Label>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full h-8 text-xs bg-gray-950 border-gray-800 hover:bg-gray-800 text-gray-300 hover:text-white"
                                            onClick={handleBulkStyleMatch}
                                        >
                                            Copy reference style to all
                                        </Button>
                                    </div>

                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="w-full h-8 text-xs text-gray-400 hover:text-white"
                                        onClick={() => setSelectedElementIds([])}
                                    >
                                        Clear Selection
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    ) : selectedElement ? (
                        /* Single Element Inspector */
                        <div className="space-y-4">
                            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider flex items-center justify-between">
                                <span>Properties Inspector</span>
                                <span className="text-[10px] font-mono text-gray-500">X: {Math.round(selectedElement.x)}% Y: {Math.round(selectedElement.y)}%</span>
                            </h3>

                            <Card className="border-gray-850 bg-gray-900/60 text-white">
                                <CardContent className="p-4 space-y-4">
                                    {/* Text Content Editor */}
                                    {selectedElement.type !== 'qr_code' && (
                                        <div className="space-y-1.5">
                                            <Label htmlFor="elContent" className="text-xs text-gray-400">Content Text</Label>
                                            {selectedElement.type === 'info_block' || selectedElement.type === 'sentence' ? (
                                                <textarea
                                                    id="elContent"
                                                    value={selectedElement.content}
                                                    onChange={(e) => updateSelectedElement({ content: e.target.value })}
                                                    className="w-full text-xs border border-gray-800 rounded p-2 min-h-[70px] bg-gray-950 text-white font-sans focus:outline-none focus:ring-1 focus:ring-primary"
                                                />
                                            ) : (
                                                <Input 
                                                    id="elContent"
                                                    value={selectedElement.content}
                                                    onChange={(e) => updateSelectedElement({ content: e.target.value })}
                                                    className="h-8 bg-gray-950 border-gray-800 text-xs text-white"
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Dimensions / Sizes */}
                                    <div className="grid grid-cols-2 gap-3.5">
                                        <div className="space-y-1">
                                            <Label htmlFor="elSize" className="text-[11px] text-gray-400">
                                                {selectedElement.type === 'qr_code' ? 'QR Size (%)' : 'Font Size (px)'}
                                            </Label>
                                            <Input 
                                                id="elSize" 
                                                type="number"
                                                value={selectedElement.fontSize}
                                                onChange={(e) => updateSelectedElement({ fontSize: Math.max(5, parseInt(e.target.value) || 12) })}
                                                className="h-8 bg-gray-950 border-gray-800 text-xs font-mono font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="elWeight" className="text-[11px] text-gray-400">Weight</Label>
                                            <Select 
                                                value={selectedElement.fontWeight} 
                                                onValueChange={(val: any) => updateSelectedElement({ fontWeight: val })}
                                                disabled={selectedElement.type === 'qr_code'}
                                            >
                                                <SelectTrigger id="elWeight" className="h-8 bg-gray-950 border-gray-800 text-xs text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="semibold">Semibold</SelectItem>
                                                    <SelectItem value="bold">Bold</SelectItem>
                                                    <SelectItem value="black">Black</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Font Family */}
                                    {selectedElement.type !== 'qr_code' && (
                                        <div className="space-y-1.5">
                                            <Label htmlFor="elFontFamily" className="text-xs text-gray-400">Typography Font</Label>
                                            <Select 
                                                value={selectedElement.fontFamily || 'Inter'} 
                                                onValueChange={(val: any) => updateSelectedElement({ fontFamily: val })}
                                            >
                                                <SelectTrigger id="elFontFamily" className="h-8 bg-gray-950 border-gray-800 text-xs text-white font-mono">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-gray-900 border-gray-800 text-white text-xs">
                                                    <SelectItem value="Inter">Inter (Sans)</SelectItem>
                                                    <SelectItem value="Montserrat">Montserrat (Sans)</SelectItem>
                                                    <SelectItem value="Playfair Display">Playfair Display (Serif)</SelectItem>
                                                    <SelectItem value="Cinzel">Cinzel (Serif)</SelectItem>
                                                    <SelectItem value="Lora">Lora (Serif)</SelectItem>
                                                    <SelectItem value="Great Vibes">Great Vibes (Script)</SelectItem>
                                                    <SelectItem value="Alex Brush">Alex Brush (Script)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Align & Color */}
                                    {selectedElement.type !== 'qr_code' && (
                                        <div className="grid grid-cols-2 gap-3.5">
                                            <div className="space-y-1.5">
                                                <Label className="text-[11px] text-gray-400">Align</Label>
                                                <div className="flex border border-gray-850 rounded overflow-hidden bg-gray-950 h-8">
                                                    <Button 
                                                        variant={selectedElement.align === 'left' ? "default" : "ghost"}
                                                        size="icon" 
                                                        className="flex-1 rounded-none border-none h-full text-gray-400"
                                                        onClick={() => updateSelectedElement({ align: 'left' })}
                                                    >
                                                        <AlignLeft className="h-3.5 w-3.5"/>
                                                    </Button>
                                                    <Button 
                                                        variant={selectedElement.align === 'center' ? "default" : "ghost"}
                                                        size="icon" 
                                                        className="flex-1 rounded-none border-none h-full text-gray-400"
                                                        onClick={() => updateSelectedElement({ align: 'center' })}
                                                    >
                                                        <AlignCenter className="h-3.5 w-3.5"/>
                                                    </Button>
                                                    <Button 
                                                        variant={selectedElement.align === 'right' ? "default" : "ghost"}
                                                        size="icon" 
                                                        className="flex-1 rounded-none border-none h-full text-gray-400"
                                                        onClick={() => updateSelectedElement({ align: 'right' })}
                                                    >
                                                        <AlignRight className="h-3.5 w-3.5"/>
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="elColor" className="text-[11px] text-gray-400">Hex Color</Label>
                                                <div className="flex gap-1 bg-gray-950 border border-gray-800 h-8 rounded px-1.5 items-center">
                                                    <input 
                                                        id="elColor" 
                                                        type="color" 
                                                        value={selectedElement.color}
                                                        onChange={(e) => updateSelectedElement({ color: e.target.value })}
                                                        className="w-4 h-4 p-0 cursor-pointer bg-transparent border-none"
                                                    />
                                                    <span className="text-[10px] font-mono text-gray-300">{selectedElement.color.toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Width slider */}
                                    {selectedElement.type !== 'qr_code' && (
                                        <div className="space-y-2 border-t border-gray-800 pt-3">
                                            <Label htmlFor="elWidth" className="text-xs text-gray-400">Wrap Width (%)</Label>
                                            <div className="flex items-center gap-3">
                                                <Slider
                                                    id="elWidth"
                                                    min={10}
                                                    max={100}
                                                    step={1}
                                                    value={[selectedElement.width || 90]}
                                                    onValueChange={([val]) => updateSelectedElement({ width: val })}
                                                    className="flex-1"
                                                />
                                                <span className="text-xs font-mono font-semibold text-gray-400 w-8 text-right">{selectedElement.width || 90}%</span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full text-xs border-gray-850 hover:bg-gray-800 hover:text-white"
                                onClick={() => setSelectedElementId(null)}
                            >
                                Deselect element
                            </Button>
                        </div>
                    ) : (
                        /* Workspace Overview (Figma/Photoshop Help Panel) */
                        <div className="space-y-4">
                            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                                Studio Inspector
                            </h3>
                            <Card className="border-gray-850 bg-gray-900/40 text-gray-400 text-xs">
                                <CardContent className="p-4 space-y-4">
                                    <div className="text-center py-2">
                                        <div className="text-3xl mb-1.5">🎛️</div>
                                        <div className="text-xs font-semibold text-white">No active selection</div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">Select a layer or element to edit its vector properties</div>
                                    </div>
                                    
                                    <div className="space-y-2.5 border-t border-gray-800 pt-3">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Quick Tips</div>
                                        <ul className="space-y-1.5 text-[11px] list-disc list-inside leading-relaxed pl-1">
                                            <li>Click and hold any element to drag it to a new location.</li>
                                            <li>Use the zoom tools at the top to magnify or shrink the workspace page.</li>
                                            <li>Hold <span className="font-semibold text-gray-300 font-mono">Shift</span> key to select multiple elements at once.</li>
                                            <li>Drag the **right border handle** on the canvas to visually resize wrapping bounds.</li>
                                        </ul>
                                    </div>
                                    
                                    <div className="space-y-2 border-t border-gray-800 pt-3">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Shortcut Actions</div>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className="w-full h-8 text-[11px] bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300"
                                            onClick={() => setSelectedElementIds(elements.map(e => e.id))}
                                        >
                                            Select All Layers
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
