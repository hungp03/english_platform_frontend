"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { uploadMedia } from "@/lib/api/media";

export default function Editor({
  initialContent = "",
  onContentChange,
  useServerUpload = false, 
  uploadFolder = "forums",
}) {
  const [content, setContent] = useState(initialContent);
  const [isMounted, setIsMounted] = useState(false);
  const quillRef = useRef(null);
  const containerRef = useRef(null);

  const activeSizeRef = useRef("14pt");

  // State cho image upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  const SIZE_LIST = [
    "8pt",
    "10pt",
    "12pt",
    "14pt",
    "16pt",
    "18pt",
    "20pt",
    "24pt",
    "32pt",
  ];
  const DEFAULT_SIZE = "14pt";

  const [showResizeModal, setShowResizeModal] = useState(false);
  const [selectedImageEl, setSelectedImageEl] = useState(null);
  const [tempWidth, setTempWidth] = useState("");
  const [tempAlign, setTempAlign] = useState("left");

  // State cho audio modal
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioFile, setAudioFile] = useState(null);

  const ReactQuill = useMemo(
    () =>
      dynamic(
        async () => {
          const QuillModule = await import("react-quill-new");
          const ReactQuillComponent = QuillModule.default;
          const Quill = QuillModule.default.Quill;

          const SizeStyle = Quill.import("attributors/style/size");
          SizeStyle.whitelist = SIZE_LIST;
          Quill.register(SizeStyle, true);

          // Tạo và đăng ký Audio Blot
          const BlockEmbed = Quill.import("blots/block/embed");

          class AudioBlot extends BlockEmbed {
            static create(url) {
              const node = super.create();
              node.setAttribute("src", url);
              node.setAttribute("controls", "controls");
              node.setAttribute("controlsList", "nodownload");
              node.setAttribute(
                "style",
                "width: 100%; max-width: 500px; display: block; margin: 10px 0;"
              );

              const source = document.createElement("source");
              source.setAttribute("src", url);
              source.setAttribute("type", "audio/mpeg");
              node.appendChild(source);

              return node;
            }

            static value(node) {
              // Check audio src first, then source element
              const audioSrc = node.getAttribute("src");
              if (audioSrc) return audioSrc;
              
              const sourceEl = node.querySelector("source");
              return sourceEl ? sourceEl.getAttribute("src") : null;
            }
          }

          AudioBlot.blotName = "audio";
          AudioBlot.tagName = "audio";

          Quill.register(AudioBlot, true);

          await import("react-quill-new/dist/quill.snow.css");

          return ReactQuillComponent;
        },
        { ssr: false }
      ),
    []
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getKeepSize = (quill) => {
    const sel = quill.getSelection();
    if (!sel) return activeSizeRef.current || DEFAULT_SIZE;

    const prevIdx = Math.max(0, sel.index - 1);
    const fmtPrev = quill.getFormat(prevIdx, 1);
    if (fmtPrev?.size) return fmtPrev.size;

    const fmtCaret = quill.getFormat(sel);
    if (fmtCaret?.size) return fmtCaret.size;

    return activeSizeRef.current || DEFAULT_SIZE;
  };

  useEffect(() => {
    if (!isMounted || !quillRef.current) return;
    const quill = quillRef.current.getEditor?.();
    if (!quill) return;

    quill.format("size", DEFAULT_SIZE, "user");
    activeSizeRef.current = DEFAULT_SIZE;

    const toolbar = quill.getModule("toolbar");
    if (toolbar) {
      toolbar.update(quill.getSelection());
    }

    const onText = (_d, _o, src) => {
      if (src !== "user") return;
      setTimeout(() => {
        const sel = quill.getSelection();
        const fmt = sel ? quill.getFormat(sel) : null;
        if (fmt?.size) activeSizeRef.current = fmt.size;
      }, 0);
    };

    const onSel = (_r, _o, src) => {
      if (src !== "user") return;
      setTimeout(() => {
        activeSizeRef.current = getKeepSize(quill);
      }, 0);
    };

    quill.on("text-change", onText);
    quill.on("selection-change", onSel);

    return () => {
      quill.off("text-change", onText);
      quill.off("selection-change", onSel);
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || !quillRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const toolbar = container.querySelector(".ql-toolbar");
    const editorContainer = container.querySelector(".ql-container");

    if (toolbar && editorContainer) {
      container.appendChild(toolbar);
    }
  }, [isMounted]);

  const updateQuillContent = useCallback(() => {
    if (!quillRef.current) return;

    try {
      const quill = quillRef.current.getEditor();
      const htmlContent = quill.root.innerHTML;

      setContent(htmlContent);
      if (onContentChange) {
        onContentChange(htmlContent);
      }
    } catch (err) {
      console.error("Error updating content:", err);
    }
  }, [onContentChange]);

  // ========== CONVERT IMAGE TO BASE64 ==========
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ========== HANDLE PASTE IMAGE ==========
  const handlePasteImageRef = useRef(null);
  
  const handlePasteImage = useCallback(async (file) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    // Validate size - 50MB
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 50MB.");
      return;
    }

    // Validate type
    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
      "image/bmp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Vui lòng chọn ảnh định dạng hợp lệ (PNG, JPG, GIF, WEBP, BMP).");
      return;
    }

    const range = quill.getSelection(true);
    setUploadingImage(true);

    try {
      let imageUrl;

      if (useServerUpload) {
        // Upload lên S3
        const toastId = toast.loading("Đang upload ảnh lên AWS S3...");
        const uploadResult = await uploadMedia(file, uploadFolder);

        if (!uploadResult.success || !uploadResult.data?.url) {
          toast.error(uploadResult.error || "Upload ảnh thất bại", { id: toastId });
          return;
        }

        imageUrl = uploadResult.data.url;
        toast.success(`Upload thành công! ${uploadResult.data.filename || ""}`, { id: toastId });
      } else {
        // Convert to Base64
        imageUrl = await convertImageToBase64(file);
        toast.success("Ảnh đã được chuyển đổi sang Base64!");
      }

      // Insert ảnh vào editor
      quill.insertEmbed(range.index, "image", imageUrl, "user");
      quill.setSelection(range.index + 1);

      // Update content
      setTimeout(() => {
        updateQuillContent();
      }, 100);
    } catch (error) {
      console.error("❌ [PASTE] Image processing error:", error);
      toast.error("Đã xảy ra lỗi khi xử lý ảnh");
    } finally {
      setUploadingImage(false);
    }
  }, [useServerUpload, uploadFolder, updateQuillContent]);

  // Keep ref updated with latest function
  useEffect(() => {
    handlePasteImageRef.current = handlePasteImage;
  }, [handlePasteImage]);

  // ========== PASTE EVENT LISTENER ==========
  useEffect(() => {
    if (!isMounted) return;

    let isRegistered = false;

    // Wait for quill to be ready
    const checkInterval = setInterval(() => {
      if (isRegistered) return;
      
      const quill = quillRef.current?.getEditor?.();
      if (!quill) return;

      clearInterval(checkInterval);
      isRegistered = true;
      const handlePaste = (e) => {
        const clipboardData = e.clipboardData;
        if (!clipboardData) return;

        const items = clipboardData.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.indexOf("image") !== -1) {
            // Prevent default to stop Quill from inserting base64
            e.preventDefault();
            e.stopImmediatePropagation();

            const file = item.getAsFile();
            if (file) {
              // Use ref to get latest function
              handlePasteImageRef.current?.(file);
            }
            return;
          }
        }
      };

      const editorRoot = quill.root;
      // Use capture phase to intercept before Quill
      editorRoot.addEventListener("paste", handlePaste, true);

      // Store cleanup
      quillRef.current._pasteCleanup = () => {
        editorRoot.removeEventListener("paste", handlePaste, true);
      };
    }, 100);

    return () => {
      clearInterval(checkInterval);
      if (quillRef.current?._pasteCleanup) {
        quillRef.current._pasteCleanup();
      }
    };
  }, [isMounted]);

  // ========== UPLOAD ẢNH (S3 hoặc Base64) ==========
  const handleImageUpload = useCallback(async () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Validate size - 50MB
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 50MB.");
        return;
      }

      // Validate type
      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/gif",
        "image/webp",
        "image/bmp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          "Vui lòng chọn ảnh định dạng hợp lệ (PNG, JPG, GIF, WEBP, BMP)."
        );
        return;
      }

      const quill = quillRef.current?.getEditor();
      if (!quill) return;

      const range = quill.getSelection(true);

      setUploadingImage(true);

      try {
        let imageUrl;

        if (useServerUpload) {
          // Upload lên S3
          const toastId = toast.loading("Đang upload ảnh lên AWS S3...");
          const uploadResult = await uploadMedia(file, uploadFolder);

          if (!uploadResult.success || !uploadResult.data?.url) {
            toast.error(uploadResult.error || "Upload ảnh thất bại", {
              id: toastId,
            });
            return;
          }

          imageUrl = uploadResult.data.url;

          toast.success(
            `Upload thành công! ${uploadResult.data.filename || ""}`,
            { id: toastId }
          );
        } else {
          // Convert to Base64
          // toast.loading("Đang chuyển đổi ảnh sang Base64...");
          imageUrl = await convertImageToBase64(file);
          toast.success("Ảnh đã được chuyển đổi sang Base64!");
        }

        // Insert ảnh vào editor
        quill.insertEmbed(range.index, "image", imageUrl, "user");
        quill.setSelection(range.index + 1);

        // Update content
        setTimeout(() => {
          updateQuillContent();
        }, 100);
      } catch (error) {
        console.error("❌ Image processing error:", error);
        toast.error("Đã xảy ra lỗi khi xử lý ảnh");
      } finally {
        setUploadingImage(false);
      }
    };

    input.click();
  }, [useServerUpload, uploadFolder, updateQuillContent]);

  // ========== IMAGE CLICK & RESIZE ==========
  useEffect(() => {
    if (!isMounted) return;

    const handleImageClick = (e) => {
      if (e.target.tagName === "IMG" && e.target.closest(".ql-editor")) {
        e.preventDefault();
        e.stopPropagation();

        document.querySelectorAll(".ql-editor img").forEach((img) => {
          img.classList.remove("image-selected");
        });

        e.target.classList.add("image-selected");
        setSelectedImageEl(e.target);

        const currentWidth =
          e.target.getAttribute("width") || e.target.offsetWidth.toString();
        setTempWidth(currentWidth);

        const parent = e.target.closest("p");
        if (parent) {
          if (parent.classList.contains("ql-align-center")) {
            setTempAlign("center");
          } else if (parent.classList.contains("ql-align-right")) {
            setTempAlign("right");
          } else if (parent.classList.contains("ql-align-justify")) {
            setTempAlign("justify");
          } else {
            setTempAlign("left");
          }
        } else {
          setTempAlign("left");
        }

        setShowResizeModal(true);
      }
    };

    document.addEventListener("click", handleImageClick);

    return () => {
      document.removeEventListener("click", handleImageClick);
    };
  }, [isMounted]);

  const handleApplyResize = () => {
    if (!selectedImageEl || !quillRef.current) {
      return;
    }

    const quill = quillRef.current.getEditor();

    if (tempWidth) {
      const widthNum = parseInt(tempWidth, 10);
      if (!isNaN(widthNum) && widthNum > 0) {

        selectedImageEl.setAttribute("width", widthNum.toString());
        selectedImageEl.removeAttribute("height");

        selectedImageEl.style.width = widthNum + "px";
        selectedImageEl.style.height = "auto";
      }
    }

    let parent = selectedImageEl.parentElement;
    if (!parent || parent.tagName !== "P") {
      const p = document.createElement("p");
      const grandParent = selectedImageEl.parentNode;
      grandParent.insertBefore(p, selectedImageEl);
      p.appendChild(selectedImageEl);
      parent = p;
    }

    if (parent && parent.tagName === "P") {

      parent.classList.remove(
        "ql-align-left",
        "ql-align-center",
        "ql-align-right",
        "ql-align-justify"
      );

      if (tempAlign !== "left") {
        parent.classList.add(`ql-align-${tempAlign}`);
      }
    }

    setTimeout(() => {
      updateQuillContent();

      setShowResizeModal(false);
      if (selectedImageEl) {
        selectedImageEl.classList.remove("image-selected");
      }
      setSelectedImageEl(null);

      const finalHTML = quill.root.innerHTML;
    }, 300);
  };

  const handleCancelResize = () => {
    setShowResizeModal(false);
    if (selectedImageEl) {
      selectedImageEl.classList.remove("image-selected");
    }
    setSelectedImageEl(null);
  };

  const handlePresetSize = (size) => {
    const sizes = {
      small: "200",
      medium: "400",
      large: "600",
      full: "800",
    };
    setTempWidth(sizes[size]);
  };

  const handleWidthInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setTempWidth(value);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      const quill = quillRef.current.getEditor?.();
      if (!quill) return;

      const range = quill.getSelection();
      if (!range) return;

      const keepSize = getKeepSize(quill);

      if (range.length > 0) quill.deleteText(range.index, range.length, "user");

      quill.setSelection(range.index + 1, 0, "silent");
      quill.format("size", keepSize, "user");
      activeSizeRef.current = keepSize;

      const toolbar = quill.getModule("toolbar");
      if (toolbar) {
        toolbar.update(quill.getSelection());
      }
    }
  };

  // ========== AUDIO HANDLER (Upload S3 hoặc URL) ==========
  const handleAudioInsert = async () => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const range = quill.getSelection(true);

    if (useServerUpload && audioFile) {
      // Upload audio lên S3
      setUploadingAudio(true);
      const toastId = toast.loading("Đang upload audio lên AWS S3...");

      try {
        const uploadResult = await uploadMedia(audioFile, uploadFolder);

        if (!uploadResult.success || !uploadResult.data?.url) {
          toast.error(uploadResult.error || "Upload audio thất bại", {
            id: toastId,
          });
          return;
        }

        const uploadedUrl = uploadResult.data.url;

        quill.insertEmbed(range.index, "audio", uploadedUrl, "user");
        quill.setSelection(range.index + 1);

        toast.success(
          `Upload audio thành công! ${uploadResult.data.filename || ""}`,
          { id: toastId }
        );

        setTimeout(() => {
          updateQuillContent();
        }, 100);
      } catch (error) {
        console.error("Audio upload error:", error);
        toast.error("Đã xảy ra lỗi khi upload audio", { id: toastId });
      } finally {
        setUploadingAudio(false);
      }
    } else if (!useServerUpload && audioUrl.trim()) {
      // Chèn audio từ URL
      let url = audioUrl.trim();
      if (url.startsWith("http://")) {
        url = url.replace("http://", "https://");
      }

      quill.insertEmbed(range.index, "audio", url, "user");
      quill.setSelection(range.index + 1);
      setTimeout(() => {
        updateQuillContent();
      }, 100);
    }

    setShowAudioModal(false);
    setAudioUrl("");
    setAudioFile(null);
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size - 50MB
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File audio quá lớn! Vui lòng chọn file nhỏ hơn 50MB.");
      return;
    }

    // Validate type
    const allowedTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/m4a",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Vui lòng chọn file audio hợp lệ (MP3, WAV, OGG, M4A).");
      return;
    }

    setAudioFile(file);
    setAudioUrl(""); // Clear URL khi chọn file
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ size: SIZE_LIST }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [
            { align: "" },
            { align: "center" },
            { align: "right" },
            { align: "justify" },
          ],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote", "code-block"],
          ["link", "image", "video"],
          ["audio"],
          ["clean"],
        ],
        handlers: {
          header: function (value) {
            this.quill.format("header", value, "user");
            if (value) {
              this.quill.format("size", false, "user");
              activeSizeRef.current = null;
            }
          },
          size: function (value) {
            const v = value || DEFAULT_SIZE;
            this.quill.format("size", v, "user");
            activeSizeRef.current = v;
            const toolbar = this.quill.getModule("toolbar");
            if (toolbar) {
              toolbar.update(this.quill.getSelection());
            }
          },
          image: handleImageUpload,
          audio: function () {
            setShowAudioModal(true);
            setAudioUrl("");
            setAudioFile(null);
          },
        },
      },
      history: { delay: 800, maxStack: 100, userOnly: false },
    }),
    [handleImageUpload]
  );

  const formats = [
    "header",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "align",
    "list",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
    "audio",
  ];

  const handleChange = (val) => {
    setContent(val);
    onContentChange?.(val);
  };

  useEffect(() => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor?.();
    if (!quill) return;

    const toolbar = quill.getModule("toolbar");
    if (toolbar) {
      toolbar.update(quill.getSelection());
    }
  }, [activeSizeRef.current]);

  if (!isMounted)
    return <div className="h-96 bg-gray-50 rounded animate-pulse" />;

  return (
    <>
      <style jsx global>{`
        /* CSS cho nút audio trên toolbar */
        .ql-toolbar .ql-audio::before {
          content: "🎵";
          font-size: 18px;
        }

        .ql-toolbar .ql-audio {
          width: auto !important;
        }

        /* CSS cho audio element trong editor */
        .ql-editor audio {
          display: block;
          margin: 10px 0;
          max-width: 100%;
          width: 100%;
        }

        .ql-editor audio:focus {
          outline: 2px solid #06c;
        }

        /* CSS cho image selection */
        .ql-editor img.image-selected {
          outline: 3px solid #06c;
          outline-offset: 2px;
        }

        /* CSS cho alignment toolbar */
        .image-alignment-toolbar {
          position: fixed;
          top: 50%;
          right: 20px;
          transform: translateY(-50%);
          background: white;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .image-alignment-toolbar button {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .image-alignment-toolbar button:hover {
          background: #f0f0f0;
        }

        .image-alignment-toolbar button.active {
          background: #06c;
          color: white;
          border-color: #06c;
        }

        /* CSS cho resize modal */
        .image-resize-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
        }

        .image-resize-modal {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .image-resize-preview {
          margin: 20px 0;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 8px;
          text-align: center;
        }

        .image-resize-preview img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }

        .image-resize-controls {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin: 20px 0;
        }

        .image-resize-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .image-resize-buttons button {
          flex: 1;
          min-width: 100px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .image-resize-buttons button:hover {
          background: #f0f0f0;
          border-color: #06c;
        }

        .image-resize-buttons button.active {
          background: #06c;
          color: white;
          border-color: #06c;
        }

        .image-resize-input {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .image-resize-input input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .image-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }

        .image-actions button {
          padding: 10px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .image-actions button.cancel {
          background: #f0f0f0;
          color: #333;
        }

        .image-actions button.cancel:hover {
          background: #e0e0e0;
        }

        .image-actions button.apply {
          background: #06c;
          color: white;
        }

        .image-actions button.apply:hover {
          background: #005bb5;
        }

        /* CSS cho audio modal */
        .audio-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .audio-modal {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 500px;
          width: 90%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .audio-modal h3 {
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 16px 0;
        }

        .audio-modal input[type="text"],
        .audio-modal input[type="file"] {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 12px;
        }

        .audio-modal .audio-hint {
          font-size: 13px;
          color: #666;
          margin-bottom: 12px;
        }

        .audio-modal .audio-separator {
          text-align: center;
          color: #999;
          margin: 16px 0;
          font-size: 14px;
        }

        .audio-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .audio-modal-actions button {
          padding: 10px 24px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .audio-modal-actions button.cancel {
          background: #f0f0f0;
          color: #333;
        }

        .audio-modal-actions button.cancel:hover {
          background: #e0e0e0;
        }

        .audio-modal-actions button.confirm {
          background: #06c;
          color: white;
        }

        .audio-modal-actions button.confirm:hover {
          background: #005bb5;
        }

        .audio-modal-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .audio-modal {
            width: 90vw;
          }
        }
      `}</style>

      <div className="editor-container" ref={containerRef}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={
            useServerUpload
              ? "Start typing... (Click ảnh/🎵 để upload lên S3, click ảnh để resize & căn lề)"
              : "Start typing... (Ảnh: Base64, Audio: URL link, click ảnh để resize & căn lề)"
          }
          preserveWhitespace={true}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Audio Modal */}
      {showAudioModal &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="audio-modal-overlay"
            onClick={() => setShowAudioModal(false)}
          >
            <div className="audio-modal" onClick={(e) => e.stopPropagation()}>
              <h3>
                {useServerUpload ? "Upload Audio lên S3" : "Thêm Audio từ URL"}
              </h3>

              {useServerUpload ? (
                <>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                  />
                  {audioFile && (
                    <div className="audio-hint">
                      File đã chọn: {audioFile.name} (
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  )}
                  <div className="audio-hint">
                    Hỗ trợ: MP3, WAV, OGG, M4A (tối đa 50MB)
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Nhập URL audio (mp3, wav, ogg)..."
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAudioInsert();
                    }}
                  />
                  <div className="audio-hint">
                    Ví dụ:
                    https://storage.googleapis.com/kstoefl/sound/1421132469368.mp3
                  </div>
                </>
              )}

              <div className="audio-modal-actions">
                <button
                  className="cancel"
                  onClick={() => setShowAudioModal(false)}
                  disabled={uploadingAudio}
                >
                  Hủy
                </button>
                <button
                  className="confirm"
                  onClick={handleAudioInsert}
                  disabled={
                    uploadingAudio ||
                    (useServerUpload ? !audioFile : !audioUrl.trim())
                  }
                >
                  {uploadingAudio
                    ? "Đang upload..."
                    : useServerUpload
                    ? "Upload & Chèn"
                    : "Chèn Audio"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Image Resize Modal */}
      {showResizeModal &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="image-resize-overlay" onClick={handleCancelResize}>
            <div
              className="image-resize-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Chỉnh sửa ảnh</h3>

              <div className="image-resize-preview">
                {selectedImageEl && (
                  <img
                    src={selectedImageEl.src}
                    alt="Preview"
                    style={{
                      width: tempWidth ? tempWidth + "px" : "auto",
                      height: "auto",
                    }}
                  />
                )}
              </div>

              <div className="image-resize-controls">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kích thước nhanh:
                  </label>
                  <div className="image-resize-buttons">
                    <button onClick={() => handlePresetSize("small")}>
                      Nhỏ (200px)
                    </button>
                    <button onClick={() => handlePresetSize("medium")}>
                      Trung (400px)
                    </button>
                    <button onClick={() => handlePresetSize("large")}>
                      Lớn (600px)
                    </button>
                    <button onClick={() => handlePresetSize("full")}>
                      Rất lớn (800px)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Hoặc nhập chiều rộng (px):
                  </label>
                  <div className="image-resize-input">
                    <input
                      type="text"
                      value={tempWidth}
                      onChange={handleWidthInputChange}
                      placeholder="Ví dụ: 400"
                    />
                    <span className="text-sm text-gray-600">px</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Giá trị hiện tại: {tempWidth}px
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Căn lề:
                  </label>
                  <div className="image-resize-buttons">
                    <button
                      className={tempAlign === "left" ? "active" : ""}
                      onClick={() => setTempAlign("left")}
                    >
                      Trái
                    </button>
                    <button
                      className={tempAlign === "center" ? "active" : ""}
                      onClick={() => setTempAlign("center")}
                    >
                      Giữa
                    </button>
                    <button
                      className={tempAlign === "right" ? "active" : ""}
                      onClick={() => setTempAlign("right")}
                    >
                      Phải
                    </button>
                    <button
                      className={tempAlign === "justify" ? "active" : ""}
                      onClick={() => setTempAlign("justify")}
                    >
                      Căn đều
                    </button>
                  </div>
                </div>
              </div>

              <div className="image-actions">
                <button className="cancel" onClick={handleCancelResize}>
                  Hủy
                </button>
                <button className="apply" onClick={handleApplyResize}>
                  Áp dụng
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
