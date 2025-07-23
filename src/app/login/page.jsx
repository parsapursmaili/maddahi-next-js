// app/login/page.jsx
"use client";

import { login } from "@/app/actions/auth";
import { useFormState, useFormStatus } from "react-dom";

// --- کامپوننت‌های داخلی برای ساختار تمیزتر ---

// آیکن قفل با استایل مدرن‌تر
const LockIcon = () => (
  <svg
    className="w-8 h-8 text-[var(--foreground-muted)]"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
    />
  </svg>
);

// اینپوت با لیبل شناور: یک تجربه کاربری بسیار مدرن
function FloatingLabelInput({ id, name, type, children }) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        required
        // placeholder باید یک فاصله خالی باشد تا انیمیشن لیبل کار کند
        placeholder=" "
        className="
          peer block w-full px-4 py-3 bg-transparent 
          border-b-2 border-[var(--border-primary)] 
          text-[var(--foreground-primary)] placeholder-transparent 
          focus:outline-none focus:border-[var(--accent-primary)] 
          transition-colors duration-300
        "
      />
      <label
        htmlFor={id}
        className="
          absolute left-4 top-3 text-[var(--foreground-secondary)] 
          transition-all duration-300 ease-in-out
          peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
          peer-focus:-top-5 peer-focus:text-xs peer-focus:text-[var(--accent-primary)]
          -top-5 text-xs 
        "
      >
        {children}
      </label>
    </div>
  );
}

// سوییچ سفارشی که فقط با Tailwind ساخته شده است
function CustomToggleSwitch({ id, name, children }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center cursor-pointer select-none"
    >
      <div className="relative">
        <input
          id={id}
          name={name}
          type="checkbox"
          className="sr-only peer"
          defaultChecked
        />
        <div
          className="
            block w-12 h-7 rounded-full 
            bg-[var(--background-tertiary)] border border-[var(--border-primary)]
            peer-checked:bg-[var(--accent-primary)] transition-colors
          "
        ></div>
        <div
          className="
            absolute left-1 top-1 w-5 h-5 rounded-full 
            bg-[var(--foreground-secondary)] 
            peer-checked:bg-white peer-checked:translate-x-full 
            transition-all duration-300 ease-in-out
          "
        ></div>
      </div>
      <span className="ml-3 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground-primary)] transition-colors">
        {children}
      </span>
    </label>
  );
}

// دکمه ورود با افکت نوری "آرورا"
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="
        group relative w-full flex justify-center py-3 px-4 mt-4
        border border-transparent rounded-lg shadow-lg
        text-sm font-bold text-white uppercase tracking-wider
        bg-[var(--accent-primary)] 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-secondary)] focus:ring-[var(--accent-crystal-highlight)]
        transition-all duration-300 overflow-hidden
        disabled:bg-[var(--foreground-muted)] disabled:cursor-not-allowed
      "
    >
      {/* افکت نوری که هنگام هاور ظاهر می‌شود */}
      <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[var(--accent-crystal-highlight)]/50 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></span>
      <span className="relative">
        {pending ? "در حال تایید..." : "ورود امن"}
      </span>
    </button>
  );
}

// --- کامپوننت اصلی صفحه ---
export default function LoginPage() {
  const initialState = { message: null, success: false };
  const [state, formAction] = useFormState(login, initialState);

  return (
    <main className="flex items-center justify-center min-h-screen bg-[var(--background-primary)] p-4 font-sans">
      {/* پس‌زمینه با گرادینت شعاعی برای ایجاد عمق */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[var(--background-secondary)] via-[var(--background-primary)] to-[var(--background-primary)]"></div>

      {/* کانتینر فرم */}
      <div
        key={state?.success ? "form-wrapper-success" : "form-wrapper-initial"} // برای ریست انیمیشن
        className={`
          relative z-10 w-full max-w-md p-8 md:p-10 space-y-8 
          bg-[var(--background-secondary)]/50 backdrop-blur-xl
          rounded-2xl shadow-2xl border border-[var(--border-primary)]
          animate-in fade-in-0 slide-in-from-bottom-10 duration-700
          ${state?.message ? "animate-shake" : ""}
        `}
      >
        <div className="text-center">
          <div className="inline-block p-3 mb-4 bg-[var(--background-tertiary)] rounded-full border border-[var(--border-secondary)]">
            <LockIcon />
          </div>
          <h1 className="text-3xl font-bold text-[var(--foreground-primary)]">
            ورود به پنل
          </h1>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            به فضای امن خود خوش آمدید.
          </p>
        </div>

        <form action={formAction} className="space-y-8">
          <FloatingLabelInput id="password" name="password" type="password">
            رمز عبور
          </FloatingLabelInput>

          <CustomToggleSwitch id="remember-me" name="remember-me">
            مرا به خاطر بسپار
          </CustomToggleSwitch>

          <SubmitButton />

          {/* نمایش پیام خطا */}
          {state?.message && (
            <div
              key={state.message} // برای اجرای مجدد انیمیشن
              className="flex items-center justify-center p-3 text-sm text-center text-white bg-[var(--error)]/20 border border-[var(--error)] rounded-lg animate-in fade-in-0"
              role="alert"
            >
              {state.message}
            </div>
          )}
        </form>

        <p className="text-center text-xs text-[var(--foreground-muted)] pt-4 border-t border-[var(--border-primary)]">
          © {new Date().getFullYear()} All Rights Reserved.
        </p>
      </div>
    </main>
  );
}
