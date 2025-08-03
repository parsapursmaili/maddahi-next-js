// /app/maddahi/components/admin/PostFormActions.js
import { Save, AlertCircle } from "lucide-react";

export default function PostFormActions({
  postForEditing,
  loadingAction,
  isDirty,
  handleDelete,
  onCancel,
  getButtonText,
  message,
}) {
  return (
    <div className="flex-shrink-0 p-4 border-t border-[var(--border-primary)] bg-[var(--background-primary)]">
      {message.text && (
        <p
          className={`text-sm text-center mb-4 p-3 rounded-md ${
            message.type === "success"
              ? "bg-green-500/10 text-[var(--success)]"
              : "bg-red-500/10 text-[var(--error)]"
          }`}
        >
          {message.text}
        </p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {postForEditing.ID && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={!!loadingAction}
              className="px-6 py-2 text-sm transition-colors border rounded-md disabled:opacity-50 text-[var(--error)] border-[var(--error)] hover:bg-red-500/10"
            >
              {loadingAction === "delete" ? "در حال حذف..." : "حذف"}
            </button>
          )}
          {isDirty && !loadingAction && (
            <div className="flex items-center gap-2 text-sm text-yellow-400 animate-pulse ml-4">
              <AlertCircle size={16} />
              <span>تغییرات ذخیره‌نشده</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-sm transition-colors rounded-md bg-[var(--background-tertiary)] hover:bg-[var(--foreground-muted)] hidden md:block"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={!!loadingAction}
            className="flex items-center gap-2 px-8 py-2 text-sm font-semibold text-black transition-colors rounded-md disabled:opacity-50 bg-[var(--accent-primary)] hover:bg-[var(--accent-crystal-highlight)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-secondary)] focus:ring-[var(--accent-primary)]"
          >
            <Save size={16} />
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}
