// // // "use client";
// // // import { useEffect, useState } from "react";
// // // import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// // // import { Pagination } from "@/components/ui/pagination";
// // // import { Input } from "@/components/ui/input";
// // // import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// // // import { Button } from "@/components/ui/button";
// // // import { getSavedThreads, getForumCategories, toggleSaveThread } from "@/lib/api/forum";
// // // import Link from "next/link";
// // // import { toast } from "sonner";
// // // import { BookmarkX, Search, Filter } from "lucide-react";
// // // import useDebouncedValue from "@/hooks/use-debounced-value";

// // // export default function SavedThreads() {
// // //   const [items, setItems] = useState([]);
// // //   const [meta, setMeta] = useState({ page: 1, pages: 0 });
// // //   const [page, setPage] = useState(0);
// // //   const [cats, setCats] = useState([]);
// // //   const [loading, setLoading] = useState(true);
  
// // //   // Filters state
// // //   const [keyword, setKeyword] = useState("");
// // //   const [categoryId, setCategoryId] = useState("all");
  
// // //   // Debounce keyword để tránh gọi API quá nhiều
// // //   const debouncedKeyword = useDebouncedValue(keyword, 500); 
// // //   const pageSize = 20;

// // //   // Load danh mục để filter
// // //   useEffect(() => {
// // //     async function loadCategories() {
// // //       const result = await getForumCategories();
// // //       if (result.success) {
// // //         setCats(result.data);
// // //       }
// // //     }
// // //     loadCategories();
// // //   }, []);

// // //   // Hàm load dữ liệu chính
// // //   async function load() {
// // //     setLoading(true);
// // //     try {
// // //       const params = {
// // //         page: page + 1,
// // //         pageSize,
// // //       };
      
// // //       if (debouncedKeyword.trim()) params.keyword = debouncedKeyword.trim();
// // //       if (categoryId !== "all") params.categoryId = categoryId;

// // //       const result = await getSavedThreads(params);
      
// // //       if (result.success) {
// // //         const data = result.data;
// // //         setItems(data?.content || data?.result || []);
// // //         setMeta(data?.meta || { page: page + 1, pages: data?.totalPages || 0 });
// // //       } else {
// // //         toast.error(result.error || "Không tải được danh sách đã lưu");
// // //         setItems([]);
// // //       }
// // //     } catch (err) {
// // //       console.error("Lỗi tải trang đã lưu:", err);
// // //       toast.error("Lỗi hệ thống");
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }

// // //   // Reload khi page hoặc filter thay đổi
// // //   useEffect(() => {
// // //     load();
// // //   }, [page, debouncedKeyword, categoryId]);

// // //   // Reset page về 0 khi filter thay đổi
// // //   useEffect(() => {
// // //     setPage(0);
// // //   }, [debouncedKeyword, categoryId]);

// // //   // Xử lý bỏ lưu nhanh
// // //   const handleUnsave = async (id, e) => {
// // //     e.preventDefault(); // Ngăn chặn click vào link bài viết
// // //     e.stopPropagation();
    
// // //     if(!confirm("Bạn muốn bỏ lưu bài viết này khỏi danh sách?")) return;

// // //     try {
// // //       const res = await toggleSaveThread(id);
// // //       if (res.success) {
// // //         toast.success("Đã bỏ lưu bài viết");
// // //         // Xóa item khỏi UI ngay lập tức
// // //         setItems(prev => prev.filter(item => item.id !== id));
// // //         // Nếu trang trống thì reload lại để lấy data mới hoặc lùi trang
// // //         if (items.length === 1 && page > 0) setPage(page - 1);
// // //       } else {
// // //         toast.error(res.error);
// // //       }
// // //     } catch (error) {
// // //       toast.error("Lỗi khi bỏ lưu");
// // //     }
// // //   };

// // //   return (
// // //     <div className="space-y-4">
// // //       <div className="flex items-center justify-between">
// // //         <h2 className="text-2xl font-bold">Bài viết đã lưu</h2>
// // //         <Link href="/account">
// // //             <Button variant="outline">Quay lại tài khoản</Button>
// // //         </Link>
// // //       </div>

// // //       {/* --- Filter Bar --- */}
// // //       <Card>
// // //         <CardContent className="p-4">
// // //           <div className="flex flex-col md:flex-row gap-3">
// // //             <div className="relative flex-1">
// // //               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
// // //               <Input
// // //                 placeholder="Tìm trong bài đã lưu..."
// // //                 className="pl-9"
// // //                 value={keyword}
// // //                 onChange={(e) => setKeyword(e.target.value)}
// // //               />
// // //             </div>
            
// // //             <div className="w-full md:w-[250px]">
// // //               <Select value={categoryId} onValueChange={setCategoryId}>
// // //                 <SelectTrigger>
// // //                   <div className="flex items-center gap-2">
// // //                     <Filter className="h-4 w-4 text-muted-foreground" />
// // //                     <SelectValue placeholder="Danh mục" />
// // //                   </div>
// // //                 </SelectTrigger>
// // //                 <SelectContent>
// // //                   <SelectItem value="all">Tất cả danh mục</SelectItem>
// // //                   {cats.map((c) => (
// // //                     <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
// // //                   ))}
// // //                 </SelectContent>
// // //               </Select>
// // //             </div>
// // //           </div>
// // //         </CardContent>
// // //       </Card>

// // //       {/* --- List Content --- */}
// // //       <Card>
// // //         <CardContent className="p-0">
// // //           {loading ? (
// // //              <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>
// // //           ) : items.length > 0 ? (
// // //             <div className="divide-y">
// // //               {items.map((t) => (
// // //                 <div key={t.id} className="p-4 hover:bg-muted/40 transition-colors flex gap-4 group">
// // //                   <div className="flex-1 min-w-0">
// // //                     <div className="flex items-center gap-2 mb-1">
// // //                       {t.categories?.map(c => (
// // //                         <span key={c.id} className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded border">
// // //                           {c.name}
// // //                         </span>
// // //                       ))}
// // //                       <span className="text-xs text-muted-foreground ml-auto">
// // //                         {t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : ""}
// // //                       </span>
// // //                     </div>
                    
// // //                     <Link href={`/forum/${t.slug}`} className="block group-hover:text-primary transition-colors">
// // //                       <h3 className="font-semibold truncate text-base">{t.title}</h3>
// // //                     </Link>
                    
// // //                     <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
// // //                       <div className="flex items-center gap-1">
// // //                         <img 
// // //                           src={t.authorAvatarUrl || "/avatar.svg"} 
// // //                           className="w-4 h-4 rounded-full" 
// // //                           alt="" 
// // //                         />
// // //                         <span>{t.authorName || "Ẩn danh"}</span>
// // //                       </div>
// // //                       <span>•</span>
// // //                       <span>{t.viewCount} lượt xem</span>
// // //                       <span>•</span>
// // //                       <span>{t.replyCount} trả lời</span>
// // //                     </div>
// // //                   </div>

// // //                   <div className="flex items-start">
// // //                     <Button
// // //                       variant="ghost"
// // //                       size="icon"
// // //                       className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
// // //                       onClick={(e) => handleUnsave(t.id, e)}
// // //                       title="Bỏ lưu"
// // //                     >
// // //                       <BookmarkX className="h-5 w-5" />
// // //                     </Button>
// // //                   </div>
// // //                 </div>
// // //               ))}
// // //             </div>
// // //           ) : (
// // //             <div className="text-center py-12">
// // //               <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
// // //                 <BookmarkX className="h-6 w-6 text-muted-foreground" />
// // //               </div>
// // //               <h3 className="text-lg font-medium">Chưa có bài viết nào</h3>
// // //               <p className="text-muted-foreground mt-1">
// // //                 Các bài viết bạn lưu sẽ xuất hiện tại đây.
// // //               </p>
// // //               <div className="mt-4">
// // //                 <Link href="/forum">
// // //                     <Button>Dạo một vòng diễn đàn</Button>
// // //                 </Link>
// // //               </div>
// // //             </div>
// // //           )}
// // //         </CardContent>
// // //       </Card>

// // //       {meta?.pages > 1 && (
// // //         <Pagination
// // //           currentPage={page}
// // //           totalPages={meta?.pages ?? 0}
// // //           onPageChange={(p) => setPage(p)}
// // //         />
// // //       )}
// // //     </div>
// // //   );
// // // }
// // "use client";
// // import { useEffect, useState } from "react";
// // import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// // import { Pagination } from "@/components/ui/pagination"; // Giả sử component này nhận currentPage base 1
// // import { Input } from "@/components/ui/input";
// // import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
// // import { Button } from "@/components/ui/button";
// // import {
// //   AlertDialog,
// //   AlertDialogAction,
// //   AlertDialogCancel,
// //   AlertDialogContent,
// //   AlertDialogDescription,
// //   AlertDialogFooter,
// //   AlertDialogHeader,
// //   AlertDialogTitle,
// //   AlertDialogTrigger,
// // } from "@/components/ui/alert-dialog";
// // import { getSavedThreads, getForumCategories, toggleSaveThread } from "@/lib/api/forum";
// // import Link from "next/link";
// // import { toast } from "sonner";
// // import { BookmarkX, Search, Filter } from "lucide-react";
// // import useDebouncedValue from "@/hooks/use-debounced-value";

// // export default function SavedThreads() {
// //   const [items, setItems] = useState([]);
// //   const [meta, setMeta] = useState({ page: 1, pages: 0 });
  
// //   // FIX: Đổi page base thành 1 (mặc định trang đầu tiên là 1)
// //   const [page, setPage] = useState(1);
// //   const [cats, setCats] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   // Filters state
// //   const [keyword, setKeyword] = useState("");
// //   const [categoryId, setCategoryId] = useState("all");

// //   const debouncedKeyword = useDebouncedValue(keyword, 500);
// //   const pageSize = 20;

// //   // Load danh mục
// //   useEffect(() => {
// //     async function loadCategories() {
// //       const result = await getForumCategories();
// //       if (result.success) {
// //         setCats(result.data);
// //       }
// //     }
// //     loadCategories();
// //   }, []);

// //   // Hàm load dữ liệu chính
// //   async function load() {
// //     setLoading(true);
// //     try {
// //       const params = {
// //         page: page, // FIX: Giữ nguyên page (base 1)
// //         pageSize,
// //       };

// //       if (debouncedKeyword.trim()) params.keyword = debouncedKeyword.trim();
// //       if (categoryId !== "all") params.categoryId = categoryId;

// //       const result = await getSavedThreads(params);

// //       if (result.success) {
// //         const data = result.data;
// //         setItems(data?.content || data?.result || []);
// //         // Meta page từ API trả về thường cũng khớp với request
// //         setMeta(data?.meta || { page: page, pages: data?.totalPages || 0 });
// //       } else {
// //         toast.error(result.error || "Không tải được danh sách đã lưu");
// //         setItems([]);
// //       }
// //     } catch (err) {
// //       console.error("Lỗi tải trang đã lưu:", err);
// //       toast.error("Lỗi hệ thống");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   // Reload khi page hoặc filter thay đổi
// //   useEffect(() => {
// //     load();
// //   }, [page, debouncedKeyword, categoryId]);

// //   // FIX: Reset page về 1 khi filter thay đổi
// //   useEffect(() => {
// //     setPage(1);
// //   }, [debouncedKeyword, categoryId]);

// //   // Xử lý logic gọi API xóa (được gọi từ AlertDialogAction)
// //   const onConfirmUnsave = async (id) => {
// //     try {
// //       const res = await toggleSaveThread(id);
// //       if (res.success) {
// //         toast.success("Đã bỏ lưu bài viết");
        
// //         // Xóa item khỏi UI
// //         setItems((prev) => prev.filter((item) => item.id !== id));
        
// //         // FIX: Logic lùi trang nếu xóa hết item ở trang hiện tại (và không phải trang 1)
// //         if (items.length === 1 && page > 1) {
// //           setPage(page - 1);
// //         } else if (items.length === 1 && page === 1) {
// //              // Nếu là trang 1 và xóa hết thì reload để clear state hoặc hiển thị empty
// //              load(); 
// //         }
// //       } else {
// //         toast.error(res.error);
// //       }
// //     } catch (error) {
// //       toast.error("Lỗi khi bỏ lưu");
// //     }
// //   };

// //   return (
// //     <div className="space-y-4">
// //       <div className="flex items-center justify-between">
// //         <h2 className="text-2xl font-bold">Bài viết đã lưu</h2>
// //         <Link href="/account">
// //           <Button variant="outline">Quay lại tài khoản</Button>
// //         </Link>
// //       </div>

// //       {/* --- Filter Bar --- */}
// //       <Card>
// //         <CardContent className="p-4">
// //           <div className="flex flex-col md:flex-row gap-3">
// //             <div className="relative flex-1">
// //               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
// //               <Input
// //                 placeholder="Tìm trong bài đã lưu..."
// //                 className="pl-9"
// //                 value={keyword}
// //                 onChange={(e) => setKeyword(e.target.value)}
// //               />
// //             </div>

// //             <div className="w-full md:w-[250px]">
// //               <Select value={categoryId} onValueChange={setCategoryId}>
// //                 <SelectTrigger>
// //                   <div className="flex items-center gap-2">
// //                     <Filter className="h-4 w-4 text-muted-foreground" />
// //                     <SelectValue placeholder="Danh mục" />
// //                   </div>
// //                 </SelectTrigger>
// //                 <SelectContent>
// //                   <SelectItem value="all">Tất cả danh mục</SelectItem>
// //                   {cats.map((c) => (
// //                     <SelectItem key={c.id} value={c.id}>
// //                       {c.name}
// //                     </SelectItem>
// //                   ))}
// //                 </SelectContent>
// //               </Select>
// //             </div>
// //           </div>
// //         </CardContent>
// //       </Card>

// //       {/* --- List Content --- */}
// //       <Card>
// //         <CardContent className="p-0">
// //           {loading ? (
// //             <div className="p-8 text-center text-muted-foreground">
// //               Đang tải dữ liệu...
// //             </div>
// //           ) : items.length > 0 ? (
// //             <div className="divide-y">
// //               {items.map((t) => (
// //                 <div
// //                   key={t.id}
// //                   className="p-4 hover:bg-muted/40 transition-colors flex gap-4 group"
// //                 >
// //                   <div className="flex-1 min-w-0">
// //                     <div className="flex items-center gap-2 mb-1">
// //                       {t.categories?.map((c) => (
// //                         <span
// //                           key={c.id}
// //                           className="text-[10px] px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded border"
// //                         >
// //                           {c.name}
// //                         </span>
// //                       ))}
// //                       <span className="text-xs text-muted-foreground ml-auto">
// //                         {t.createdAt
// //                           ? new Date(t.createdAt).toLocaleDateString("vi-VN")
// //                           : ""}
// //                       </span>
// //                     </div>

// //                     <Link
// //                       href={`/forum/${t.slug}`}
// //                       className="block group-hover:text-primary transition-colors"
// //                     >
// //                       <h3 className="font-semibold truncate text-base">
// //                         {t.title}
// //                       </h3>
// //                     </Link>

// //                     <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
// //                       <div className="flex items-center gap-1">
// //                         <img
// //                           src={t.authorAvatarUrl || "/avatar.svg"}
// //                           className="w-4 h-4 rounded-full"
// //                           alt=""
// //                         />
// //                         <span>{t.authorName || "Ẩn danh"}</span>
// //                       </div>
// //                       <span>•</span>
// //                       <span>{t.viewCount} lượt xem</span>
// //                       <span>•</span>
// //                       <span>{t.replyCount} trả lời</span>
// //                     </div>
// //                   </div>

// //                   <div className="flex items-start">
// //                     {/* --- Replace confirm with AlertDialog --- */}
// //                     <AlertDialog>
// //                       <AlertDialogTrigger asChild>
// //                         <Button
// //                           variant="ghost"
// //                           size="icon"
// //                           className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
// //                           title="Bỏ lưu"
// //                           // Quan trọng: Ngăn chặn click lan ra thẻ cha (Link bài viết)
// //                           onClick={(e) => e.stopPropagation()} 
// //                         >
// //                           <BookmarkX className="h-5 w-5" />
// //                         </Button>
// //                       </AlertDialogTrigger>
// //                       <AlertDialogContent>
// //                         <AlertDialogHeader>
// //                           <AlertDialogTitle>Bỏ lưu bài viết?</AlertDialogTitle>
// //                           <AlertDialogDescription>
// //                             Bạn có chắc chắn muốn xóa bài viết "<b>{t.title}</b>" khỏi danh sách đã lưu không?
// //                           </AlertDialogDescription>
// //                         </AlertDialogHeader>
// //                         <AlertDialogFooter>
// //                           <AlertDialogCancel>Hủy</AlertDialogCancel>
// //                           <AlertDialogAction 
// //                             onClick={() => onConfirmUnsave(t.id)}
// //                             className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
// //                           >
// //                             Bỏ lưu
// //                           </AlertDialogAction>
// //                         </AlertDialogFooter>
// //                       </AlertDialogContent>
// //                     </AlertDialog>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           ) : (
// //             <div className="text-center py-12">
// //               <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
// //                 <BookmarkX className="h-6 w-6 text-muted-foreground" />
// //               </div>
// //               <h3 className="text-lg font-medium">Chưa có bài viết nào</h3>
// //               <p className="text-muted-foreground mt-1">
// //                 Các bài viết bạn lưu sẽ xuất hiện tại đây.
// //               </p>
// //               <div className="mt-4">
// //                 <Link href="/forum">
// //                   <Button>Dạo một vòng diễn đàn</Button>
// //                 </Link>
// //               </div>
// //             </div>
// //           )}
// //         </CardContent>
// //       </Card>

// //       {meta?.pages > 1 && (
// //         <Pagination
// //           currentPage={page}
// //           totalPages={meta?.pages ?? 0}
// //           onPageChange={(p) => setPage(p)}
// //         />
// //       )}
// //     </div>
// //   );
// // }

// "use client";
// import { useEffect, useState } from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Pagination } from "@/components/ui/pagination";
// import { Button } from "@/components/ui/button";
// import ThreadListFilters from "@/components/forum/thread-list-filters"; // Tái sử dụng bộ lọc
// import { getSavedThreads, getForumCategories, toggleSaveThread } from "@/lib/api/forum";
// import Link from "next/link";
// import { toast } from "sonner";
// import { BookmarkX, Eye, MessageSquare, Clock } from "lucide-react";
// import { UserAvatar } from "@/components/ui/user-avatar";

// export default function SavedThreads() {
//   const [items, setItems] = useState([]);
//   const [meta, setMeta] = useState({ page: 1, pages: 0 });
//   const [page, setPage] = useState(0);
//   const [filters, setFilters] = useState(null); // Filter state
//   const [cats, setCats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const pageSize = 20;

//   // Load danh mục để truyền vào bộ lọc
//   useEffect(() => {
//     async function loadCategories() {
//       const result = await getForumCategories();
//       if (result.success) setCats(result.data);
//     }
//     loadCategories();
//   }, []);

//   // Hàm load dữ liệu chính
//   async function load(p = page, f = filters) {
//     setLoading(true);
//     try {
//       // Backend đã hỗ trợ params: keyword, categoryId
//       const result = await getSavedThreads({
//         ...f,
//         page: p + 1,
//         pageSize,
//       });
      
//       if (result.success) {
//         const data = result.data;
//         setItems(data?.content || data?.result || []);
//         setMeta(data?.meta || { page: p + 1, pages: data?.totalPages || 0 });
//       } else {
//         toast.error(result.error || "Không tải được danh sách đã lưu");
//         setItems([]);
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Lỗi hệ thống");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Reload khi page hoặc filters thay đổi
//   useEffect(() => {
//     if (filters !== null) {
//       load(page, filters);
//     }
//   }, [page, filters]);

//   // Reset về trang 1 khi đổi bộ lọc
//   const handleFilterChange = (newFilters) => {
//     setFilters(newFilters);
//     setPage(0);
//   };

//   // Xử lý bỏ lưu nhanh tại danh sách
//   const handleUnsave = async (e, id) => {
//     e.preventDefault(); 
//     e.stopPropagation();
    
//     if(!confirm("Bạn có chắc muốn bỏ lưu bài viết này?")) return;

//     try {
//       const res = await toggleSaveThread(id);
//       if (res.success) {
//         toast.success("Đã bỏ lưu bài viết");
//         // Xóa khỏi danh sách hiện tại
//         setItems(prev => prev.filter(item => item.id !== id));
//         // Nếu xóa hết trang hiện tại, lùi về trang trước
//         if (items.length === 1 && page > 0) setPage(page - 1);
//       } else {
//         toast.error(res.error);
//       }
//     } catch (error) {
//       toast.error("Lỗi khi bỏ lưu");
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         <h2 className="text-2xl font-bold">Bài viết đã lưu</h2>
//         <Link href="/account">
//             <Button variant="outline">Quay lại tài khoản</Button>
//         </Link>
//       </div>

//       {/* --- Bộ lọc (Tái sử dụng) --- */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Bộ lọc</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <ThreadListFilters categories={cats} onChange={handleFilterChange} />
//         </CardContent>
//       </Card>

//       {/* --- Danh sách bài viết --- */}
//       <Card>
//         <CardContent className="p-0">
//           {loading ? (
//              <div className="p-8 text-center text-muted-foreground">Đang tải dữ liệu...</div>
//           ) : items.length > 0 ? (
//             <div className="divide-y">
//               {items.map((t) => (
//                 <div key={t.id} className="p-4 hover:bg-muted/40 transition-colors flex gap-4 group items-start">
//                   {/* Nội dung bài viết */}
//                   <div className="flex-1 min-w-0">
//                     <Link href={`/forum/${t.slug}`} className="block group-hover:text-primary transition-colors">
//                       <h3 className="font-semibold truncate text-lg mb-1">{t.title}</h3>
//                     </Link>
                    
//                     <div className="flex flex-wrap gap-2 mb-2">
//                       {t.categories?.map(c => (
//                         <span key={c.id} className="text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full border">
//                           {c.name}
//                         </span>
//                       ))}
//                     </div>

//                     <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
//                       <div className="flex items-center gap-1">
//                         <UserAvatar 
//                           src={t.authorAvatarUrl} 
//                           name={t.authorName}
//                           className="w-4 h-4" 
//                         />
//                         <span>{t.authorName || "Ẩn danh"}</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <Clock size={12} />
//                         <span>{t.createdAt ? new Date(t.createdAt).toLocaleDateString('vi-VN') : ""}</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <Eye size={12} />
//                         <span>{t.viewCount}</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <MessageSquare size={12} />
//                         <span>{t.replyCount}</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Nút Bỏ lưu */}
//                   <div className="flex-shrink-0">
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
//                       onClick={(e) => handleUnsave(e, t.id)}
//                       title="Bỏ lưu"
//                     >
//                       <BookmarkX className="h-5 w-5" />
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-12">
//               <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
//                 <BookmarkX className="h-6 w-6 text-muted-foreground" />
//               </div>
//               <h3 className="text-lg font-medium">Chưa có bài viết nào</h3>
//               <p className="text-muted-foreground mt-1">
//                 Các bài viết bạn lưu sẽ xuất hiện tại đây.
//               </p>
//               <div className="mt-4">
//                 <Link href="/forum">
//                     <Button>Dạo một vòng diễn đàn</Button>
//                 </Link>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {meta?.pages > 1 && (
//         <Pagination
//           currentPage={page}
//           totalPages={meta?.pages ?? 0}
//           onPageChange={(p) => setPage(p)}
//         />
//       )}
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ThreadListFilters from "@/components/forum/thread-list-filters";
import { getSavedThreads, getForumCategories, toggleSaveThread } from "@/lib/api/forum";
import Link from "next/link";
import { toast } from "sonner";
import { BookmarkX, Eye, MessageSquare, Clock } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";

export default function SavedThreads() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0 });
  
  // FIX: Đổi page base thành 1
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(null);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  // Load danh mục
  useEffect(() => {
    async function loadCategories() {
      const result = await getForumCategories();
      if (result.success) setCats(result.data);
    }
    loadCategories();
  }, []);

  // Hàm load dữ liệu chính
  async function load(p = page, f = filters) {
    setLoading(true);
    try {
      const result = await getSavedThreads({
        ...f,
        page: p, // FIX: Giữ nguyên p (vì đã base 1)
        pageSize,
      });

      if (result.success) {
        const data = result.data;
        setItems(data?.content || data?.result || []);
        // Meta page từ API trả về
        setMeta(data?.meta || { page: p, pages: data?.totalPages || 0 });
      } else {
        toast.error(result.error || "Không tải được danh sách đã lưu");
        setItems([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  }

  // Reload khi page hoặc filters thay đổi
  useEffect(() => {
    if (filters !== null) {
      load(page, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  // FIX: Reset về trang 1 khi đổi bộ lọc
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Xử lý logic gọi API xóa (được gọi từ AlertDialogAction)
  const onConfirmUnsave = async (id) => {
    try {
      const res = await toggleSaveThread(id);
      if (res.success) {
        toast.success("Đã bỏ lưu bài viết");
        
        // Xóa item khỏi UI
        setItems((prev) => prev.filter((item) => item.id !== id));
        
        // FIX: Logic lùi trang nếu xóa hết item
        if (items.length === 1 && page > 1) {
          setPage(page - 1);
        } else if (items.length === 1 && page === 1) {
          // Nếu trang 1 xóa hết thì reload để hiện empty state
          load(1, filters);
        }
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Lỗi khi bỏ lưu");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bài viết đã lưu</h2>
        <Link href="/account">
          <Button variant="outline">Quay lại tài khoản</Button>
        </Link>
      </div>

      {/* --- Bộ lọc --- */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <ThreadListFilters categories={cats} onChange={handleFilterChange} />
        </CardContent>
      </Card>

      {/* --- Danh sách bài viết --- */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Đang tải dữ liệu...
            </div>
          ) : items.length > 0 ? (
            <div className="divide-y">
              {items.map((t) => (
                <div
                  key={t.id}
                  className="p-4 hover:bg-muted/40 transition-colors flex gap-4 group items-start"
                >
                  {/* Nội dung bài viết */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/forum/${t.slug}`}
                      className="block group-hover:text-primary transition-colors"
                    >
                      <h3 className="font-semibold truncate text-lg mb-1">
                        {t.title}
                      </h3>
                    </Link>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {t.categories?.map((c) => (
                        <span
                          key={c.id}
                          className="text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full border"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <UserAvatar
                          src={t.authorAvatarUrl}
                          name={t.authorName}
                          className="w-4 h-4"
                        />
                        <span>{t.authorName || "Ẩn danh"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>
                          {t.createdAt
                            ? new Date(t.createdAt).toLocaleDateString("vi-VN")
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{t.viewCount}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        <span>{t.replyCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Nút Bỏ lưu với AlertDialog */}
                  <div className="flex-shrink-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                          title="Bỏ lưu"
                          // FIX: Ngăn chặn click lan ra ngoài (quan trọng)
                          onClick={(e) => e.stopPropagation()}
                        >
                          <BookmarkX className="h-5 w-5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bỏ lưu bài viết?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc chắn muốn bỏ lưu bài viết "<b>{t.title}</b>" không?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onConfirmUnsave(t.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Bỏ lưu
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <BookmarkX className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">Chưa có bài viết nào</h3>
              <p className="text-muted-foreground mt-1">
                Các bài viết bạn lưu sẽ xuất hiện tại đây.
              </p>
              <div className="mt-4">
                <Link href="/forum">
                  <Button>Dạo một vòng diễn đàn</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {meta?.pages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={meta?.pages ?? 0}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
}