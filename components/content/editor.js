"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";

export default function Editor({ initialContent = "", onContentChange }) {
  const [content, setContent] = useState(initialContent);
  const [isMounted, setIsMounted] = useState(false);
  const quillRef = useRef(null);
  const containerRef = useRef(null);

  const activeSizeRef = useRef("14pt");

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
  const [showAlignToolbar, setShowAlignToolbar] = useState(false);

  // State cho audio modal
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");

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
              return node.getAttribute("src");
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
      console.log("✅ Toolbar moved to bottom");
    }
  }, [isMounted]);

  const updateQuillContent = useCallback(() => {
    if (!quillRef.current) return;

    try {
      const quill = quillRef.current.getEditor();
      const htmlContent = quill.root.innerHTML;

      console.log("🔄 Updating content (preserving attributes)");

      setContent(htmlContent);
      if (onContentChange) {
        onContentChange(htmlContent);
      }

      console.log("✅ Content updated");
    } catch (err) {
      console.error("❌ Error updating content:", err);
    }
  }, [onContentChange]);

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

        setShowAlignToolbar(true);
        setShowResizeModal(true);

        console.log("🖼️ Image selected:", {
          currentWidth,
          hasParent: !!parent,
        });
      }
    };

    document.addEventListener("click", handleImageClick);

    return () => {
      document.removeEventListener("click", handleImageClick);
    };
  }, [isMounted]);

  const handleApplyResize = () => {
    console.log("🔧 Apply resize START");

    if (!selectedImageEl || !quillRef.current) {
      console.warn("⚠️ Missing image or quill");
      return;
    }

    const quill = quillRef.current.getEditor();

    if (tempWidth) {
      const widthNum = parseInt(tempWidth, 10);
      if (!isNaN(widthNum) && widthNum > 0) {
        console.log("📏 Setting width attribute:", widthNum);

        selectedImageEl.setAttribute("width", widthNum.toString());
        selectedImageEl.removeAttribute("height");

        selectedImageEl.style.width = widthNum + "px";
        selectedImageEl.style.height = "auto";

        console.log(
          "✅ Width set:",
          selectedImageEl.outerHTML.substring(0, 100)
        );
      }
    }

    let parent = selectedImageEl.parentElement;
    if (!parent || parent.tagName !== "P") {
      const p = document.createElement("p");
      const grandParent = selectedImageEl.parentNode;
      grandParent.insertBefore(p, selectedImageEl);
      p.appendChild(selectedImageEl);
      parent = p;
      console.log("📦 Wrapped image in <p>");
    }

    if (parent && parent.tagName === "P") {
      console.log("📍 Applying alignment to parent:", tempAlign);

      parent.classList.remove(
        "ql-align-left",
        "ql-align-center",
        "ql-align-right",
        "ql-align-justify"
      );

      if (tempAlign !== "left") {
        parent.classList.add(`ql-align-${tempAlign}`);
      }

      console.log("✅ Parent classes:", parent.className);
    }

    setTimeout(() => {
      updateQuillContent();

      setShowResizeModal(false);
      setShowAlignToolbar(false);
      if (selectedImageEl) {
        selectedImageEl.classList.remove("image-selected");
      }
      setSelectedImageEl(null);

      console.log("✅ Apply resize COMPLETE");

      const finalHTML = quill.root.innerHTML;
      console.log("📋 Final HTML:", finalHTML.substring(0, 200));
    }, 300);
  };

  const handleCancelResize = () => {
    setShowResizeModal(false);
    setShowAlignToolbar(false);
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
    console.log("📦 Preset selected:", size);
  };

  const handleWidthInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setTempWidth(value);
    }
  };

  const applyAlignment = (alignment) => {
    console.log("🎯 Alignment clicked:", alignment);

    if (!selectedImageEl) return;

    setTempAlign(alignment);

    let parent = selectedImageEl.parentElement;
    if (!parent || parent.tagName !== "P") {
      const p = document.createElement("p");
      selectedImageEl.parentNode.insertBefore(p, selectedImageEl);
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
      if (alignment !== "left") {
        parent.classList.add(`ql-align-${alignment}`);
      }
      console.log("✅ Alignment applied");
    }

    setTimeout(() => {
      updateQuillContent();
    }, 100);
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

      console.log("[ENTER] keep size ->", keepSize);
    }
  };

  // Handler cho audio - mở modal thay vì prompt
  const handleAudioInsert = () => {
    if (!audioUrl.trim()) return;

    let url = audioUrl.trim();
    if (url.startsWith("http://")) {
      url = url.replace("http://", "https://");
    }

    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "audio", url, "user");
      quill.setSelection(range.index + 1);
      console.log("🎵 Audio inserted:", url);
    }

    setShowAudioModal(false);
    setAudioUrl("");
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
            console.log("[TOOLBAR] header =", value);
          },
          size: function (value) {
            const v = value || DEFAULT_SIZE;
            this.quill.format("size", v, "user");
            activeSizeRef.current = v;
            console.log("[TOOLBAR] v =", v);

            const toolbar = this.quill.getModule("toolbar");
            if (toolbar) {
              toolbar.update(this.quill.getSelection());
            }
          },
          audio: function () {
            setShowAudioModal(true);
            setAudioUrl("");
          },
        },
      },
      history: { delay: 800, maxStack: 100, userOnly: false },
    }),
    []
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

        .audio-modal input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .audio-modal .audio-hint {
          font-size: 13px;
          color: #666;
          margin-bottom: 20px;
        }

        .audio-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
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
          placeholder="Start typing... (Click ảnh để resize & căn lề, click 🎵 để thêm audio)"
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
              <h3>Thêm Audio</h3>
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
                Ví dụ: https://storage.googleapis.com/kstoefl/sound/1421132469368.mp3
              </div>
              <div className="audio-modal-actions">
                <button
                  className="cancel"
                  onClick={() => setShowAudioModal(false)}
                >
                  Hủy
                </button>
                <button className="confirm" onClick={handleAudioInsert}>
                  Chèn Audio
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Alignment Toolbar */}
      {showAlignToolbar &&
        selectedImageEl &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="image-alignment-toolbar">
            <button
              className={tempAlign === "left" ? "active" : ""}
              onClick={() => applyAlignment("left")}
              title="Căn trái"
            >
              ⬅️ Trái
            </button>
            <button
              className={tempAlign === "center" ? "active" : ""}
              onClick={() => applyAlignment("center")}
              title="Căn giữa"
            >
              ↔️ Giữa
            </button>
            <button
              className={tempAlign === "right" ? "active" : ""}
              onClick={() => applyAlignment("right")}
              title="Căn phải"
            >
              ➡️ Phải
            </button>
            <button
              className={tempAlign === "justify" ? "active" : ""}
              onClick={() => applyAlignment("justify")}
              title="Căn đều"
            >
              ⬌ Căn đều
            </button>
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