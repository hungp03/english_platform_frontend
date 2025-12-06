"use client";
import CopyButton from "@/components/ui/copy-button";

export default function MediaItem({ item, onDelete }) {
  const { url, name, kind, contentType } = item || {};
  const isAudio = kind === "audio" || (contentType && contentType.startsWith("audio/"));
  const isVideo = kind === "video" || (contentType && contentType.startsWith("video/"));

  return (
    <div className="flex gap-3 items-start p-3 border rounded-2xl">
      <div className="w-44 h-28 shrink-0 overflow-hidden rounded-xl border bg-white flex items-center justify-center p-2">
        {url ? (
          isAudio ? (
            <audio controls className="w-full">
              <source src={url} type={contentType || "audio/mpeg"} />
              Your browser does not support the audio element.
            </audio>
          ) : isVideo ? (
            <video controls className="w-full h-full">
              <source src={url} type={contentType || "video/mp4"} />
              Your browser does not support the video tag.
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={name || "media"} className="object-cover w-full h-full" />
          )
        ) : (
          <div className="text-xs text-gray-400">No preview</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name || url}</div>
        <div className="mt-1">
          <code className="text-xs break-all">{url || "(no url returned by backend)"}</code>
        </div>

        <div className="flex gap-2 mt-3">
          {url && (
            <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-xl border text-sm hover:bg-gray-50">
              View
            </a>
          )}
          {url && <CopyButton text={url} label="Copy URL" />}
          {url && (
            <button
              type="button"
              onClick={() => onDelete?.(item)}
              className="px-3 py-1 rounded-xl border text-sm hover:bg-red-50 text-red-600"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
