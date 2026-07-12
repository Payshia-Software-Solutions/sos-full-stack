"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil } from "lucide-react";

const highlightPlaceholders = (text: string) => {
  if (!text) return null;
  // Match {{VAR}}, [VAR], or {VAR}
  const parts = text.split(/(\{\{[^}]+\}\}|\[[^\]]+\]|\{[^}]+\})/g);
  return parts.map((part, i) => {
    if (part.match(/^(\{\{[^}]+\}\}|\[[^\]]+\]|\{[^}]+\})$/)) {
      return (
        <span key={i} className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 font-bold px-1 rounded">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const getPlaceholders = (templateName: string) => {
  if (templateName === 'account-activation-message') return ['{{FIRST_NAME}}', '{{COURSE_NAME}}', '{{GENERATED_USER_NAME}}', '{{TEMP_PASSWORD}}'];
  if (templateName === 'payment-update-message') return ['[STUDENT_NAME]', '[COURSE_NAME]', '[PAYMENT_AMOUNT]', '[RECEIPT_NUMBER]'];
  if (templateName === 'delivery-order-placed' || templateName === 'delivery-order-packed' || templateName === 'delivery-order-dispatched' || templateName === 'delivery-order-received') return ['{index_number}', '{delivery_item}', '{tracking_number}', '{cod_amount}'];
  if (templateName === 'ceremony-number-message') return ['{{FIRST_NAME}}', '{{CEREMONY_NUMBER}}'];
  if (templateName === 'name-on-certificate-message') return ['{{STUDENT_NUMBER}}', '{{NAME_ON_CERTIFICATE}}'];
  if (templateName === 'ceremony-due-breakdown-message') return ['{{FIRST_NAME}}', '{{COURSE_BALANCE}}', '{{CONVOCATION_BALANCE}}', '{{TOTAL_DUE}}'];
  if (templateName === 'convocation-payment-approved') return ['[STUDENT_NAME]', '[REFERENCE_NUMBER]', '[RECEIPT_NUMBER]', '[PAYMENT_AMOUNT]'];
  if (templateName === 'study-pack-not-order') return ['{{FIRST_NAME}}'];
  return ['{{FIRST_NAME}}', '[STUDENT_NAME]'];
};

export default function SmsTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateContent, setTemplateContent] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const newValue = templateContent.substring(0, start) + placeholder + templateContent.substring(end);
    setTemplateContent(newValue);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }
    }, 0);
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost/sos-full-stack/server'}/sms-templates`);
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch templates", error);
      toast({ description: "Failed to load SMS templates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleUpdate = async () => {
    if (!editingTemplate || !templateContent.trim()) {
      toast({ description: "Template content cannot be empty", variant: "destructive" });
      return;
    }

    setUpdateLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost/sos-full-stack/server'}/sms-templates/${editingTemplate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ template_content: templateContent }),
      });

      if (res.ok) {
        toast({ description: "Template updated successfully" });
        fetchTemplates();
        setEditingTemplate(null);
      } else {
        const data = await res.json();
        toast({ description: `Update failed: ${data.error || 'Unknown error'}`, variant: "destructive" });
      }
    } catch (error) {
      toast({ description: "Failed to update template due to network error", variant: "destructive" });
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Templates</h1>
          <p className="text-muted-foreground">Manage and edit the content of automated SMS messages.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
          <CardDescription>Manage your automated SMS templates. <strong className="text-amber-600">Edit with caution:</strong> Do not remove or alter dynamic placeholders like {`{{FIRST_NAME}}`} when modifying templates.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Content Snippet</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No templates found.</TableCell>
                    </TableRow>
                  ) : (
                    templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.template_name}</TableCell>
                        <TableCell className="max-w-md truncate">{template.template_content}</TableCell>
                        <TableCell className="text-right">
                          <Dialog open={editingTemplate?.id === template.id} onOpenChange={(open) => {
                            if (open) {
                              setEditingTemplate(template);
                              setTemplateContent(template.template_content);
                            } else {
                              setEditingTemplate(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline"><Pencil className="w-4 h-4 mr-2" /> Edit</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[800px] w-full">
                              <DialogHeader>
                                <DialogTitle>Edit Template</DialogTitle>
                                <DialogDescription>
                                  Editing <span className="font-mono text-primary">{template.template_name}</span>
                                  <div className="mt-3 text-amber-600 bg-amber-50 p-3 rounded-md text-sm border border-amber-200 leading-relaxed font-medium">
                                    ⚠️ <strong>Edit with caution:</strong> Please do not modify or delete the dynamic placeholders (words inside brackets like <code>{`{{FIRST_NAME}}`}</code>, <code>[STUDENT_NAME]</code>, or <code>{`{index}`}</code>). The system uses these to automatically insert the correct student data into the message.
                                  </div>
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-6 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="content" className="text-base font-semibold">Message Content</Label>
                                  <div className="relative border rounded-md overflow-hidden bg-background">
                                    <div 
                                      ref={overlayRef}
                                      className="absolute inset-0 p-3 pointer-events-none whitespace-pre-wrap break-words font-mono text-sm leading-relaxed overflow-y-auto"
                                      aria-hidden="true"
                                    >
                                      {highlightPlaceholders(templateContent + " ")}
                                    </div>
                                    <Textarea 
                                      ref={textareaRef}
                                      id="content" 
                                      className="w-full h-full min-h-[200px] p-3 font-mono text-sm leading-relaxed bg-transparent text-transparent caret-foreground relative z-10 resize-none border-0 focus-visible:ring-0"
                                      value={templateContent} 
                                      onChange={(e) => setTemplateContent(e.target.value)} 
                                      onScroll={handleScroll}
                                      spellCheck={false}
                                    />
                                  </div>
                                </div>
                                <div className="grid gap-2">
                                  <Label className="text-base font-semibold">Available Placeholders</Label>
                                  <p className="text-xs text-muted-foreground mb-1">Click a placeholder to insert it into the message at your cursor position.</p>
                                  <div className="flex flex-wrap gap-2">
                                    {getPlaceholders(editingTemplate?.template_name || '').map(ph => (
                                      <button
                                        key={ph}
                                        onClick={() => insertPlaceholder(ph)}
                                        className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded text-xs font-mono font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                      >
                                        {ph}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingTemplate(null)}>Cancel</Button>
                                <Button onClick={handleUpdate} disabled={updateLoading}>
                                  {updateLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Save Changes
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
