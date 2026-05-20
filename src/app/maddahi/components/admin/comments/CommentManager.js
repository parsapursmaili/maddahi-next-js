"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Check,
  Trash2,
  List,
  Pencil,
  Reply,
  User,
  Clock,
  Send,
  Link as LinkIcon,
  Loader2,
  FileScan,
  MoreVertical, // آیکون جدید
} from "lucide-react";
import {
  updateCommentStatus,
  updateCommentDetails,
  addCommentReply,
  deleteCommentPermanently,
} from "@/app/maddahi/actions/commentActions";
import EditCommentModal from "./EditCommentModal";
import { timeAgo } from "@/app/maddahi/lib/utils/formatDate";

const STATUS = { PENDING: 0, APPROVED: 1, REVIEWING: 2 };

const statusConfig = {
  [STATUS.PENDING]: {
    text: "در انتظار تایید",
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    ring: "ring-yellow-400/30",
  },
  [STATUS.APPROVED]: {
    text: "منتشر شده",
    icon: Check,
    color: "text-green-400",
    bg: "bg-green-400/10",
    ring: "ring-green-400/30",
  },
  [STATUS.REVIEWING]: {
    text: "در حال بازبینی",
    icon: FileScan,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    ring: "ring-blue-400/30",
  },
};

const TABS = [
  { id: "all", label: "همه", icon: List },
  { id: STATUS.PENDING, label: "در انتظار", icon: Clock },
  { id: STATUS.APPROVED, label: "منتشر شده", icon: Check },
  { id: STATUS.REVIEWING, label: "بازبینی", icon: FileScan },
];

const InlineReplyForm = ({
  parentId,
  postId,
  postType,
  onReplySuccess,
  onCancel,
}) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsSubmitting(true);
    const result = await addCommentReply({ text, parentId, postId, postType });
    if (result.success) {
      onReplySuccess(result.newComment);
    } else {
      alert(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="پاسخ خود را بنویسید (به عنوان مدیر)..."
        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
        rows="3"
      />
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-gray-400 hover:text-white px-3 py-1"
        >
          لغو
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 text-sm text-white font-semibold hover:bg-teal-600 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>ارسال پاسخ</span>
        </button>
      </div>
    </form>
  );
};

const MobileActionsMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative md:hidden" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-white/10 text-gray-400"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 p-2 flex flex-col items-start">
          {children}
        </div>
      )}
    </div>
  );
};

const CommentCard = ({
  comment,
  onStatusChange,
  onEdit,
  onReply,
  onPermanentDelete,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const statusInfo = statusConfig[comment.status];

  const actionButtons = [
    comment.status !== STATUS.APPROVED && {
      key: "approve",
      title: "تایید و انتشار",
      onClick: () => onStatusChange(comment.id, STATUS.APPROVED),
      icon: Check,
      className: "text-green-400 hover:bg-green-400/10",
    },
    comment.status !== STATUS.PENDING && {
      key: "pending",
      title: "انتقال به در انتظار تایید",
      onClick: () => onStatusChange(comment.id, STATUS.PENDING),
      icon: Clock,
      className: "text-yellow-400 hover:bg-yellow-400/10",
    },
    comment.status !== STATUS.REVIEWING && {
      key: "review",
      title: "انتقال به در حال بازبینی",
      onClick: () => onStatusChange(comment.id, STATUS.REVIEWING),
      icon: FileScan,
      className: "text-blue-400 hover:bg-blue-400/10",
    },
    {
      key: "edit",
      title: "ویرایش",
      onClick: () => onEdit(comment),
      icon: Pencil,
      className: "text-gray-400 hover:bg-white/10",
    },
    {
      key: "delete",
      title: "حذف دائمی",
      onClick: () => onPermanentDelete(comment.id),
      icon: Trash2,
      className: "text-red-500 hover:bg-red-500/10",
    },
  ].filter(Boolean);

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-5 group">
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-shrink min-w-0">
          <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700 flex-shrink-0">
            <User className="w-5 h-5 text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white truncate">{comment.name}</p>
            <p className="text-xs text-gray-400">
              {timeAgo(comment.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {statusInfo && (
            <div
              className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color} ring-1 ring-inset ${statusInfo.ring}`}
            >
              <statusInfo.icon className="w-3.5 h-3.5" />
              <span>{statusInfo.text}</span>
            </div>
          )}
          {/* دسکتاپ: دکمه‌های افقی */}
          <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity items-center gap-1">
            {actionButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={btn.onClick}
                title={btn.title}
                className={`p-2 rounded-full ${btn.className}`}
              >
                <btn.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          {/* موبایل: منوی سه نقطه */}
          <MobileActionsMenu>
            {actionButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={btn.onClick}
                className={`w-full flex items-center gap-3 text-left p-2 rounded-md text-sm ${btn.className}`}
              >
                <btn.icon className="w-4 h-4" />
                <span>{btn.title}</span>
              </button>
            ))}
          </MobileActionsMenu>
        </div>
      </header>
      <div className="mt-4 text-gray-200 text-base leading-relaxed whitespace-pre-wrap break-words">
        {comment.text}
      </div>
      <footer className="mt-4 pt-4 border-t border-dashed border-gray-800">
        <div className="flex justify-between items-center">
          {comment.post_title && comment.post_link && (
            <Link
              href={comment.post_link}
              target="_blank"
              className="flex items-center gap-2 text-xs text-gray-400 hover:text-teal-400 transition-colors max-w-[70%]"
            >
              <LinkIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">مطلب: {comment.post_title}</span>
            </Link>
          )}
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-teal-400 transition"
          >
            <Reply className="w-4 h-4" />
            <span>{isReplying ? "بستن" : "پاسخ"}</span>
          </button>
        </div>
        {isReplying && (
          <InlineReplyForm
            parentId={comment.id}
            postId={comment.post_id}
            postType={comment.post_type}
            onCancel={() => setIsReplying(false)}
            onReplySuccess={(newComment) => {
              setIsReplying(false);
              onReply(newComment);
            }}
          />
        )}
      </footer>
    </div>
  );
};

const RecursiveCommentRenderer = ({ comment, allComments, ...props }) => {
  const children = allComments.filter((c) => c.parent_id === comment.id);
  return (
    <div className="relative">
      <CommentCard comment={comment} {...props} />
      {children.length > 0 && (
        <div className="pl-4 sm:pl-8 mt-4 relative before:absolute before:top-0 before:bottom-0 before:right-4 sm:before:right-5 before:w-px before:bg-gray-800">
          <div className="space-y-4">
            {children.map((child) => (
              <RecursiveCommentRenderer
                key={child.id}
                comment={child}
                allComments={allComments}
                {...props}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function CommentManager({ initialComments }) {
  const [comments, setComments] = useState(initialComments);
  const [activeTab, setActiveTab] = useState("all");
  const [editingComment, setEditingComment] = useState(null);

  const filteredCommentsForTree = useMemo(() => {
    if (activeTab === "all") return comments;
    return comments.filter((c) => c.status === activeTab);
  }, [comments, activeTab]);

  const rootComments = useMemo(() => {
    return filteredCommentsForTree.filter(
      (c) =>
        !c.parent_id ||
        !filteredCommentsForTree.some((parent) => parent.id === c.parent_id)
    );
  }, [filteredCommentsForTree]);

  const handleStatusChange = async (id, newStatus) => {
    const originalComments = [...comments];
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    const result = await updateCommentStatus(id, newStatus);
    if (!result.success) {
      setComments(originalComments);
      alert(result.message || "خطا در تغییر وضعیت");
    }
  };

  const handlePermanentDelete = async (id) => {
    if (
      window.confirm(
        "آیا از حذف دائمی این دیدگاه و تمام پاسخ‌های آن مطمئن هستید؟ این عمل غیرقابل بازگشت است."
      )
    ) {
      const originalComments = [...comments];
      const idsToDelete = new Set([id]);
      let changed = true;
      while (changed) {
        changed = false;
        comments.forEach((c) => {
          if (
            c.parent_id &&
            idsToDelete.has(c.parent_id) &&
            !idsToDelete.has(c.id)
          ) {
            idsToDelete.add(c.id);
            changed = true;
          }
        });
      }
      setComments((prev) => prev.filter((c) => !idsToDelete.has(c.id)));
      const result = await deleteCommentPermanently(id);
      if (!result.success) {
        setComments(originalComments);
        alert(result.message || "خطا در حذف دائمی");
      }
    }
  };

  const handleSaveChanges = async (id, data) => {
    const result = await updateCommentDetails(id, data);
    if (result.success) {
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c))
      );
      return true;
    }
    alert(result.message || "خطا در ذخیره تغییرات");
    return false;
  };

  const handleReplySuccess = (newComment) => {
    setComments((prev) => [newComment, ...prev]);
  };

  return (
    <>
      <div className="p-2 sm:p-6 lg:p-8 min-h-screen bg-gray-950 text-white font-sans">
        <div className="max-w-5xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="w-7 h-7 text-teal-400" />
              مدیریت دیدگاه‌ها
            </h1>
          </header>
          <div className="mb-6 border-b border-gray-800">
            <nav className="-mb-px flex space-x-0 sm:space-x-4 overflow-x-auto">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const count =
                  tab.id === "all"
                    ? comments.length
                    : comments.filter((c) => c.status === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      isActive
                        ? "border-teal-400 text-teal-400"
                        : "border-transparent text-gray-400 hover:text-white hover:border-gray-600"
                    } 
                    group inline-flex items-center py-4 px-2 sm:px-3 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap`}
                  >
                    <tab.icon className="mr-2 h-5 w-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span
                      className={`${
                        isActive
                          ? "bg-teal-400 text-black"
                          : "bg-gray-800 text-gray-300 group-hover:bg-gray-700"
                      } 
                    ml-2 py-0.5 px-2 rounded-full text-xs font-medium`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
          <main className="space-y-4">
            {rootComments.length > 0 ? (
              rootComments.map((comment) => (
                <RecursiveCommentRenderer
                  key={comment.id}
                  comment={comment}
                  allComments={filteredCommentsForTree}
                  onStatusChange={handleStatusChange}
                  onEdit={setEditingComment}
                  onReply={handleReplySuccess}
                  onPermanentDelete={handlePermanentDelete}
                />
              ))
            ) : (
              <div className="text-center py-16 px-4 bg-gray-900 rounded-xl border border-gray-800">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-600" />
                <h3 className="mt-4 text-lg font-medium text-white">
                  بدون دیدگاه
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  در این دسته‌بندی دیدگاهی برای نمایش وجود ندارد.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
      {editingComment && (
        <EditCommentModal
          comment={editingComment}
          onClose={() => setEditingComment(null)}
          onSave={handleSaveChanges}
        />
      )}
    </>
  );
}
