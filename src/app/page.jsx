// app/page.tsx
"use client";
import "./css/home.css";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Salam from "./componenet/maddahiha/maddahan";
import Pagination from "./componenet/maddahiha/pagination";
import MusicPlayer from "./componenet/maddahiha/musicPlayer";
import Posts from "./componenet/maddahiha/posts";
import Reason from "./componenet/maddahiha/monasebatha";
import Random from "./componenet/maddahiha/random";
import Search from "./componenet/search";
import getPosts from "@/app/actions/getPost";
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
  const [ntf, setNTF] = useState(0);
  const [PID, setPID] = useState(0);

  const control = useRef({
    page: 1,
    selectedUser: 0,
    reason: 0,
    rand: 0,
    squery: "",
    r: false,
    index: 0,
  });
  const control2 = useRef({
    page: 1,
    selectedUser: 0,
    reason: 0,
    rand: 0,
    squery: "",
    n: 0,
  });

  const router = useRouter();

  function compare() {
    if (
      control.current.page == control2.current.page &&
      control.current.selectedUser == control2.current.selectedUser &&
      control.current.reason == control2.current.reason &&
      control.current.rand == control2.current.rand &&
      control.current.squery == control2.current.squery
    ) {
      return true;
    }
    return false;
  }

  function equalControl() {
    control2.current.page = control.current.page;
    control2.current.selectedUser = control.current.selectedUser;
    control2.current.reason = control.current.reason;
    control2.current.rand = control.current.rand;
    control2.current.squery = control.current.squery;
  }

  useEffect(() => {
    if (!control.current.r) return;
    if (control.current.squery.length == 0) {
      set();
      setNTF(ntf + 1);
      return;
    }
    if (compare()) return;
    if (selectedUser.ID) {
      control.current.selectedUser = 0;
      setSelectedUser({ ID: 0 });
    }
    if (reason.ID) {
      control.current.reason = 0;
      setReason({ ID: 0 });
    }
    if (rand) {
      control.current.rand = 0;
      setRand(0);
    }
    set();
    setNTF(ntf + 1);
  }, [squery]);

  useEffect(() => {
    if (!control.current.r) return;
    if (compare()) return;
    if (
      control.current.selectedUser == 0 &&
      control.current.reason == 0 &&
      control.current.rand == 0
    ) {
      set();
      setNTF(ntf + 1);
      return;
    }
    if (squery.length > 0) {
      control.current.squery = "";
      setSQuery("");
    }
    set();
    setNTF(ntf + 1);
  }, [selectedUser, reason, rand]);

  useEffect(() => {
    if (!control.current.r) return;
    if (compare()) return;
    equalControl();
    if (control.current.index) {
      control.current.index = 0;
      setIndex(0);
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
      try {
        const response = await getPosts(filter);

        setPosts(response.post || []);
        setTotal(response.total || 0);

        if (control.current.n == 1) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setHnadle(data.posts2[0].link);
        }

        control.current.n = 0;
      } catch (error) {
        console.error("Fetch Error:", error);
      }
    }

    fetchPosts();
  }, [ntf]);

  function set() {
    setIndex(-1);
    setPage(1);
    control.current.page = 1;
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
    if (
      control.current.page == 1 &&
      control.current.rand == 0 &&
      control.current.selectedUser == 0 &&
      control.current.reason == 0 &&
      control.current.squery.length == 0
    ) {
      control2.current.page = 5;
      setNTF(1);
    }
    control.current.r = true;
  }, []);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="pb-50 container mx-auto p-4">
      <Pagination
        ntf={ntf}
        control={control}
        setNTF={setNTF}
        setIndex={setIndex}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Salam
          control={control}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
        />
        <Reason control={control} reason={reason} setReason={setReason} />
        <Random control={control} rand={rand} setRand={setRand} />
        <Search control={control} setSQuery={setSQuery} squery={squery} />
      </div>

      <MusicPlayer
        ntf={ntf}
        setNTF={setNTF}
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
      />
    </div>
  );
}
