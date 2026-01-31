"use client";

import { useEffect, useState } from "react";

function randCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function TeamPage() {
  const [supabase, setSupabase] = useState<any>(null);

  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");

  const [teams, setTeams] = useState<any[]>([]);
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // ✅ 브라우저에서만 supabase 로딩
  useEffect(() => {
    (async () => {
      const mod = await import("@/lib/supabaseClient");
      setSupabase(mod.supabase);
    })();
  }, []);

  // ✅ auth 구독
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }: any) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // ✅ 팀 로드
  useEffect(() => {
    if (!supabase || !user) return;
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, user]);

  async function loadTeams() {
    if (!supabase) return;

    const { data: memberRows } = await supabase.from("team_members").select("team_id, role");
    const ids = (memberRows ?? []).map((r: any) => r.team_id);

    if (!ids.length) {
      setTeams([]);
      return;
    }

    const { data: teamRows } = await supabase.from("teams").select("*").in("id", ids);
    setTeams(teamRows ?? []);
  }

  async function signIn() {
    if (!supabase) return alert("Supabase 준비 중…");
    if (!email.trim()) return;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/team` },
    });

    if (error) alert(error.message);
    else alert("이메일로 로그인 링크 보냈어! (스팸함도 확인)");
  }

  function devLogin() {
    setUser({ id: "dev-user", email: "dev@local" });
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  async function createTeam() {
    if (!supabase) return;
    if (!teamName.trim()) return;

    const { data: t, error } = await supabase
      .from("teams")
      .insert({ name: teamName.trim() })
      .select("*")
      .single();

    if (error) return alert(error.message);

    await supabase.from("team_members").insert({ team_id: t.id, user_id: user.id, role: "owner" });
    setTeamName("");
    await loadTeams();
  }

  async function createInvite(team_id: string, role: "admin" | "member" | "viewer" = "member") {
    if (!supabase) return;

    const code = randCode();
    const { error } = await supabase.from("team_invites").insert({
      team_id,
      invite_code: code,
      role,
      expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    });

    if (error) return alert(error.message);
    alert(`초대코드: ${code} (7일 유효)`);
  }

  async function joinByCode() {
    if (!supabase) return;

    const code = joinCode.trim().toUpperCase();
    if (!code) return;

    const { data: inv, error } = await supabase.from("team_invites").select("*").eq("invite_code", code).single();
    if (error || !inv) return alert("초대코드가 유효하지 않아.");
    if (inv.expires_at && new Date(inv.expires_at).getTime() < Date.now()) return alert("초대코드 만료!");

    const { error: insErr } = await supabase.from("team_members").insert({
      team_id: inv.team_id,
      user_id: user.id,
      role: inv.role,
    });
    if (insErr) return alert(insErr.message);

    setJoinCode("");
    await loadTeams();
    alert("팀 가입 완료!");
  }

  if (!supabase) {
    return (
      <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
        <h1>🧑‍🤝‍🧑 Team / Login</h1>
        <p style={{ opacity: 0.7 }}>Supabase 준비 중…</p>
        <a href="/">Design</a>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1>🧑‍🤝‍🧑 Team / Login</h1>

      {!user ? (
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <h3>로그인</h3>
          <p style={{ opacity: 0.8 }}>이메일 OTP(매직 링크)로 로그인</p>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
            <button onClick={signIn}>Send Link</button>
            <button onClick={devLogin}>DEV Login</button>
            <a href="/" style={{ marginLeft: "auto", fontSize: 14 }}>Design</a>
          </div>
        </section>
      ) : (
        <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div>
                <b>Logged in</b>: {user.email}
              </div>
              <div style={{ opacity: 0.7, fontSize: 12 }}>uid: {user.id}</div>
            </div>
            <button onClick={signOut}>Sign out</button>
          </div>

          <hr />

          <h3>팀 만들기</h3>
          <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team name" />
          <button onClick={createTeam} style={{ marginLeft: 8 }}>Create</button>

          <hr />

          <h3>초대코드로 팀 가입</h3>
          <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="INVITE CODE" />
          <button onClick={joinByCode} style={{ marginLeft: 8 }}>Join</button>

          <hr />

          <h3>내 팀</h3>
          {teams.length === 0 ? <p style={{ opacity: 0.7 }}>아직 팀이 없어.</p> : null}

          <ul>
            {teams.map((t) => (
              <li key={t.id} style={{ marginBottom: 10 }}>
                <b>{t.name}</b>
                <div style={{ marginTop: 6, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => createInvite(t.id, "member")}>Invite(member)</button>
                  <button onClick={() => createInvite(t.id, "viewer")}>Invite(viewer)</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
