// app/page.tsx
"use client";
import "@/app/maddahi/css/home.css";
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
export default function Home() {
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [index, setIndex] = useState(-1);
  const [isPlay, setIsPlaying] = useState(false);
  const [selectedUser, setSelectedUser] = useState({ ID: 0 });
  const [reason, setReason] = useState({ ID: 0 });
  const [handle, setHnadle] = useState("");
  const [rand, setRand] = useState(0);
  const [squery, setSQuery] = useState("");
  const [PID, setPID] = useState(0);

  const control = useRef({
    page: 1,
    selectedUser: 0,
    reason: 0,
    rand: 0,
    squery: "",
    index: 0,
  });
  const c = control.current;

  const control2 = useRef({
    squery: "",
  });
  const c2 = control2.current;
  const router = useRouter();

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

  useEffect(() => {
    const params = new URLSearchParams();
    page != 1 ? params.set("page", page) : params.delete("page");
    rand ? params.set("rand", rand) : params.delete("rand");
    selectedUser.ID != 0
      ? params.set("maddah", selectedUser.ID)
      : params.delete("maddah");
    reason.ID != 0
      ? params.set("monasebatha", reason.ID)
      : params.delete("monasebatha");

    squery != "" ? params.set("s", squery) : params.delete("s");

    router.replace(`?${params.toString()}`);
  }, [posts]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (Number(params.get("page"))) {
      control.current.page = Number(params.get("page"));
      setPage(control.current.page);
    }
    if (Number(params.get("rand"))) {
      control.current.rand = Number(params.get("rand"));
      setRand(control.current.rand);
    }
    if (Number(params.get("maddah"))) {
      control.current.selectedUser = Number(params.get("maddah"));
      setSelectedUser({ ID: control.current.selectedUser });
    }
    if (Number(params.get("monasebatha"))) {
      control.current.reason = Number(params.get("monasebatha"));
      setReason({ ID: control.current.reason });
    }
    if (params.get("s")) {
      control.current.squery = params.get("s");
      setSQuery(control.current.squery);
    }

    fetchPosts();
  }, []);

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
