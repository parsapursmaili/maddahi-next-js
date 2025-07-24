"use client";

import React, { useState, useMemo } from "react";
import {
  MessageSquare,
  Check,
  ShieldAlert,
  Trash2,
  List,
  Pencil,
  Reply,
  User,
  Mail,
  Clock,
} from "lucide-react";
import {
  updateCommentStatus,
  updateCommentDetails,
} from "@/app/maddahi/actions/commentActions";
import EditCommentModal from "./EditCommentModal";

const STATUS = {
  PENDING: 0,
  APPROVED: 1,
  TRASH: 2,
  SPAM: 3,
};

const statusConfig = {
  [STATUS.PENDING]: {
    text: "در انتظار",
    color: "text-yellow-400",
    icon: Clock,
  },
  [STATUS.APPROVED]: {
    text: "منتشر شده",
    color: "text-[var(--success)]",
    icon: Check,
  },
  [STATUS.TRASH]: {
    text: "زباله",
    color: "text-[var(--foreground-muted)]",
    icon: Trash2,
  },
  [STATUS.SPAM]: {
    text: "اسپم",
    color: "text-[var(--error)]",
    icon: ShieldAlert,
  },
};

const TABS = [
  { id: "all", label: "همه", icon: List },
  { id: STATUS.PENDING, label: "در انتظار", icon: Clock },
  { id: STATUS.APPROVED, label: "منتشر شده", icon: Check },
  { id: STATUS.SPAM, label: "اسپم", icon: ShieldAlert },
  { id: STATUS.TRASH, label: "زباله", icon: Trash2 },
];

export default function CommentManager({ initialComments }) {
  const [comments, setComments] = useState(initialComments);
  const [activeTab, setActiveTab] = useState("all");
  const [editingComment, setEditingComment] = useState(null);
  const [loadingAction, setLoadingAction] = useState(null); // برای نمایش لودینگ روی دکمه‌ها

  const filteredComments = useMemo(() => {
    if (activeTab === "all") return comments;
    return comments.filter((c) => c.status === activeTab);
  }, [comments, activeTab]);

  const handleStatusChange = async (id, newStatus) => {
    setLoadingAction(id);
    // Optimistic UI Update
    const originalComments = [...comments];
    const updatedComments = comments.map((c) =>
      c.id === id ? { ...c, status: newStatus } : c
    );
    setComments(updatedComments);

    const result = await updateCommentStatus(id, newStatus);
    if (!result.success) {
      // Rollback on failure
      setComments(originalComments);
      alert(result.message); // یا یک سیستم نوتیفیکیشن بهتر
    }
    setLoadingAction(null);
  };

  const handleSaveChanges = async (id, data) => {
    const result = await updateCommentDetails(id, data);
    if (result.success) {
      // آپدیت UI پس از موفقیت
      const updatedComments = comments.map((c) =>
        c.id === id ? { ...c, ...data } : c
      );
      setComments(updatedComments);
      setEditingComment(null); // بستن مودال
    } else {
      alert(result.message);
    }
    return result.success;
  };

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground-primary)] flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-[var(--accent-primary)]" />
              مدیریت دیدگاه‌ها
            </h1>
            <p className="mt-2 text-lg text-[var(--foreground-secondary)]">
              بررسی، ویرایش و مدیریت تمام دیدگاه‌های ارسال شده.
            </p>
          </header>

          {/* Tabs */}
          <div className="mb-6 border-b border-[var(--border-primary)]">
            <nav
              className="-mb-px flex space-x-0 sm:space-x-4"
              aria-label="Tabs"
            >
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
                    className={`
                      ${
                        isActive
                          ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                          : "border-transparent text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)] hover:border-[var(--border-secondary)]"
                      }
                      group inline-flex items-center py-4 px-1 sm:px-2 border-b-2 font-medium text-sm transition-colors duration-200
                    `}
                  >
                    <tab.icon className={`-ml-0.5 mr-2 h-5 w-5`} />
                    <span>{tab.label}</span>
                    <span
                      className={`
                      ${
                        isActive
                          ? "bg-[var(--accent-primary)] text-[var(--background-primary)]"
                          : "bg-[var(--background-tertiary)] text-[var(--foreground-secondary)] group-hover:bg-[var(--border-secondary)]"
                      }
                      hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block
                    `}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Comments List */}
          <div className="bg-[var(--background-secondary)] shadow-lg rounded-xl overflow-hidden border border-[var(--border-primary)]">
            <ul role="list" className="divide-y divide-[var(--border-primary)]">
              {filteredComments.map((comment) => (
                <li
                  key={comment.id}
                  className="p-4 sm:p-6 hover:bg-[var(--background-tertiary)] transition-colors duration-200 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-5 h-5 text-[var(--foreground-muted)]" />
                        <p className="text-sm font-bold text-[var(--foreground-primary)] truncate">
                          {comment.name}
                        </p>
                        <p className="text-sm text-[var(--foreground-muted)] truncate">
                          {comment.email}
                        </p>
                      </div>

                      {comment.parent_id && (
                        <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)] mb-3 pl-2 border-l-2 border-[var(--border-secondary)]">
                          <Reply className="w-3 h-3" />
                          <span>در پاسخ به: </span>
                          <span className="font-semibold">
                            {comment.parent_author || "دیدگاه حذف شده"}
                          </span>
                        </div>
                      )}

                      <p className="text-[var(--foreground-primary)] text-base leading-relaxed whitespace-pre-wrap">
                        {comment.text}
                      </p>

                      <div className="mt-3 flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
                        <div
                          className={`flex items-center gap-1.5 ${
                            statusConfig[comment.status].color
                          }`}
                        >
                          {React.createElement(
                            statusConfig[comment.status].icon,
                            { className: "w-4 h-4" }
                          )}
                          <span>{statusConfig[comment.status].text}</span>
                        </div>
                        <span>•</span>
                        <span>
                          {new Date(comment.created_at).toLocaleString("fa-IR")}
                        </span>
                        <span>•</span>
                        <span>IP: {comment.ip_address}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 flex items-center space-x-1 space-x-reverse">
                      <button
                        onClick={() => setEditingComment(comment)}
                        className="p-2 rounded-full hover:bg-[var(--background-primary)] text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)] transition-colors"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                      {comment.status !== STATUS.APPROVED && (
                        <button
                          onClick={() =>
                            handleStatusChange(comment.id, STATUS.APPROVED)
                          }
                          className="p-2 rounded-full hover:bg-[var(--background-primary)] text-[var(--success)] transition-colors"
                          disabled={loadingAction === comment.id}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      {comment.status !== STATUS.SPAM && (
                        <button
                          onClick={() =>
                            handleStatusChange(comment.id, STATUS.SPAM)
                          }
                          className="p-2 rounded-full hover:bg-[var(--background-primary)] text-[var(--error)] transition-colors"
                          disabled={loadingAction === comment.id}
                        >
                          <ShieldAlert className="w-5 h-5" />
                        </button>
                      )}
                      {comment.status !== STATUS.TRASH && (
                        <button
                          onClick={() =>
                            handleStatusChange(comment.id, STATUS.TRASH)
                          }
                          className="p-2 rounded-full hover:bg-[var(--background-primary)] text-[var(--foreground-muted)] hover:text-[var(--error)] transition-colors"
                          disabled={loadingAction === comment.id}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {filteredComments.length === 0 && (
              <div className="text-center py-12 px-4">
                <MessageSquare className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
                <h3 className="mt-2 text-sm font-medium text-[var(--foreground-primary)]">
                  بدون دیدگاه
                </h3>
                <p className="mt-1 text-sm text-[var(--foreground-secondary)]">
                  در این دسته‌بندی دیدگاهی برای نمایش وجود ندارد.
                </p>
              </div>
            )}
          </div>
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
