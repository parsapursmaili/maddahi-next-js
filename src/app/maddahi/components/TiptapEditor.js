"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { useCallback } from "react";
import "@/app/maddahi/css/Tiptap.css";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Quote,
  Pilcrow,
} from "lucide-react";

// کامپوننت دکمه برای نوار ابزار (بدون تغییر)
const ToolbarButton = ({ onClick, isActive, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={isActive ? "is-active" : ""}
    title={title}
  >
    {children}
  </button>
);

// نوار ابزار اصلاح‌شده
const Toolbar = ({ editor }) => {
  // --- شروع تغییر ---
  // هوک useCallback به ابتدای کامپوننت منتقل شد تا همیشه فراخوانی شود
  const setLink = useCallback(() => {
    // برای اطمینان بیشتر، وجود editor در داخل تابع نیز بررسی می‌شود
    if (!editor) {
      return;
    }
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("آدرس لینک:", previousUrl);

    // اگر کاربر پنجره را ببندد یا خالی رها کند
    if (url === null) {
      return;
    }

    // اگر کاربر آدرس را پاک کند، لینک حذف می‌شود
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // در غیر این صورت، لینک ایجاد یا به‌روزرسانی می‌شود
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  // اکنون شرط بازگشت زودهنگام بعد از تعریف هوک‌ها قرار دارد و مشکلی ایجاد نمی‌کند
  if (!editor) {
    return null;
  }
  // --- پایان تغییر ---

  return (
    <div className="tiptap-toolbar flex items-center flex-wrap gap-1 p-2">
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="تیتر ۱"
      >
        <Heading1 size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="تیتر ۲"
      >
        <Heading2 size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="تیتر ۳"
      >
        <Heading3 size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        isActive={editor.isActive("paragraph")}
        title="پاراگراف"
      >
        <Pilcrow size={18} />
      </ToolbarButton>

      <div className="divider"></div>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="بولد"
      >
        <Bold size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="ایتالیک"
      >
        <Italic size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive("link")}
        title="لینک"
      >
        <LinkIcon size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="نقل قول"
      >
        <Quote size={18} />
      </ToolbarButton>

      <div className="divider"></div>

      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="راست‌چین"
      >
        <AlignRight size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="وسط‌چین"
      >
        <AlignCenter size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="چپ‌چین"
      >
        <AlignLeft size={18} />
      </ToolbarButton>

      <div className="divider"></div>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="لیست نقطه‌ای"
      >
        <List size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="لیست عددی"
      >
        <ListOrdered size={18} />
      </ToolbarButton>
    </div>
  );
};

// کامپوننت اصلی و کامل ویرایشگر (بدون تغییر)
export default function TiptapEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "tiptap-editor-field",
      },
    },
    immediatelyRender: false,
  });

  return (
    <div className="tiptap-container">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
