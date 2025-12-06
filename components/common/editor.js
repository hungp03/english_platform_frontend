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

  // ✅ Di chuyển toolbar xuống dưới sau khi mount
  useEffect(() => {
    if (!isMounted || !quillRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const toolbar = container.querySelector(".ql-toolbar");
    const editorContainer = container.querySelector(".ql-container");

    if (toolbar && editorContainer) {
      // Di chuyển toolbar xuống sau editor
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
      }
    };

    document.addEventListener("click", handleImageClick);

    return () => {
      document.removeEventListener("click", handleImageClick);
    };
  }, [isMounted]);

  const handleApplyResize = () => {

    if (!selectedImageEl || !quillRef.current) {
      console.warn("Missing image or quill");
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
      setShowAlignToolbar(false);
      if (selectedImageEl) {
        selectedImageEl.classList.remove("image-selected");
      }
      setSelectedImageEl(null);

      const finalHTML = quill.root.innerHTML;
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
  };

  const handleWidthInputChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setTempWidth(value);
    }
  };

  const applyAlignment = (alignment) => {
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
    }
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
      <div className="editor-container" ref={containerRef}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder="Start typing... (Click ảnh để resize & căn lề)"
          preserveWhitespace={true}
          onKeyDown={handleKeyDown}
        />
      </div>

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
              Trái
            </button>
            <button
              className={tempAlign === "center" ? "active" : ""}
              onClick={() => applyAlignment("center")}
              title="Căn giữa"
            >
              Giữa
            </button>
            <button
              className={tempAlign === "right" ? "active" : ""}
              onClick={() => applyAlignment("right")}
              title="Căn phải"
            >
              Phải
            </button>
            <button
              className={tempAlign === "justify" ? "active" : ""}
              onClick={() => applyAlignment("justify")}
              title="Căn đều"
            >
              Căn đều
            </button>
          </div>,
          document.body
        )}

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