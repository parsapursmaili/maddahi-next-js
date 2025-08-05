// /app/maddahi/components/admin/PostForm.js
"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import moment from "jalali-moment";
import {
  createPost,
  updatePost,
  deletePost,
} from "@/app/maddahi/actions/postActions";
import getTerms from "@/app/maddahi/actions/terms";
import { toShamsi } from "@/app/maddahi/lib/utils/formatDate";

// کامپوننت های جدید
import PostMainContent from "./PostMainContent";
import PostSidebar from "./PostSidebar";
import PostFormActions from "./PostFormActions";
import CollapsibleSection from "./CollapsibleSection"; // Import CollapsibleSection

const defaultPost = {
  ID: null,
  title: "",
  name: "",
  content: "",
  thumbnail: "",
  thumbnail_alt: "",
  categories: [],
  tags: [],
  status: "publish",
  rozeh: "نیست",
  link: "",
  video_link: "",
  description: "",
  comment_status: "open",
  extra_metadata: null,
  date: null,
};

const generateReadableSlug = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\u0600-\u06FF\uFB8A\u067E\u0686\u06AFa-z0-9-]+/g, "")
    .replace(/-+/g, "-")
    .substring(0, 70);

export default function PostForm({
  post: initialPost,
  onFormSubmit,
  onCancel,
}) {
  const postForEditing = initialPost?.ID ? initialPost : defaultPost;
  const pathname = usePathname();

  const [formData, setFormData] = useState({
    ...defaultPost,
    ...postForEditing,
  });
  const [shamsiDate, setShamsiDate] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [terms, setTerms] = useState({ categories: [], tags: [] });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loadingAction, setLoadingAction] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [openSections, setOpenSections] = useState([
    "publish",
    "attributes",
    "categories",
    "tags",
  ]);

  useEffect(() => {
    const initialData = initialPost?.ID ? initialPost : defaultPost;

    let extraData = initialData.extra_metadata;
    if (typeof extraData === "string") {
      try {
        extraData = JSON.parse(extraData);
      } catch (e) {
        extraData = null;
      }
    }

    let dateValue = initialData.date;
    if (dateValue) {
      dateValue = new Date(dateValue).toISOString();
    } else if (!initialData.ID) {
      dateValue = new Date().toISOString();
    }

    setFormData({
      ...initialData,
      name: initialData.name ? decodeURIComponent(initialData.name) : "",
      description: initialData.description || "",
      extra_metadata: extraData || null,
      date: dateValue,
    });

    if (initialData.ID) {
      setIsSlugManuallyEdited(true);
    } else {
      setIsSlugManuallyEdited(false);
    }

    setMessage({ type: "", text: "" });
    setIsDirty(false);
  }, [initialPost]);

  useEffect(() => {
    if (formData.date) {
      setShamsiDate(toShamsi(formData.date, "jYYYY/jM/jD HH:mm"));
    }
  }, [formData.date]);

  useEffect(() => {
    async function fetchTerms() {
      const allTerms = (await getTerms({ req: 2 })) || [];
      setTerms({
        categories: allTerms.filter((t) => t.taxonomy === "category"),
        tags: allTerms.filter((t) => t.taxonomy === "post_tag"),
      });
    }
    fetchTerms();
  }, []);

  const handleDataChange = (update) => {
    setFormData((prev) => ({ ...prev, ...update }));
    if (!isDirty) setIsDirty(true);
  };

  const handleChange = (e) =>
    handleDataChange({ [e.target.name]: e.target.value });

  const handleShamsiDateChange = (e) => {
    const shamsiValue = e.target.value;
    setShamsiDate(shamsiValue);
    const momentDate = moment(shamsiValue, "jYYYY/jM/jD HH:mm", true);
    if (momentDate.isValid()) {
      handleDataChange({ date: momentDate.toISOString() });
    }
  };

  const setDateToNow = () => {
    const now = new Date();
    handleDataChange({ date: now.toISOString() });
    setShamsiDate(toShamsi(now, "jYYYY/jM/jD HH:mm"));
  };

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    const updates = { title: newTitle };
    if (!isSlugManuallyEdited) {
      updates.name = generateReadableSlug(newTitle);
    }
    handleDataChange(updates);
  };

  const handleSlugChange = (e) => {
    if (!isSlugManuallyEdited) {
      setIsSlugManuallyEdited(true);
    }
    handleDataChange({ name: e.target.value });
  };

  const handleSlugBlur = (e) => {
    if (!e.target.value.trim() && formData.title.trim()) {
      setIsSlugManuallyEdited(false);
      handleDataChange({ name: generateReadableSlug(formData.title) });
    }
  };

  const handleContentChange = (content) => handleDataChange({ content });
  const handleTermChange = (selectedIds, termType) =>
    handleDataChange({ [termType]: selectedIds });
  const handleImageChange = (url) => handleDataChange({ thumbnail: url });
  const handleSecondImageChange = (url) =>
    handleDataChange({
      extra_metadata: { ...formData.extra_metadata, second_thumbnail: url },
    });

  const handleBusyState = (isBusy) =>
    setLoadingAction(isBusy ? "upload" : null);

  const toggleSection = (section) => {
    setOpenSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loadingAction) return;
    setLoadingAction("submit");

    // ★★★ شروع ویرایش: تنظیم خودکار متن جایگزین تصویر ★★★
    // یک کپی از داده‌های فرم ایجاد می‌کنیم تا مستقیماً state را تغییر ندهیم
    const finalFormData = { ...formData };

    // اگر متن جایگزین خالی بود، عنوان پست را برای آن قرار بده
    if (!finalFormData.thumbnail_alt?.trim() && finalFormData.title.trim()) {
      finalFormData.thumbnail_alt = finalFormData.title.trim();
    }
    // ★★★ پایان ویرایش ★★★

    // از داده‌های نهایی شده برای ارسال به سرور استفاده می‌کنیم
    const dataToSend = {
      ...finalFormData,
      name: encodeURIComponent(finalFormData.name),
    };

    const result = postForEditing.ID
      ? await updatePost(postForEditing.ID, dataToSend, pathname)
      : await createPost(dataToSend, pathname);

    if (result?.success) {
      setMessage({ type: "success", text: result.message });
      // فرم را با داده‌های نهایی (شامل آلت احتمالی جدید) به‌روز می‌کنیم
      onFormSubmit({
        ...finalFormData,
        ID: postForEditing.ID || result.newPostId,
      });
      setIsDirty(false);
    } else {
      setMessage({ type: "error", text: result?.message || "خطایی رخ داد." });
    }
    setLoadingAction(null);
  };

  const handleDelete = async () => {
    if (!window.confirm(`آیا از حذف پست "${formData.title}" مطمئن هستید؟`))
      return;
    setLoadingAction("delete");
    const result = await deletePost(postForEditing.ID, pathname);
    if (result?.success) {
      setMessage({ type: "success", text: result.message });
      onFormSubmit({ ...formData, ID: postForEditing.ID, deleted: true });
    } else {
      setMessage({ type: "error", text: result?.message || "خطا در حذف." });
      setLoadingAction(null);
    }
  };

  const getButtonText = () => {
    if (loadingAction === "submit") return "در حال ذخیره...";
    if (loadingAction === "upload") return "در حال آپلود...";
    if (loadingAction === "delete") return "در حال حذف...";
    return postForEditing.ID ? "ذخیره تغییرات" : "ایجاد پست";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[var(--background-secondary)] h-full flex flex-col"
    >
      <div className="flex-grow overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <PostMainContent
            formData={formData}
            pathname={pathname}
            handleTitleChange={handleTitleChange}
            handleContentChange={handleContentChange}
            handleChange={handleChange}
            handleImageChange={handleImageChange}
            handleSecondImageChange={handleSecondImageChange}
            handleBusyState={handleBusyState}
          />
          <PostSidebar
            formData={formData}
            shamsiDate={shamsiDate}
            terms={terms}
            openSections={openSections}
            toggleSection={toggleSection}
            handleChange={handleChange}
            handleShamsiDateChange={handleShamsiDateChange}
            setDateToNow={setDateToNow}
            handleSlugChange={handleSlugChange}
            handleSlugBlur={handleSlugBlur}
            handleTermChange={handleTermChange}
            CollapsibleSection={CollapsibleSection}
          />
        </div>
      </div>
      <PostFormActions
        postForEditing={postForEditing}
        loadingAction={loadingAction}
        isDirty={isDirty}
        handleDelete={handleDelete}
        onCancel={onCancel}
        getButtonText={getButtonText}
        message={message}
      />
    </form>
  );
}
