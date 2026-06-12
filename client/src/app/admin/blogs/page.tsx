"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchBlogs = async () => {
        try {
            const res = await fetch("http://localhost/sos-full-stack/server/api/blogs");
            const data = await res.json();
            if (data.success) {
                setBlogs(data.blogs);
            }
        } catch (error) {
            console.error("Failed to fetch blogs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const deleteBlog = async (id: number) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        try {
            const res = await fetch(`http://localhost/sos-full-stack/server/api/blogs/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (data.success) {
                setBlogs(blogs.filter((b) => b.id !== id));
            } else {
                alert(data.message || "Failed to delete");
            }
        } catch (error) {
            console.error("Failed to delete blog:", error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Blogs</h1>
                <Link href="/admin/blogs/create">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" /> Create Blog
                    </Button>
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Loading blogs...
                                </TableCell>
                            </TableRow>
                        ) : blogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    No blogs found. Create your first blog!
                                </TableCell>
                            </TableRow>
                        ) : (
                            blogs.map((blog) => (
                                <TableRow key={blog.id}>
                                    <TableCell className="font-medium">
                                        {blog.image_url && (
                                            <img 
                                                src={blog.image_url.startsWith('http') ? blog.image_url : `https://content-provider.pharmacollege.lk/content-provider/uploads/blogs/${blog.image_url}`} 
                                                alt={blog.title} 
                                                className="w-12 h-12 rounded object-cover mb-2"
                                            />
                                        )}
                                        {blog.title}
                                    </TableCell>
                                    <TableCell>{blog.slug}</TableCell>
                                    <TableCell>{blog.author}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                            {blog.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{new Date(blog.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/blogs/${blog.id}/edit`}>
                                            <Button variant="ghost" size="icon">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" onClick={() => deleteBlog(blog.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
