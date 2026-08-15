// Unified Studio Designer Page (Certificate & Transcript Vector Studio)
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
import { Loader2, Save, Move, Image as ImageIcon, Eye, Plus, Trash2, AlignLeft, AlignCenter, AlignRight, Type, Check, ExternalLink, FileText, Award } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getParentCourses } from '@/lib/actions/courses';
import { getCertificateTemplate, saveCertificateTemplate } from '@/lib/actions/certificates';
import { getTranscriptTemplate, saveTranscriptTemplate } from '@/lib/actions/transcripts';
import { FONT_LIST, getFontFamilyStyle } from '@/components/print/CertificateLayout';

// Type definitions for drag-and-drop template elements
export interface DocumentElement {
    id: string;
    type: 'title' | 'paragraph' | 'course_name' | 'student_name' | 'sentence' | 'qr_code' | 'info_block' | 'company_br' | 'image';
    content: string;
    x: number; // percentage (0 - 100)
    y: number; // percentage (0 - 100)
    fontSize: number; // in pixels (scaled down in preview)
    fontWeight: 'normal' | 'semibold' | 'bold' | 'black';
    color: string;
    align: 'left' | 'center' | 'right';
    width?: number;
    fontFamily?: string;
    imageUrl?: string;
}

// Helpers to convert percentage coordinates (0-100%) to/from Physical Centimeters (cm)
const getPageDimensionsCm = (pageSize: string, orientation: string) => {
    const isPortrait = orientation === 'Portrait';
    if (pageSize === 'Letter') {
        return isPortrait ? { width: 21.59, height: 27.94 } : { width: 27.94, height: 21.59 };
    }
    // A4 Default
    return isPortrait ? { width: 21.0, height: 29.7 } : { width: 29.7, height: 21.0 };
};

const xToLeftCm = (x: number, docWidthCm: number) => {
    return Number(((x / 100) * docWidthCm).toFixed(2));
};

const leftCmToX = (leftCm: number, docWidthCm: number) => {
    if (docWidthCm <= 0) return 0;
    return Math.min(100, Math.max(0, Number(((leftCm / docWidthCm) * 100).toFixed(2))));
};

const yToTopCm = (y: number, docHeightCm: number) => {
    return Number(((y / 100) * docHeightCm).toFixed(2));
};

const topCmToY = (topCm: number, docHeightCm: number) => {
    if (docHeightCm <= 0) return 0;
    return Math.min(100, Math.max(0, Number(((topCm / docHeightCm) * 100).toFixed(2))));
};

const DEFAULT_BACKGROUNDS = [
    { name: "Pharma Course Standard", url: "https://content-provider.pharmacollege.lk/certificates/certificate-bg-standard.png" },
    { name: "English Course Standard", url: "https://content-provider.pharmacollege.lk/certificates/certificate-bg-english-free-v1.png" },
    { name: "Workshop General", url: "https://content-provider.pharmacollege.lk/certificates/certificate-bg-workshop.png" }
];

export function UnifiedDocumentStudioPage({ initialDocType = 'Certificate' }: { initialDocType?: 'Certificate' | 'Transcript' }) {
    const queryClient = useQueryClient();
    
    const [docType, setDocType] = useState<'Certificate' | 'Transcript'>(initialDocType);
    const [selectedCourseCode, setSelectedCourseCode] = useState<string>('');
    const [templateName, setTemplateName] = useState<string>('');
    const [isActive, setIsActive] = useState<boolean>(true);
    const [backImage, setBackImage] = useState<string>('');
    const [orientation, setOrientation] = useState<'Landscape' | 'Portrait'>('Landscape');
    const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
    const [elements, setElements] = useState<DocumentElement[]>([]);
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

    // Fetch template for selected course & docType
    const { data: certTemplateResp, isLoading: isLoadingCertTemplate, refetch: refetchCertTemplate } = useQuery({
        queryKey: ['certificateTemplate', selectedCourseCode],
        queryFn: () => getCertificateTemplate(selectedCourseCode),
        enabled: !!selectedCourseCode && docType === 'Certificate',
    });

    const { data: transTemplateResp, isLoading: isLoadingTransTemplate, refetch: refetchTransTemplate } = useQuery({
        queryKey: ['transcriptTemplate', selectedCourseCode],
        queryFn: () => {
            const courseObj = courses?.find((c: any) => c.course_code === selectedCourseCode || String(c.id) === String(selectedCourseCode));
            const courseIdToFetch = courseObj ? String(courseObj.id) : selectedCourseCode;
            return getTranscriptTemplate(courseIdToFetch);
        },
        enabled: !!selectedCourseCode && docType === 'Transcript',
    });

    const isLoadingTemplate = docType === 'Certificate' ? isLoadingCertTemplate : isLoadingTransTemplate;
    const templateResponse = docType === 'Certificate' ? certTemplateResp : transTemplateResp;

    const handleCourseChange = (courseCode: string) => {
        setSelectedCourseCode(courseCode);
    };

    const saveCertMutation = useMutation({
        mutationFn: saveCertificateTemplate,
        onSuccess: (data) => {
            if (data.success) {
                toast({ title: 'Success', description: 'Certificate template saved successfully!' });
                queryClient.invalidateQueries({ queryKey: ['certificateTemplate', selectedCourseCode] });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: data.error || 'Failed to save certificate template.' });
            }
        },
        onError: (err: any) => {
            toast({ variant: 'destructive', title: 'Error', description: err.message || 'An error occurred while saving.' });
        }
    });

    const saveTransMutation = useMutation({
        mutationFn: (data: { courseId: string, templateData: any }) => saveTranscriptTemplate(data.courseId, data.templateData),
        onSuccess: (data) => {
            if (data.success || data.message) {
                toast({ title: 'Success', description: 'Transcript template saved successfully!' });
                queryClient.invalidateQueries({ queryKey: ['transcriptTemplate', selectedCourseCode] });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: data.error || 'Failed to save transcript template.' });
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
            
            if (docType === 'Certificate') {
                setTemplateName(t.template_name || `Certificate for ${selectedCourseCode}`);
                setIsActive(Number(t.is_active) === 1);
                setBackImage(t.back_image || DEFAULT_BACKGROUNDS[0].url);
                setOrientation((t.orientation as 'Landscape' | 'Portrait') || 'Landscape');
                
                if (t.template_json) {
                    try {
                        const parsed = JSON.parse(t.template_json);
                        setElements(parsed.elements || []);
                        setPageSize(parsed.pageSize || 'A4');
                    } catch (e) {
                        loadLegacyElements(t);
                    }
                } else {
                    loadLegacyElements(t);
                }
            } else {
                // Transcript loading
                let parsedData: any = {};
                let foundTemplate = false;

                if (t.template_data) {
                    try {
                        parsedData = typeof t.template_data === 'string' ? JSON.parse(t.template_data) : t.template_data;
                        foundTemplate = true;
                    } catch (e) {
                        parsedData = {};
                    }
                }

                // Fallback to certificate_template table if transcript_templates table returned empty
                if (!foundTemplate && certTemplateResp?.success && certTemplateResp?.template?.template_json) {
                    try {
                        parsedData = JSON.parse(certTemplateResp.template.template_json);
                        t.back_image = certTemplateResp.template.back_image;
                        t.orientation = certTemplateResp.template.orientation;
                    } catch (e) {}
                }

                setTemplateName(parsedData.template_name || `Transcript for ${selectedCourseCode}`);
                setIsActive(parsedData.isActive !== false);
                setBackImage(parsedData.backImage || t.back_image || DEFAULT_BACKGROUNDS[0].url);
                setOrientation((parsedData.orientation as 'Landscape' | 'Portrait') || (t.orientation as 'Landscape' | 'Portrait') || 'Portrait');
                setPageSize((parsedData.pageSize as 'A4' | 'Letter') || 'A4');

                if (parsedData.elements && Array.isArray(parsedData.elements) && parsedData.elements.length > 0) {
                    setElements(parsedData.elements);
                } else {
                    loadDefaultElements('Transcript');
                }
            }
            setSelectedElementId(null);
        } else {
            // Default template initialization
            setTemplateName(`${docType} for ${selectedCourseCode || 'Course'}`);
            setIsActive(true);
            setBackImage(DEFAULT_BACKGROUNDS[0].url);
            setPageSize('A4');
            loadDefaultElements(docType);
            setSelectedElementId(null);
        }
    }, [templateResponse, selectedCourseCode, docType]);

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
    }, [selectedElementId]);

    const loadDefaultElements = (type: 'Certificate' | 'Transcript') => {
        if (type === 'Transcript') {
            setElements([
                { id: '1', type: 'title', content: 'ACADEMIC TRANSCRIPT', x: 50, y: 8, fontSize: 24, fontWeight: 'bold', color: '#000000', align: 'center', fontFamily: 'Inter' },
                { id: '2', type: 'course_name', content: '{{COURSE_NAME}}', x: 50, y: 14, fontSize: 18, fontWeight: 'bold', color: '#000000', align: 'center', fontFamily: 'Inter' },
                { id: '3', type: 'paragraph', content: 'This is to certify that {{STUDENT_NAME}} has successfully completed the Certificate Course in Pharmaceuticals conducted by Ceylon Pharma College.', x: 50, y: 22, fontSize: 12, fontWeight: 'normal', color: '#1E293B', align: 'center', width: 92, fontFamily: 'Inter' },
                { id: '4', type: 'sentence', content: '{{MODULE_LIST}}', x: 50, y: 40, fontSize: 11, fontWeight: 'normal', color: '#0F172A', align: 'left', width: 90, fontFamily: 'Inter' },
                { id: '5', type: 'info_block', content: 'Candidate Name: {{STUDENT_NAME}}\nDuration: {{DURATION}}\nCompleted Date: {{COMPLETED_DATE}}\nStudent Number: {{STUDENT_ID}}\nCertificate Number: {{CERTIFICATE_ID}}', x: 24, y: 68, fontSize: 11, fontWeight: 'normal', color: '#000000', align: 'left', fontFamily: 'Inter' },
                { id: '6', type: 'sentence', content: 'Grade: {{GRADE}}', x: 14, y: 82, fontSize: 20, fontWeight: 'bold', color: '#000000', align: 'left', fontFamily: 'Inter' },
                { id: '7', type: 'image', content: 'https://content-provider.pharmacollege.lk/certificates/sample-signature.png', x: 80, y: 66, fontSize: 16, fontWeight: 'normal', color: '#000000', align: 'center', width: 22 },
                { id: '8', type: 'company_br', content: 'Dilip Fonseka,\nCourse Director', x: 80, y: 74, fontSize: 11, fontWeight: 'bold', color: '#000000', align: 'center', fontFamily: 'Inter' },
                { id: '9', type: 'qr_code', content: '{{QR_CODE}}', x: 85, y: 84, fontSize: 14, fontWeight: 'normal', color: '#000000', align: 'right', fontFamily: 'Inter' },
                { id: '10', type: 'sentence', content: 'TRNS/253555/260815/CPCC29/CREF4623', x: 26, y: 92, fontSize: 9, fontWeight: 'normal', color: '#64748B', align: 'left', fontFamily: 'Inter' },
                { id: '11', type: 'sentence', content: 'Grade Scale: A+ (90-100), A (80-89), A- (75-79), B+ (70-74), B (65-69), B- (60-64), C+ (55-59), C (45-54), C- (40-44), D+ (35-39), D (30-34), E (0-29)', x: 50, y: 96, fontSize: 8, fontWeight: 'normal', color: '#94A3B8', align: 'center', width: 95, fontFamily: 'Inter' },
            ]);
            setOrientation('Portrait');
        } else {
            setElements([
                { id: '1', type: 'title', content: 'CERTIFICATE OF COMPLETION', x: 50, y: 18, fontSize: 24, fontWeight: 'bold', color: '#0F172A', align: 'center', fontFamily: 'Inter' },
                { id: '2', type: 'paragraph', content: 'This is to certify that', x: 50, y: 26, fontSize: 14, fontWeight: 'normal', color: '#475569', align: 'center', fontFamily: 'Inter' },
                { id: '3', type: 'student_name', content: '{{STUDENT_NAME}}', x: 50, y: 38, fontSize: 32, fontWeight: 'bold', color: '#1E293B', align: 'center', fontFamily: 'Inter' },
                { id: '4', type: 'sentence', content: 'has successfully completed the prescribed course of study in', x: 50, y: 48, fontSize: 13, fontWeight: 'normal', color: '#475569', align: 'center', fontFamily: 'Inter' },
                { id: '5', type: 'course_name', content: '{{COURSE_NAME}}', x: 50, y: 56, fontSize: 20, fontWeight: 'semibold', color: '#0F172A', align: 'center', fontFamily: 'Inter' },
                { id: '6', type: 'info_block', content: 'Certificate ID: {{CERTIFICATE_ID}}\nIssued Date: {{ISSUED_DATE}}\nStudent Number: {{STUDENT_ID}}', x: 22, y: 84, fontSize: 11, fontWeight: 'normal', color: '#64748B', align: 'left', fontFamily: 'Inter' },
                { id: '7', type: 'company_br', content: 'Ceylon Pharma College (Pvt) Ltd', x: 82, y: 84, fontSize: 11, fontWeight: 'semibold', color: '#64748B', align: 'right', fontFamily: 'Inter' },
                { id: '8', type: 'qr_code', content: '{{QR_CODE}}', x: 8, y: 82, fontSize: 14, fontWeight: 'normal', color: '#000000', align: 'left', fontFamily: 'Inter' },
            ]);
            setOrientation('Landscape');
        }
    };

    const loadLegacyElements = (t: any) => {
        const top_name = t.top_to_name ? (t.top_to_name / 800) * 100 : 38;
        const top_date = t.top_to_date ? (t.top_to_date / 800) * 100 : 84;
        const left_date = t.left_to_date ? t.left_to_date : 22;
        const top_qr = t.top_to_qr ? (t.top_to_qr / 800) * 100 : 82;
        const left_qr = t.left_to_qr ? t.left_to_qr : 8;

        setElements([
            { id: '1', type: 'title', content: 'CERTIFICATE OF COMPLETION', x: 50, y: 18, fontSize: 24, fontWeight: 'bold', color: '#0F172A', align: 'center', fontFamily: 'Inter' },
            { id: '2', type: 'paragraph', content: 'This is to certify that', x: 50, y: 26, fontSize: 14, fontWeight: 'normal', color: '#475569', align: 'center', fontFamily: 'Inter' },
            { id: '3', type: 'student_name', content: '{{STUDENT_NAME}}', x: 50, y: top_name, fontSize: 32, fontWeight: 'bold', color: '#1E293B', align: 'center', fontFamily: 'Inter' },
            { id: '4', type: 'sentence', content: 'has successfully completed the prescribed course of study in', x: 50, y: 48, fontSize: 13, fontWeight: 'normal', color: '#475569', align: 'center', fontFamily: 'Inter' },
            { id: '5', type: 'course_name', content: '{{COURSE_NAME}}', x: 50, y: 56, fontSize: 20, fontWeight: 'semibold', color: '#0F172A', align: 'center', fontFamily: 'Inter' },
            { id: '6', type: 'info_block', content: 'Certificate ID: {{CERTIFICATE_ID}}\nIssued Date: {{ISSUED_DATE}}\nStudent Number: {{STUDENT_ID}}', x: left_date, y: top_date, fontSize: 11, fontWeight: 'normal', color: '#64748B', align: 'left', fontFamily: 'Inter' },
            { id: '7', type: 'company_br', content: 'Ceylon Pharma College (Pvt) Ltd', x: 82, y: top_date, fontSize: 11, fontWeight: 'semibold', color: '#64748B', align: 'right', fontFamily: 'Inter' },
            { id: '8', type: 'qr_code', content: '{{QR_CODE}}', x: left_qr, y: top_qr, fontSize: t.qr_width || 14, fontWeight: 'normal', color: '#000000', align: 'left', fontFamily: 'Inter' },
        ]);
    };

    const addElement = (type: DocumentElement['type']) => {
        const id = Date.now().toString();
        let newEl: DocumentElement = {
            id,
            type,
            content: 'New Text',
            x: 50,
            y: 50,
            fontSize: 16,
            fontWeight: 'normal',
            color: '#1E293B',
            align: 'center',
            fontFamily: 'Inter',
            width: 90
        };

        if (type === 'title') {
            newEl.content = docType === 'Transcript' ? 'ACADEMIC RECORD' : 'CERTIFICATE OF ACHIEVEMENT';
            newEl.fontSize = 22;
            newEl.fontWeight = 'bold';
        } else if (type === 'student_name') {
            newEl.content = '{{STUDENT_NAME}}';
            newEl.fontSize = docType === 'Transcript' ? 20 : 30;
            newEl.fontWeight = 'bold';
        } else if (type === 'course_name') {
            newEl.content = '{{COURSE_NAME}}';
            newEl.fontSize = docType === 'Transcript' ? 16 : 20;
            newEl.fontWeight = 'semibold';
        } else if (type === 'sentence') {
            newEl.content = docType === 'Transcript' ? '{{RESULTS_TABLE}}' : 'has fulfilled all statutory and academic requirements.';
            newEl.fontSize = 11;
            newEl.align = 'center';
            newEl.width = 90;
        } else if (type === 'info_block') {
            newEl.content = docType === 'Transcript' ? 'Student ID: {{STUDENT_ID}}  |  Batch: {{BATCH}}' : 'Certificate ID: {{CERTIFICATE_ID}}\nIssued Date: {{ISSUED_DATE}}';
            newEl.fontSize = 11;
        } else if (type === 'company_br') {
            newEl.content = 'Ceylon Pharma College (Pvt) Ltd';
            newEl.fontSize = 10;
        } else if (type === 'qr_code') {
            newEl.content = '{{QR_CODE}}';
            newEl.fontSize = 14;
            newEl.align = 'left';
        } else if (type === 'image') {
            newEl.content = 'https://content-provider.pharmacollege.lk/certificates/sample-signature.png';
            newEl.width = 25;
        }

        setElements(prev => [...prev, newEl]);
        setSelectedElementId(id);
        setSelectedElementIds([id]);
    };

    const removeElement = (id: string) => {
        setElements(prev => prev.filter(el => el.id !== id));
        if (selectedElementId === id) setSelectedElementId(null);
        setSelectedElementIds(prev => prev.filter(item => item !== id));
    };

    const handleDuplicateElement = (id: string) => {
        const target = elements.find(el => el.id === id);
        if (!target) return;
        const newId = Date.now().toString();
        const duplicated: DocumentElement = {
            ...target,
            id: newId,
            x: Math.min(95, target.x + 3),
            y: Math.min(95, target.y + 3)
        };
        setElements(prev => [...prev, duplicated]);
        setSelectedElementId(newId);
        setSelectedElementIds([newId]);
        toast({ title: 'Duplicated', description: 'Element duplicated successfully.' });
    };

    const updateSelectedElement = (fields: Partial<DocumentElement>) => {
        if (!selectedElementId) return;
        setElements(prev => prev.map(el => {
            if (el.id === selectedElementId) {
                return { ...el, ...fields };
            }
            return el;
        }));
    };

    const handleBulkAlign = (action: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-h' | 'distribute-v' | 'canvas-center-x' | 'canvas-center-y') => {
        if (selectedElementIds.length === 0) return;
        const selectedEls = elements.filter(el => selectedElementIds.includes(el.id));
        if (selectedEls.length === 0) return;

        if (action === 'left') {
            const minX = Math.min(...selectedEls.map(el => el.x));
            setElements(prev => prev.map(el => selectedElementIds.includes(el.id) ? { ...el, x: minX } : el));
        } else if (action === 'center') {
            const avgX = Math.round(selectedEls.reduce((acc, el) => acc + el.x, 0) / selectedEls.length);
            setElements(prev => prev.map(el => selectedElementIds.includes(el.id) ? { ...el, x: avgX } : el));
        } else if (action === 'right') {
            const maxX = Math.max(...selectedEls.map(el => el.x));
            setElements(prev => prev.map(el => selectedElementIds.includes(el.id) ? { ...el, x: maxX } : el));
        } else if (action === 'top') {
            const minY = Math.min(...selectedEls.map(el => el.y));
            setElements(prev => prev.map(el => selectedElementIds.includes(el.id) ? { ...el, y: minY } : el));
        } else if (action === 'middle') {
            const avgY = Math.round(selectedEls.reduce((acc, el) => acc + el.y, 0) / selectedEls.length);
            setElements(prev => prev.map(el => selectedElementIds.includes(el.id) ? { ...el, y: avgY } : el));
        } else if (action === 'bottom') {
            const maxY = Math.max(...selectedEls.map(el => el.y));
            setElements(prev => prev.map(el => selectedElementIds.includes(el.id) ? { ...el, y: maxY } : el));
        } else if (action === 'distribute-v' && selectedEls.length > 2) {
            const sorted = [...selectedEls].sort((a, b) => a.y - b.y);
            const minY = sorted[0].y;
            const maxY = sorted[sorted.length - 1].y;
            const gap = (maxY - minY) / (sorted.length - 1);
            const yMap = new Map<string, number>();
            sorted.forEach((el, idx) => {
                yMap.set(el.id, Math.round(minY + idx * gap));
            });
            setElements(prev => prev.map(el => yMap.has(el.id) ? { ...el, y: yMap.get(el.id)! } : el));
        } else if (action === 'canvas-center-x') {
            setElements(prev => prev.map(el => selectedElementIds.includes(el.id) ? { ...el, x: 50 } : el));
        } else if (action === 'canvas-center-y') {
            setElements(prev => prev.map(el => selectedElementIds.includes(el.id) ? { ...el, y: 50 } : el));
        }
    };

    const handleBulkTextAlign = (align: 'left' | 'center' | 'right') => {
        if (selectedElementIds.length === 0) return;
        setElements(prev => prev.map(el => selectedElementIds.includes(el.id) ? { ...el, align } : el));
    };

    const handleBulkStyleMatch = () => {
        if (!selectedElementId || selectedElementIds.length < 2) return;
        const refEl = elements.find(el => el.id === selectedElementId);
        if (!refEl) return;
        setElements(prev => prev.map(el => {
            if (selectedElementIds.includes(el.id) && el.id !== selectedElementId) {
                return {
                    ...el,
                    fontSize: refEl.fontSize,
                    fontWeight: refEl.fontWeight,
                    color: refEl.color,
                    fontFamily: refEl.fontFamily,
                    align: refEl.align
                };
            }
            return el;
        }));
        toast({ title: 'Styles Matched', description: `Applied style properties from ${refEl.type} to selected elements.` });
    };

    // Dragging handlers
    const handleElementMouseDown = (e: React.MouseEvent, el: DocumentElement) => {
        e.stopPropagation();
        setSelectedElementId(el.id);
        if (!e.shiftKey && !selectedElementIds.includes(el.id)) {
            setSelectedElementIds([el.id]);
        } else if (e.shiftKey && !selectedElementIds.includes(el.id)) {
            setSelectedElementIds(prev => [...prev, el.id]);
        }

        draggingRef.current = {
            elementId: el.id,
            startX: e.clientX,
            startY: e.clientY,
            initialX: el.x,
            initialY: el.y
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!draggingRef.current || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        
        const deltaXPixels = e.clientX - draggingRef.current.startX;
        const deltaYPixels = e.clientY - draggingRef.current.startY;

        const deltaXPercent = (deltaXPixels / rect.width) * 100;
        const deltaYPercent = (deltaYPixels / rect.height) * 100;

        let newX = Math.round(draggingRef.current.initialX + deltaXPercent);
        let newY = Math.round(draggingRef.current.initialY + deltaYPercent);

        // Constrain bounds to canvas (0 - 100)
        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));

        const targetId = draggingRef.current.elementId;

        setElements(prev => prev.map(item => {
            if (item.id === targetId) {
                return { ...item, x: newX, y: newY };
            }
            return item;
        }));
    };

    const handleMouseUp = () => {
        draggingRef.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    // Edge resize drag for Wrap Width
    const handleResizeMouseDown = (e: React.MouseEvent, el: DocumentElement) => {
        e.stopPropagation();
        e.preventDefault();
        const startX = e.clientX;
        const initialWidth = el.width || 90;
        
        const handleResizeMouseMove = (moveEvent: MouseEvent) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const deltaX = moveEvent.clientX - startX;
            const deltaPercent = (deltaX / rect.width) * 100 * 2;
            const newWidth = Math.max(10, Math.min(100, Math.round(initialWidth + deltaPercent)));
            
            setElements(prev => prev.map(item => 
                item.id === el.id ? { ...item, width: newWidth } : item
            ));
        };

        const handleResizeMouseUp = () => {
            window.removeEventListener('mousemove', handleResizeMouseMove);
            window.removeEventListener('mouseup', handleResizeMouseUp);
        };

        window.addEventListener('mousemove', handleResizeMouseMove);
        window.addEventListener('mouseup', handleResizeMouseUp);
    };

    const handleBgSelect = (url: string) => {
        setBackImage(url);
    };

    const handleSave = () => {
        if (!selectedCourseCode) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a course workspace first.' });
            return;
        }

        const nameEl = elements.find(el => el.type === 'student_name');
        const dateEl = elements.find(el => el.type === 'info_block');
        const qrEl = elements.find(el => el.type === 'qr_code');

        const top_to_name = nameEl ? Math.round((nameEl.y / 100) * 800) : 304;
        const left_to_date = dateEl ? Math.round(dateEl.x) : 22;
        const top_to_date = dateEl ? Math.round((dateEl.y / 100) * 800) : 672;

        const left_to_qr = qrEl ? Math.round(qrEl.x) : 8;
        const top_to_qr = qrEl ? Math.round((qrEl.y / 100) * 800) : 656;
        const qr_width = qrEl ? Math.round(qrEl.fontSize) : 14;

        const courseObj = courses?.find((c: any) => c.course_code === selectedCourseCode || String(c.id) === String(selectedCourseCode));
        const courseId = courseObj ? String(courseObj.id) : selectedCourseCode;

        if (docType === 'Certificate') {
            const payload = {
                course_code: selectedCourseCode,
                template_name: templateName || `Certificate for ${selectedCourseCode}`,
                left_margin: 0,
                top_to_name,
                left_to_date,
                top_to_date,
                left_to_qr,
                top_to_qr,
                qr_width,
                is_active: isActive ? 1 : 0,
                back_image: backImage,
                orientation: orientation,
                template_json: JSON.stringify({
                    docType: 'Certificate',
                    pageSize,
                    orientation,
                    elements
                })
            };
            saveCertMutation.mutate(payload);
        } else {
            const templateData = {
                docType: 'Transcript',
                template_name: templateName || `Transcript for ${selectedCourseCode}`,
                pageSize,
                orientation,
                backImage,
                isActive,
                elements
            };
            // Save to transcript_templates table
            saveTransMutation.mutate({ courseId, templateData });

            // ALSO save to certificate_template table as dual fallback
            const certPayload = {
                course_code: selectedCourseCode,
                template_name: templateName || `Transcript for ${selectedCourseCode}`,
                left_margin: 0,
                top_to_name,
                left_to_date,
                top_to_date,
                left_to_qr,
                top_to_qr,
                qr_width,
                is_active: isActive ? 1 : 0,
                back_image: backImage,
                orientation: orientation,
                template_json: JSON.stringify({
                    docType: 'Transcript',
                    pageSize,
                    orientation,
                    elements
                })
            };
            saveCertMutation.mutate(certPayload);
        }
    };

    const selectedElement = elements.find(el => el.id === selectedElementId);
    const selectedCourseObj = courses?.find((c: any) => c.course_code === selectedCourseCode || String(c.id) === String(selectedCourseCode));
    const selectedCourseName = selectedCourseObj ? selectedCourseObj.course_name : 'Diploma in Pharmacy Practice';
    const docDimensions = getPageDimensionsCm(pageSize, orientation);

    if (!selectedCourseCode) {
        return (
            <div className="p-4 md:p-8 space-y-6 pb-20 bg-[#0c0d0e] text-white min-h-[80vh] flex flex-col justify-center items-center border border-gray-800 rounded-2xl shadow-2xl">
                {/* Dynamic Google Fonts Link */}
                <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Carlito:ital,wght@0,400;0,700;1,400;1,700&family=Caveat:wght@400..700&family=Cinzel:wght@400..900&family=Great+Vibes&family=Inter:wght@300..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Montserrat:wght@300..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />
                <div className="max-w-md w-full space-y-6 text-center">
                    <header className="space-y-2">
                        <div className="text-4xl justify-center flex mb-2">{docType === 'Certificate' ? '🎨' : '📜'}</div>
                        <h1 className="text-3xl font-headline font-bold text-white tracking-tight">
                            Document Studio Designer
                        </h1>
                        <p className="text-gray-400 text-sm">Choose a course workspace to begin designing vector layout templates.</p>
                    </header>
                    <Card className="border-gray-800 bg-gray-900 shadow-xl text-white">
                        <CardHeader className="text-left pb-3">
                            <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Project Workspace</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-gray-400">Document Type</Label>
                                <Select value={docType} onValueChange={(val: any) => setDocType(val)}>
                                    <SelectTrigger className="w-full bg-gray-950 border-gray-850 text-white font-semibold h-10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-900 border-gray-800 text-white">
                                        <SelectItem value="Certificate" className="cursor-pointer">🎨 Certificate Template</SelectItem>
                                        <SelectItem value="Transcript" className="cursor-pointer">📜 Academic Transcript Template</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-gray-400">Course Workspace</Label>
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
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const savePending = saveCertMutation.isPending || saveTransMutation.isPending;

    return (
        <div className="flex flex-col w-full h-[calc(100vh-80px)] md:h-[calc(100vh-8px)] min-h-[600px] bg-[#0e0f11] text-gray-200 border border-gray-850 rounded-2xl rounded-b-none overflow-hidden shadow-2xl font-sans -mb-4 md:-mb-8">
            {/* Dynamic Google Fonts Link */}
            <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Carlito:ital,wght@0,400;0,700;1,400;1,700&family=Caveat:wght@400..700&family=Cinzel:wght@400..900&family=Great+Vibes&family=Inter:wght@300..900&family=Lora:ital,wght@0,400..700;1,400..700&family=Montserrat:wght@300..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet" />

            {/* Photoshop/Word Top Action Bar */}
            <div className="h-14 bg-gray-900/95 border-b border-gray-800 flex items-center justify-between px-4 gap-4 flex-shrink-0">
                {/* Brand & Project Selector */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white tracking-wider flex items-center gap-1.5 mr-1">
                        <span className="text-primary">{docType === 'Certificate' ? '🎨' : '📜'}</span> Studio
                    </span>

                    {/* Document Type Switcher (Certificate vs Transcript) */}
                    <Select value={docType} onValueChange={(val: any) => setDocType(val)}>
                        <SelectTrigger className="w-36 h-8 bg-gray-950 border-gray-800 text-xs text-white font-semibold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-gray-800 text-white text-xs">
                            <SelectItem value="Certificate" className="cursor-pointer">🎨 Certificate</SelectItem>
                            <SelectItem value="Transcript" className="cursor-pointer">📜 Transcript</SelectItem>
                        </SelectContent>
                    </Select>

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

                {/* Quick Selection Typography Settings */}
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
                                <SelectContent className="bg-gray-900 border-gray-800 text-white max-h-[320px]">
                                    {FONT_LIST.map((font) => (
                                        <SelectItem key={font.value} value={font.value} className="cursor-pointer py-1.5 hover:bg-gray-800 focus:bg-gray-800">
                                            <span style={{ fontFamily: font.family, fontSize: '13px' }}>{font.label}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
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

                <div className="flex gap-2 items-center">
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

                    {docType === 'Certificate' && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(`/print/certificate/preview?course_code=${selectedCourseCode}`, '_blank')}
                            className="h-8 text-xs border-gray-850 hover:bg-gray-800 text-gray-200"
                        >
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5"/> Preview print
                        </Button>
                    )}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => docType === 'Certificate' ? refetchCertTemplate() : refetchTransTemplate()}
                        className="h-8 text-xs border-gray-850 hover:bg-gray-850 text-gray-300"
                    >
                        Reset
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={savePending} 
                        size="sm"
                        className="h-8 text-xs bg-primary hover:bg-primary-hover text-white font-semibold"
                    >
                        {savePending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin"/> : <Save className="mr-1.5 h-3.5 w-3.5"/>}
                        Save Template
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden h-[calc(100%-56px)]">
                <div className="w-72 bg-gray-950 border-r border-gray-850 flex flex-col h-full flex-shrink-0 overflow-y-auto p-4 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Canvas Library Elements</Label>
                        <div className="grid grid-cols-2 gap-1.5">
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('title')}>
                                <Plus className="h-3 w-3 mr-1"/> Title
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('student_name')}>
                                <Plus className="h-3 w-3 mr-1"/> Student Name
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('course_name')}>
                                <Plus className="h-3 w-3 mr-1"/> Course Name
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('sentence')}>
                                <Plus className="h-3 w-3 mr-1"/> {docType === 'Transcript' ? 'Module List' : 'Sentence'}
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('info_block')}>
                                <Plus className="h-3 w-3 mr-1"/> Info Block
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('image')}>
                                <Plus className="h-3 w-3 mr-1"/> Signature Image
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('qr_code')}>
                                <Plus className="h-3 w-3 mr-1"/> QR Code
                            </Button>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 bg-gray-900 border-gray-850 hover:bg-gray-800 text-gray-300" onClick={() => addElement('company_br')}>
                                <Plus className="h-3 w-3 mr-1"/> Company BR
                            </Button>
                        </div>
                    </div>

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
                            <Label className="text-[10px] text-gray-400">Preset Backgrounds</Label>
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

                <div className="flex-1 bg-[#121316] overflow-hidden flex flex-col items-center justify-start relative p-4 select-none">
                    <div className="w-full h-full overflow-auto flex justify-center items-center p-8 py-20">
                        {isLoadingTemplate ? (
                            <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2"/>
                                <p className="text-sm">Loading {docType} Canvas...</p>
                            </div>
                        ) : (
                            <div className="flex-shrink-0 transition-transform duration-100 ease-out py-6 px-8 flex flex-col items-start" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
                                {/* Top Horizontal Ruler (X-Axis in Centimeters) */}
                                <div 
                                    className={`h-5 bg-gray-900/90 border border-gray-800 rounded-t border-b-0 relative flex items-end select-none overflow-hidden font-mono text-[9px] text-gray-400 mb-0 ml-6 ${
                                        orientation === 'Landscape' ? 'w-[800px]' : 'w-[560px]'
                                    }`}
                                >
                                    {Array.from({ length: Math.ceil(docDimensions.width) + 1 }).map((_, cm) => {
                                        const pct = (cm / docDimensions.width) * 100;
                                        if (pct > 100) return null;
                                        const isMajor = cm % 2 === 0;
                                        return (
                                            <div key={cm} className="absolute bottom-0 flex flex-col items-center transform -translate-x-1/2" style={{ left: `${pct}%` }}>
                                                {isMajor && <span className="text-[8px] text-gray-400 -mt-1 leading-none mb-0.5">{cm}</span>}
                                                <div className={`bg-gray-500 ${isMajor ? 'h-2.5 w-[1px]' : 'h-1.5 w-[1px] opacity-50'}`} />
                                            </div>
                                        );
                                    })}
                                    {/* Active Marker on X Ruler */}
                                    {selectedElement && (
                                        <div 
                                            className="absolute top-0 bottom-0 w-[2px] bg-emerald-400 z-30 pointer-events-none transition-all duration-75"
                                            style={{ left: `${selectedElement.x}%` }}
                                            title={`Left: ${xToLeftCm(selectedElement.x, docDimensions.width)} cm`}
                                        />
                                    )}
                                </div>

                                {/* Canvas + Left Vertical Ruler Container */}
                                <div className="flex items-start">
                                    {/* Left Vertical Ruler (Y-Axis in Centimeters) */}
                                    <div 
                                        className={`w-6 bg-gray-900/90 border border-gray-800 rounded-l border-r-0 relative select-none overflow-hidden font-mono text-[9px] text-gray-400 flex-shrink-0 ${
                                            orientation === 'Landscape' ? 'h-[565.65px]' : 'h-[792px]'
                                        }`}
                                    >
                                        {Array.from({ length: Math.ceil(docDimensions.height) + 1 }).map((_, cm) => {
                                            const pct = (cm / docDimensions.height) * 100;
                                            if (pct > 100) return null;
                                            const isMajor = cm % 2 === 0;
                                            return (
                                                <div key={cm} className="absolute right-0 flex items-center transform -translate-y-1/2" style={{ top: `${pct}%` }}>
                                                    {isMajor && <span className="text-[8px] text-gray-400 mr-1 leading-none">{cm}</span>}
                                                    <div className={`bg-gray-500 ${isMajor ? 'w-2.5 h-[1px]' : 'w-1.5 h-[1px] opacity-50'}`} />
                                                </div>
                                            );
                                        })}
                                        {/* Active Marker on Y Ruler */}
                                        {selectedElement && (
                                            <div 
                                                className="absolute left-0 right-0 h-[2px] bg-emerald-400 z-30 pointer-events-none transition-all duration-75"
                                                style={{ top: `${selectedElement.y}%` }}
                                                title={`Top: ${yToTopCm(selectedElement.y, docDimensions.height)} cm`}
                                            />
                                        )}
                                    </div>

                                    {/* Canvas Document */}
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
                                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:3%_3%] opacity-25 pointer-events-none"/>

                                        {elements.map(el => {
                                            const isSelected = selectedElementId === el.id;
                                            const isMultiSelected = selectedElementIds.includes(el.id);
                                            
                                            let displayText = el.content;
                                            if (displayText) {
                                                displayText = displayText
                                                    .replace(/{{STUDENT_NAME}}/g, 'H.Rodriguez')
                                                    .replace(/\[Student Name\]/g, 'H.Rodriguez')
                                                    .replace(/{{COURSE_NAME}}/g, selectedCourseName)
                                                    .replace(/\[Course Name\]/g, selectedCourseName)
                                                    .replace(/{{TRANSCRIPT_ID}}/g, 'TRNS/253555/260815/CPCC29/CREF4623')
                                                    .replace(/\[Transcript ID\]/g, 'TRNS/253555/260815/CPCC29/CREF4623')
                                                    .replace(/{{CERTIFICATE_ID}}/g, 'CREF4623')
                                                    .replace(/\[Certificate ID\]/g, 'CREF4623')
                                                    .replace(/{{STUDENT_ID}}/g, 'PA30172')
                                                    .replace(/\[Student ID\]/g, 'PA30172')
                                                    .replace(/{{NIC}}/g, '200486202343')
                                                    .replace(/\[NIC\]/g, '200486202343')
                                                    .replace(/{{ISSUED_DATE}}/g, 'March 29, 2026')
                                                    .replace(/\[Issued Date\]/g, 'March 29, 2026')
                                                    .replace(/{{COMPLETED_DATE}}/g, 'March 29, 2026')
                                                    .replace(/{{DURATION}}/g, '6 Months')
                                                    .replace(/{{GRADE}}/g, 'B')
                                                    .replace(/{{BATCH}}/g, 'CPCC29')
                                                    .replace(/\[Batch\]/g, 'CPCC29');
                                            }

                                            if (el.type === 'image') {
                                                return (
                                                    <div
                                                        key={el.id}
                                                        className={`absolute cursor-move transform -translate-x-1/2 -translate-y-1/2 transition-[outline] duration-150 flex items-center justify-center bg-transparent border-none ${
                                                            isSelected 
                                                                ? 'outline-1 outline outline-dashed outline-primary outline-offset-1 z-30' 
                                                                : isMultiSelected
                                                                    ? 'outline-1 outline outline-dashed outline-yellow-500 outline-offset-1 z-20'
                                                                    : 'outline-none'
                                                        }`}
                                                        style={{
                                                            left: `${el.x}%`,
                                                            top: `${el.y}%`,
                                                            width: `${el.width || 22}%`,
                                                        }}
                                                        onMouseDown={(e) => handleElementMouseDown(e, el)}
                                                    >
                                                        {el.content ? (
                                                            <img 
                                                                src={el.content} 
                                                                alt="Signature / Image" 
                                                                className="w-full h-auto object-contain max-h-32 pointer-events-none border-none bg-transparent outline-none shadow-none" 
                                                            />
                                                        ) : (
                                                            <div className="w-full h-12 bg-transparent border border-dashed border-gray-400 flex items-center justify-center text-[10px] text-gray-500 font-mono">
                                                                Signature / Image
                                                            </div>
                                                        )}
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

                                            const weightClass = 
                                                el.fontWeight === 'black' ? 'font-black' :
                                                el.fontWeight === 'bold' ? 'font-bold' :
                                                el.fontWeight === 'semibold' ? 'font-semibold' : 'font-normal';

                                            const isModuleListKeyword = displayText.includes('{{MODULE_LIST}}') || displayText.includes('{{RESULTS_TABLE}}') || displayText.includes('[Module List]');

                                            return (
                                                <div
                                                    key={el.id}
                                                    className={`absolute cursor-move transform -translate-x-1/2 -translate-y-1/2 p-1 select-none transition-[outline] duration-150 rounded ${
                                                        isSelected 
                                                            ? 'bg-primary/5 border border-dashed border-primary outline-2 outline outline-primary outline-offset-1 z-30' 
                                                            : isMultiSelected
                                                                ? 'bg-yellow-500/10 border border-dashed border-yellow-500 outline-2 outline outline-yellow-500 outline-offset-1 z-20'
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
                                                    {isModuleListKeyword ? (
                                                        <div className="w-full text-left font-sans space-y-1 text-gray-900 my-1">
                                                            <div className="font-bold text-xs text-gray-900 mb-1.5">Module Name</div>
                                                            <ul className="space-y-1 text-[11px] text-gray-800 list-disc list-inside font-medium leading-relaxed">
                                                                <li>CPP 101 - Introduction to Pharmaceuticals & Pharmacy Practice</li>
                                                                <li>CPP 102 - Prescription Reading & Pharmaceutical Calculations</li>
                                                                <li>CPP 103 - Pharmaceutical Dosage Forms & Drug Administration</li>
                                                                <li>CPP 104 - Pharmaceutical Storage, Quality Assurance & Pharmacy Law</li>
                                                                <li>CPP 105 - Therapeutics of Common Diseases</li>
                                                            </ul>
                                                        </div>
                                                    ) : (
                                                        <div 
                                                            className={weightClass}
                                                            style={{
                                                                fontSize: `${el.fontSize * 0.71}px`,
                                                                fontFamily: getFontFamilyStyle(el.fontFamily),
                                                                color: el.color,
                                                                whiteSpace: 'pre-wrap',
                                                                lineHeight: 1.2
                                                            }}
                                                        >
                                                            {displayText}
                                                        </div>
                                                    )}

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
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-80 bg-gray-950 border-l border-gray-850 flex flex-col h-full flex-shrink-0 overflow-y-auto p-4 space-y-4">
                    {selectedElementIds.length > 1 ? (
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
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white px-1"
                                                onClick={() => handleBulkAlign('middle')}
                                                title="Align centers vertically"
                                            >
                                                Align Mid
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white px-1"
                                                onClick={() => handleBulkAlign('bottom')}
                                                title="Align bottom edges to lowermost item"
                                            >
                                                Align Bottom
                                            </Button>
                                        </div>
                                        <div className="pt-1">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white w-full"
                                                onClick={() => handleBulkAlign('distribute-v')}
                                                title="Distribute vertically"
                                            >
                                                Distribute Vertically
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
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white"
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
                                                className="h-7 text-[10px] bg-gray-950 border-gray-800 hover:bg-gray-850 text-gray-300 hover:text-white px-1"
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
                        <div className="space-y-4 font-sans">
                            <h3 className="text-xs uppercase font-bold text-gray-400 tracking-wider flex items-center justify-between">
                                <span>Properties Inspector</span>
                                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                                    L: {xToLeftCm(selectedElement.x, docDimensions.width)}cm | T: {yToTopCm(selectedElement.y, docDimensions.height)}cm
                                </span>
                            </h3>

                            <Card className="border-gray-850 bg-gray-900/60 text-white">
                                <CardContent className="p-4 space-y-4">
                                    {selectedElement.type === 'image' ? (
                                        <div className="space-y-3">
                                            <Label className="text-xs text-gray-400 font-semibold">Signature / Image File Upload</Label>
                                            
                                            {selectedElement.content && (
                                                <div className="p-2 border border-gray-800 rounded-md bg-gray-950/80 flex items-center justify-center min-h-[60px] relative">
                                                    <img 
                                                        src={selectedElement.content} 
                                                        alt="Preview" 
                                                        className="max-h-14 object-contain" 
                                                    />
                                                </div>
                                            )}

                                            <div className="space-y-1.5">
                                                <Label htmlFor="imgUrl" className="text-[11px] text-gray-500">Image Asset URL or Base64</Label>
                                                <Input 
                                                    id="imgUrl"
                                                    type="text" 
                                                    value={selectedElement.content} 
                                                    onChange={(e) => updateSelectedElement({ content: e.target.value })}
                                                    placeholder="https://... or data:image/png;base64,..."
                                                    className="h-8 bg-gray-950 border-gray-800 text-xs text-white font-mono"
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2 pt-1">
                                                <label className="cursor-pointer block">
                                                    <div className="h-9 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white rounded-md text-xs flex items-center justify-center gap-2 font-medium transition-colors">
                                                        <ImageIcon className="h-4 w-4 text-primary"/> Choose Signature Image File...
                                                    </div>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                const reader = new FileReader();
                                                                reader.onload = (event) => {
                                                                    const dataUrl = event.target?.result as string;
                                                                    updateSelectedElement({ content: dataUrl });
                                                                    toast({ title: 'Image Uploaded', description: 'Signature image attached successfully.' });
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                    />
                                                </label>

                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        const sampleSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='250' height='70' viewBox='0 0 250 70'><path d='M20 45 Q 40 10, 60 40 T 100 35 T 140 40 T 180 30 T 220 45' stroke='%23000000' stroke-width='2.5' fill='none' stroke-linecap='round'/><text x='130' y='62' font-family='sans-serif' font-size='12' font-weight='bold' fill='%23111111'>Dilip Fonseka</text></svg>";
                                                        updateSelectedElement({ content: sampleSvg });
                                                        toast({ title: 'Sample Signature', description: 'Loaded default signature vector.' });
                                                    }}
                                                    className="h-7 bg-gray-950 hover:bg-gray-900 text-primary border border-gray-800 rounded text-[11px] font-mono flex items-center justify-center transition-colors"
                                                >
                                                    Use Sample Signature
                                                </button>
                                            </div>
                                        </div>
                                    ) : selectedElement.type !== 'qr_code' && (
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="elContent" className="text-xs text-gray-400">Content Text</Label>
                                                {docType === 'Transcript' && (
                                                    <div className="flex gap-1.5">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => updateSelectedElement({ content: '{{MODULE_LIST}}' })}
                                                            className="text-[9px] text-primary hover:underline font-mono"
                                                            title="Reset to dynamic database variable"
                                                        >
                                                            Auto Variable
                                                        </button>
                                                        <span className="text-[9px] text-gray-600">|</span>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => updateSelectedElement({ 
                                                                content: `Module Name:\n• CPP 101 - Introduction to Pharmaceuticals & Pharmacy Practice\n• CPP 102 - Prescription Reading & Pharmaceutical Calculations\n• CPP 103 - Pharmaceutical Dosage Forms & Drug Administration\n• CPP 104 - Pharmaceutical Storage, Quality Assurance & Pharmacy Law\n• CPP 105 - Therapeutics of Common Diseases` 
                                                            })}
                                                            className="text-[9px] text-blue-400 hover:underline font-mono"
                                                            title="Load editable sample lines"
                                                        >
                                                            Editable Text
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            {selectedElement.type === 'info_block' || selectedElement.type === 'sentence' || selectedElement.type === 'paragraph' ? (
                                                <textarea
                                                    id="elContent"
                                                    value={selectedElement.content}
                                                    onChange={(e) => updateSelectedElement({ content: e.target.value })}
                                                    className="w-full text-xs border border-gray-800 rounded p-2 min-h-[90px] bg-gray-950 text-white font-sans focus:outline-none focus:ring-1 focus:ring-primary"
                                                    placeholder="Type content or module list..."
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
                                                <SelectContent className="bg-gray-900 border-gray-800 text-white text-xs max-h-[320px]">
                                                    {FONT_LIST.map((font) => (
                                                        <SelectItem key={font.value} value={font.value} className="cursor-pointer py-2 hover:bg-gray-800 focus:bg-gray-800">
                                                            <span style={{ fontFamily: font.family, fontSize: '14px' }}>{font.label}</span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

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

                                    {/* Precise Placement in Centimeters (Left & Top) */}
                                    <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-gray-800">
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="elLeftCm" className="text-[11px] text-gray-400">Left (cm)</Label>
                                                <span className="text-[9px] font-mono text-gray-500">{Math.round(selectedElement.x)}%</span>
                                            </div>
                                            <div className="relative flex items-center">
                                                <Input 
                                                    id="elLeftCm" 
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max={docDimensions.width}
                                                    value={xToLeftCm(selectedElement.x, docDimensions.width)}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        if (!isNaN(val)) {
                                                            updateSelectedElement({ x: leftCmToX(val, docDimensions.width) });
                                                        }
                                                    }}
                                                    className="h-8 bg-gray-950 border-gray-800 text-xs font-mono font-semibold pr-7"
                                                />
                                                <span className="absolute right-2 text-[10px] text-gray-500 font-mono pointer-events-none">cm</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <Label htmlFor="elTopCm" className="text-[11px] text-gray-400">Top (cm)</Label>
                                                <span className="text-[9px] font-mono text-gray-500">{Math.round(selectedElement.y)}%</span>
                                            </div>
                                            <div className="relative flex items-center">
                                                <Input 
                                                    id="elTopCm" 
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max={docDimensions.height}
                                                    value={yToTopCm(selectedElement.y, docDimensions.height)}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        if (!isNaN(val)) {
                                                            updateSelectedElement({ y: topCmToY(val, docDimensions.height) });
                                                        }
                                                    }}
                                                    className="h-8 bg-gray-950 border-gray-800 text-xs font-mono font-semibold pr-7"
                                                />
                                                <span className="absolute right-2 text-[10px] text-gray-500 font-mono pointer-events-none">cm</span>
                                            </div>
                                        </div>
                                    </div>
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
                                        <div className="text-[10px] text-gray-500 mt-0.5">Select a layer or element to edit vector properties</div>
                                    </div>
                                    
                                    <div className="space-y-2.5 border-t border-gray-800 pt-3">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Quick Tips</div>
                                        <ul className="space-y-1.5 text-[11px] list-disc list-inside leading-relaxed pl-1">
                                            <li>Click and hold any element to drag it on the page.</li>
                                            <li>Use the Document Type switcher at top to switch between Certificate & Transcript.</li>
                                            <li>Hold <span className="font-semibold text-gray-300 font-mono">Shift</span> key to select multiple elements.</li>
                                            <li>Drag the **right border handle** on canvas to resize wrap width.</li>
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

export default function CertificateDesignPage() {
    return <UnifiedDocumentStudioPage initialDocType="Certificate" />;
}
