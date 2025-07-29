// /components/CommentManager.js

"use client";

import React, { useState, useMemo } from "react";
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
  FileScan, // آیکون جدید برای "در حال بازبینی"
} from "lucide-react";
import {
  updateCommentStatus,
  updateCommentDetails,
  addCommentReply,
  deleteCommentPermanently,
} from "@/app/maddahi/actions/commentActions";
import EditCommentModal from "./EditCommentModal"; // این کامپوننت بدون تغییر باقی می‌ماند
import { timeAgo } from "@/app/maddahi/lib/utils/formatDate";

// تعریف وضعیت‌های جدید
const STATUS = { PENDING: 0, APPROVED: 1, REVIEWING: 2 };

// پیکربندی نمایش وضعیت‌های جدید
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
    color: "text-[var(--success)]",
    bg: "bg-[var(--success)]/10",
    ring: "ring-[var(--success)]/30",
  },
  [STATUS.REVIEWING]: {
    text: "در حال بازبینی",
    icon: FileScan,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    ring: "ring-blue-400/30",
  },
};

// تعریف تب‌های جدید
const TABS = [
  { id: "all", label: "همه", icon: List },
  { id: STATUS.PENDING, label: "در انتظار تایید", icon: Clock },
  { id: STATUS.APPROVED, label: "منتشر شده", icon: Check },
  { id: STATUS.REVIEWING, label: "در حال بازبینی", icon: FileScan },
];

const InlineReplyForm = ({ parentId, postId, onReplySuccess, onCancel }) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsSubmitting(true);
    const result = await addCommentReply({ text, parentId, postId });
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
        placeholder="پاسخ خود را بنویسید..."
        className="w-full bg-[var(--background-tertiary)] border border-[var(--border-secondary)] rounded-lg p-3 text-sm text-[var(--foreground-primary)] transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-secondary)] focus:ring-[var(--accent-crystal-highlight)]"
        rows="3"
      />
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground-primary)] transition px-3 py-1"
        >
          لغو
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-sm text-[var(--background-primary)] font-semibold hover:opacity-90 transition disabled:opacity-50"
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

const CommentCard = ({
  comment,
  onStatusChange,
  onEdit,
  onReply,
  onPermanentDelete,
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const statusInfo = statusConfig[comment.status];

  return (
    <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)] shadow-lg shadow-black/10 p-4 sm:p-5 group">
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--background-tertiary)] rounded-full flex items-center justify-center border border-[var(--border-secondary)]">
            <User className="w-5 h-5 text-[var(--foreground-muted)]" />
          </div>
          <div>
            <p className="font-bold text-[var(--foreground-primary)]">
              {comment.name}
            </p>
            <p className="text-xs text-[var(--foreground-secondary)]">
              {timeAgo(comment.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {statusInfo && (
            <div
              className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color} ring-1 ring-inset ${statusInfo.ring}`}
            >
              <statusInfo.icon className="w-3.5 h-3.5" />
              <span>{statusInfo.text}</span>
            </div>
          )}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            {/* <<<<<<<<<<<<<<< شروع منطق جدید دکمه‌ها >>>>>>>>>>>>>>>>> */}
            {comment.status !== STATUS.APPROVED && (
              <button
                onClick={() => onStatusChange(comment.id, STATUS.APPROVED)}
                title="تایید و انتشار"
                className="p-2 rounded-full text-[var(--success)] hover:bg-[var(--success)]/10"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            {comment.status !== STATUS.PENDING && (
              <button
                onClick={() => onStatusChange(comment.id, STATUS.PENDING)}
                title="انتقال به در انتظار تایید"
                className="p-2 rounded-full text-yellow-400 hover:bg-yellow-400/10"
              >
                <Clock className="w-4 h-4" />
              </button>
            )}
            {comment.status !== STATUS.REVIEWING && (
              <button
                onClick={() => onStatusChange(comment.id, STATUS.REVIEWING)}
                title="انتقال به در حال بازبینی"
                className="p-2 rounded-full text-blue-400 hover:bg-blue-400/10"
              >
                <FileScan className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => onEdit(comment)}
              title="ویرایش"
              className="p-2 rounded-full text-[var(--foreground-secondary)] hover:bg-white/10"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPermanentDelete(comment.id)}
              title="حذف دائمی"
              className="p-2 rounded-full text-[var(--error)] hover:bg-[var(--error)]/10"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {/* <<<<<<<<<<<<<<< پایان منطق جدید دکمه‌ها >>>>>>>>>>>>>>>>> */}
          </div>
        </div>
      </header>
      <div className="mt-4 text-[var(--foreground-primary)] text-base leading-relaxed whitespace-pre-wrap">
        {comment.text}
      </div>
      <footer className="mt-4 pt-4 border-t border-dashed border-[var(--border-secondary)]">
        <div className="flex justify-between items-center">
          {comment.post_title && (
            <Link
              href={`/maddahi/${comment.post_slug}`}
              target="_blank"
              className="flex items-center gap-2 text-xs text-[var(--foreground-secondary)] hover:text-[var(--accent-primary)] transition-colors"
            >
              <LinkIcon className="w-3 h-3" />
              <span>پست: {comment.post_title}</span>
            </Link>
          )}
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1.5 text-sm font-semibold text-[var(--foreground-secondary)] hover:text-[var(--accent-primary)] transition"
          >
            <Reply className="w-4 h-4" />
            <span>{isReplying ? "بستن" : "پاسخ"}</span>
          </button>
        </div>
        {isReplying && (
          <InlineReplyForm
            parentId={comment.id}
            postId={comment.post_id}
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
        <div className="pl-6 sm:pl-10 mt-5 relative before:absolute before:top-0 before:bottom-0 before:right-5 before:w-px before:bg-[var(--border-secondary)]">
          <div className="space-y-5">
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
      setComments(originalComments); // بازگرداندن به حالت اولیه در صورت خطا
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
      // حذف دیدگاه و تمام فرزندان آن از state برای آپدیت لحظه‌ای UI
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
        setComments(originalComments); // بازگرداندن به حالت اولیه در صورت خطا
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
    setComments((prev) => [...prev, newComment]);
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[var(--background-primary)] font-sans">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground-primary)] flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-[var(--accent-primary)]" />{" "}
              مرکز فرماندهی دیدگاه‌ها
            </h1>
          </header>
          <div className="mb-8 border-b border-[var(--border-primary)]">
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
                        ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                        : "border-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)] hover:border-[var(--border-secondary)]"
                    } group inline-flex items-center py-4 px-2 sm:px-3 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap`}
                  >
                    <tab.icon className="mr-2 h-5 w-5" />
                    <span>{tab.label}</span>
                    <span
                      className={`${
                        isActive
                          ? "bg-[var(--accent-primary)] text-[var(--background-primary)]"
                          : "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] group-hover:bg-[var(--border-secondary)]"
                      } ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
          <main className="space-y-5">
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
              <div className="text-center py-16 px-4 bg-[var(--background-secondary)] rounded-xl border border-[var(--border-primary)]">
                <MessageSquare className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
                <h3 className="mt-4 text-lg font-medium text-[var(--foreground-primary)]">
                  بدون دیدگاه
                </h3>
                <p className="mt-2 text-sm text-[var(--foreground-secondary)]">
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
