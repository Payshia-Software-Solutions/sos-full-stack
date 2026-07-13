"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Plus, Edit, Trash2, Check, X, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourseContentModules, createCourseContentModule, updateCourseContentModule, deleteCourseContentModule } from "@/lib/actions/courses";
import type { CourseContentModule } from "@/lib/types";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ManageModulesDialogProps {
  courseCode: string;
}

export function ManageModulesDialog({ courseCode }: ManageModulesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: modules, isLoading } = useQuery<CourseContentModule[]>({
    queryKey: ['courseModules', courseCode],
    queryFn: () => getCourseContentModules(courseCode),
    enabled: isOpen && !!courseCode,
  });

  const createMutation = useMutation({
    mutationFn: createCourseContentModule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseModules', courseCode] });
      setNewName("");
      setNewDesc("");
      setIsAdding(false);
      toast({ title: "Module Created", description: "The new module has been added." });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to create module." })
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateCourseContentModule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseModules', courseCode] });
      setEditingId(null);
      toast({ title: "Module Updated", description: "The module has been updated." });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to update module." })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCourseContentModule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseModules', courseCode] });
      toast({ title: "Module Deleted", description: "The module and its contents were removed." });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to delete module." })
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate({
      course_code: courseCode,
      title_name: newName,
      title_description: newDesc,
      created_by: user?.username || "Admin"
    });
  };

  const handleUpdate = (id: string) => {
    if (!editName.trim()) return;
    updateMutation.mutate({
      id,
      data: { title_name: editName, title_description: editDesc }
    });
  };

  const startEdit = (mod: CourseContentModule) => {
    setEditingId(mod.id);
    setEditName(mod.title_name);
    setEditDesc(mod.title_description || "");
    setIsAdding(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={!courseCode} className="ml-2">
          <Settings className="w-4 h-4 mr-2" />
          Manage Modules
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Modules for {courseCode}</DialogTitle>
          <DialogDescription>
            Add new modules (e.g., "Week 1", "Chapter 5") or edit existing ones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Add New Section */}
          {!isAdding ? (
            <Button variant="secondary" onClick={() => { setIsAdding(true); setEditingId(null); }} className="w-full border-dashed border-2">
              <Plus className="w-4 h-4 mr-2" /> Add New Module
            </Button>
          ) : (
            <div className="bg-muted/30 p-4 rounded-lg space-y-3 border">
              <h4 className="font-medium text-sm">New Module Details</h4>
              <Input placeholder="Module Title (e.g., Week 1)" value={newName} onChange={e => setNewName(e.target.value)} />
              <Textarea placeholder="Description (Optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={2} />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button size="sm" onClick={handleCreate} disabled={createMutation.isPending || !newName.trim()}>
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Check className="w-4 h-4 mr-2" />} Save
                </Button>
              </div>
            </div>
          )}

          {/* List of Existing Modules */}
          <div className="space-y-2 mt-4">
            <h4 className="font-semibold text-sm text-muted-foreground">Existing Modules</h4>
            {isLoading ? (
              <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground"/></div>
            ) : modules?.length === 0 ? (
              <p className="text-sm text-center py-4 text-muted-foreground">No modules found. Create one above.</p>
            ) : (
              modules?.map(mod => (
                <div key={mod.id} className="border rounded-md p-3 flex flex-col gap-2">
                  {editingId === mod.id ? (
                    <div className="space-y-2">
                      <Input value={editName} onChange={e => setEditName(e.target.value)} />
                      <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={2} />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}><X className="w-4 h-4" /></Button>
                        <Button size="sm" onClick={() => handleUpdate(mod.id)} disabled={updateMutation.isPending}>
                          {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{mod.title_name}</h5>
                        {mod.title_description && <p className="text-xs text-muted-foreground mt-1">{mod.title_description}</p>}
                      </div>
                      <div className="flex gap-1 ml-4 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(mod)} className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                           variant="ghost" 
                           size="icon" 
                           onClick={() => {
                             if(confirm("Are you sure? This will delete all course content under this module as well.")) {
                               deleteMutation.mutate(mod.id);
                             }
                           }} 
                           className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
