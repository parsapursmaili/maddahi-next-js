// app/maddahi/componenet/MaddahiClientPage.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Maddahan from "@/app/maddahi/componenet/maddahiha/maddahan";
import Pagination from "@/app/maddahi/componenet/maddahiha/pagination";
import MusicPlayer from "@/app/maddahi/componenet/maddahiha/musicPlayer";
import Posts from "@/app/maddahi/componenet/maddahiha/posts";
import Reason from "@/app/maddahi/componenet/maddahiha/monasebatha";
import Random from "@/app/maddahi/componenet/maddahiha/random";
import Search from "@/app/maddahi/componenet/maddahiha/search";
import getPosts from "@/app/maddahi/actions/getPost";

export default function MaddahiClientPage({
  initialPosts,
  initialTotal,
  initialSearchParams,
}) {
  // State ها با مقادیر اولیه دریافت شده از سرور مقداردهی می‌شوند
  const [posts, setPosts] = useState(initialPosts);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialSearchParams.page);
  const [selectedUser, setSelectedUser] = useState({
    ID: initialSearchParams.maddah,
  });
  const [reason, setReason] = useState({ ID: initialSearchParams.monasebat });
  const [rand, setRand] = useState(initialSearchParams.rand);
  const [squery, setSQuery] = useState(initialSearchParams.s);

  // بقیه state ها بدون تغییر باقی می‌مانند
  const [index, setIndex] = useState(-1);
  const [isPlay, setIsPlaying] = useState(false);
  const [handle, setHnadle] = useState("");
  const [PID, setPID] = useState(0);

  const control = useRef({
    page: initialSearchParams.page,
    selectedUser: initialSearchParams.maddah,
    reason: initialSearchParams.monasebat,
    rand: initialSearchParams.rand,
    squery: initialSearchParams.s,
    index: -1,
    n: 0,
  });
  const c = control.current;

  const control2 = useRef({
    squery: initialSearchParams.s,
  });
  const c2 = control2.current;
  const router = useRouter();

  // این تابع برای فچ کردن داده‌ها در سمت کلاینت (پس از بارگذاری اولیه) استفاده می‌شود
  async function fetchPosts() {
    const filter = {
      page: control.current.page,
      maddah: control.current.selectedUser,
      monasebat: control.current.reason,
      rand: control.current.rand,
      s: control.current.squery,
      terms: 1,
    };
    c2.squery = c.squery;
    try {
      const response = await getPosts(filter);
      setPosts(response.post || []);
      setTotal(response.total || 0);

      if (control.current.n == 1) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setHnadle(response.post[0].link);
        setPID(response.post[0].ID);
      }
      control.current.n = 0;
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  }

  // این تابع بدون تغییر باقی می‌ماند
  function set(phaze) {
    if (phaze == 1) {
      control.current.squery = "";
      setSQuery("");
    }
    if (phaze == 2) {
      control.current.selectedUser = 0;
      setSelectedUser({ ID: 0 });
      control.current.reason = 0;
      setReason({ ID: 0 });
      control.current.rand = 0;
      setRand(0);
    }
    if (phaze != 3) {
      control.current.page = 1;
      setPage(1);
    }
    control.current.index = -1;
    setIndex(-1);
    if (phaze == 3) {
      control.current.index = 0;
      setIndex(0);
    }
    fetchPosts();
  }

  // این useEffect فقط برای به‌روزرسانی URL در سمت کلاینت پس از هر تغییر است
  useEffect(() => {
    const params = new URLSearchParams();
    page !== 1 ? params.set("page", String(page)) : params.delete("page");
    rand ? params.set("rand", String(rand)) : params.delete("rand");
    selectedUser.ID !== 0
      ? params.set("maddah", String(selectedUser.ID))
      : params.delete("maddah");
    reason.ID !== 0
      ? params.set("monasebatha", String(reason.ID))
      : params.delete("monasebatha");
    squery !== "" ? params.set("s", squery) : params.delete("s");

    // از متد replace برای جلوگیری از ایجاد تاریخچه اضافی در مرورگر استفاده می‌شود
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [page, rand, selectedUser, reason, squery, router]);

  // useEffect که برای فچ اولیه در کد شما بود حذف شده، چون این کار در کامپوننت سرور انجام می‌شود

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="pb-50 container mx-auto p-4">
      <Pagination
        control={control}
        set={set}
        setIndex={setIndex}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Maddahan
          control={control}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          set={set}
        />
        <Reason
          control={control}
          reason={reason}
          setReason={setReason}
          set={set}
        />
        <Random control={control} rand={rand} setRand={setRand} set={set} />
        <Search
          c2={c2}
          control={control}
          setSQuery={setSQuery}
          squery={squery}
          set={set}
        />
      </div>

      <MusicPlayer
        control={control}
        page={page}
        setPage={setPage}
        index={index}
        setIndex={setIndex}
        totalPages={totalPages}
        posts={posts}
        handle={handle}
        setHandle={setHnadle}
        isPlay={isPlay}
        setIsPlaying={setIsPlaying}
        setPID={setPID}
        set={set}
      />

      <Posts
        posts={posts}
        setIndex={setIndex}
        index={index}
        setHnadle={setHnadle}
        isPlay={isPlay}
        setIsPlaying={setIsPlaying}
        PID={PID}
        setPID={setPID}
        set={set}
      />
    </div>
  );
}
