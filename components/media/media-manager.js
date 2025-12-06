"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { deleteMediaByUrl, uploadMedia, listMedia, deleteMediaFolder } from "@/lib/api/media";
import MediaItem from "@/components/media/media-item";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";


const DEFAULT_LIST_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "mp3", "wav", "m4a", "ogg", "mp4", "webm", "mkv"];


function normalizeItem(entry) {
  const url = typeof entry === "string" ? entry : (entry?.url || entry?.publicUrl || entry?.location);
  const filename = entry?.filename || entry?.name || (url ? url.split("/").pop()?.split("?")[0] : undefined);
  const contentType = entry?.contentType || "";
  const size = entry?.fileSize || entry?.size;
  const lower = (filename || url || "").toLowerCase();
  const ext = lower.split(".").pop() || "";
  const kind = contentType.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? "image"
    : contentType.startsWith("audio/") || ["mp3", "wav", "m4a", "ogg"].includes(ext) ? "audio"
      : contentType.startsWith("video/") || ["mp4", "webm", "mkv"].includes(ext) ? "video"
        : "file";
  return { url, name: filename || url, size, contentType, kind };
}


export default function MediaManager({ folder = "uploads", initial = [] }) {
  const [items, setItems] = useState(initial.map(normalizeItem));
  const [busy, setBusy] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef(null);


  const exts = useMemo(() => DEFAULT_LIST_EXTENSIONS, []);


  async function fetchFolderList() {
    setLoadingList(true);
    try {
      const { success, data, error } = await listMedia(folder, exts);
      if (!success) throw new Error(error || "List failed");
      const normalized = (Array.isArray(data) ? data : (data?.result || data?.items || [])).map(normalizeItem);
      const map = new Map();
      [...normalized, ...items].forEach(it => { if (it?.url) map.set(it.url, it); });
      setItems([...map.values()]);
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Không lấy được danh sách file");
    } finally {
      setLoadingList(false);
    }
  }


  useEffect(() => {
    fetchFolderList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder]);


  async function handleFiles(files) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const newItems = [];
      for (const f of files) {
        if (f.type && !f.type.startsWith("image/") && !f.type.startsWith("audio/")) continue;
        const { success, data, error } = await uploadMedia(f, folder);
        if (!success) throw new Error(error || "Upload failed");

        const url = data?.url;
        const name = data?.filename || data?.originalFilename || data?.name || f.name;
        const size = data?.fileSize ?? f.size;
        const contentType = data?.contentType || f.type || "";
        const kind = contentType?.startsWith("image/") ? "image" : (contentType?.startsWith("audio/") ? "audio" : "file");
        newItems.push({ url, name, size, contentType, kind });
      }

      setItems(prev => {
        const map = new Map();
        [...newItems, ...prev].forEach(it => { if (it?.url) map.set(it.url, it); });
        return [...map.values()];
      });

      toast.success("Upload thành công!");
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }


  async function handleDelete(item) {
    if (!item?.url) return;
    if (!confirm("Delete this file?")) return;
    try {
      const { success, error } = await deleteMediaByUrl(item.url);
      if (!success) throw new Error(error || "Delete failed");
      setItems(prev => prev.filter(it => it.url !== item.url));
      toast.success("Đã xóa file");
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Delete failed");
    }
  }


  async function handleDeleteFolder() {
    if (!confirm(`Xóa toàn bộ folder "${folder}" và tất cả file bên trong?`)) return;
    try {
      const { success, error } = await deleteMediaFolder(folder);
      if (!success) throw new Error(error || "Delete folder failed");
      setItems([]);
      toast.success("Đã xóa toàn bộ folder.");
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Delete folder failed");
    }
  }


  return (
    <div className="space-y-4">
      {/* Header với nút collapse/expand */}
      <div className="rounded-2xl border p-4">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition"
        >
          <div className="flex items-center gap-3">
            <div>
              <div className="font-semibold text-left">Media Uploader Tool</div>
            </div>
          </div>
          <div className="shrink-0">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {/* Content - hiển thị khi expanded */}
        {isExpanded && (
          <>
            <div className="text-xs text-gray-500 mt-3 mb-4">Folder: <code>{folder}</code></div>

            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={fetchFolderList}
                  disabled={loadingList}
                  className="px-3 py-1 rounded-xl border text-sm disabled:opacity-50 hover:bg-gray-100"
                >
                  {loadingList ? "Loading..." : "Làm mới"}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteFolder}
                  className="px-3 py-1 rounded-xl border text-sm hover:bg-red-50 text-red-600"
                >
                  Xóa folder
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                ref={inputRef}
                type="file"
                accept="image/*,audio/*"
                multiple
                disabled={busy}
                onChange={e => handleFiles(Array.from(e.target.files || []))}
                className="block w-full rounded-xl border p-2"
              />
              <button
                type="button"
                disabled={busy}
                className="px-4 py-2 rounded-xl bg-blue-500 text-white disabled:opacity-50 whitespace-nowrap"
                onClick={() => inputRef.current?.click()}
              >
                {busy ? "Uploading..." : "Choose Files"}
              </button>
            </div>

            {/* Media list */}
            <div className="space-y-3 mt-4">
              {items.length === 0 ? (
                <div className="text-sm text-gray-500">Chưa có file nào trong folder.</div>
              ) : (
                items.map(it => <MediaItem key={it.url} item={it} onDelete={handleDelete} />)
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}