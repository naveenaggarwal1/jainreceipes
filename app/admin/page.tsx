"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import type { Recipe, Profile } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

type AdminTab = "pending" | "all" | "users";

export default function AdminPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<AdminTab>("pending");
  const [pending, setPending] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== "admin") { router.push("/"); return; }
    loadData();
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    const [pendingRes, allRes, usersRes] = await Promise.all([
      supabase.from("recipes").select("*").eq("approved", false).order("created_at", { ascending: false }),
      supabase.from("recipes").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    setPending(pendingRes.data ?? []);
    setAllRecipes(allRes.data ?? []);
    setUsers(usersRes.data ?? []);
    setLoading(false);
  };

  const approve = async (id: string) => {
    await supabase.from("recipes").update({ approved: true }).eq("id", id);
    loadData();
  };

  const reject = async (id: string) => {
    await supabase.from("recipes").delete().eq("id", id);
    loadData();
  };

  const toggleRole = async (u: Profile) => {
    const newRole = u.role === "admin" ? "user" : "admin";
    await supabase.from("profiles").update({ role: newRole }).eq("id", u.id);
    loadData();
  };

  if (user === undefined || !profile) return null;
  if (profile.role !== "admin") return null;

  const TABS: { key: AdminTab; label: string; count?: number }[] = [
    { key: "pending", label: "Pending", count: pending.length },
    { key: "all", label: "All Recipes", count: allRecipes.length },
    { key: "users", label: "Users", count: users.length },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Manage recipes and community members</p>
        </div>
        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">ADMIN</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {TABS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all border ${
              tab === key ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            {label}
            {count !== undefined && (
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${tab === key ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* Pending recipes */}
          {tab === "pending" && (
            <div>
              {pending.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="font-medium">No pending recipes — all clear!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pending.map((r) => (
                    <div key={r.id} className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-amber-100 shadow-sm">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{r.title}</p>
                        <p className="text-sm text-gray-400">{r.category} · by {r.author_name}</p>
                      </div>
                      <Link href={`/recipe?id=${r.id}`} target="_blank"
                        className="text-sm text-gray-400 hover:text-gray-700 transition-colors">Preview ↗</Link>
                      <button onClick={() => approve(r.id)}
                        className="px-4 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-full hover:bg-green-600 transition-colors">
                        Approve
                      </button>
                      <button onClick={() => reject(r.id)}
                        className="px-4 py-1.5 bg-red-500 text-white text-sm font-semibold rounded-full hover:bg-red-600 transition-colors">
                        Reject
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All recipes */}
          {tab === "all" && (
            <div className="space-y-3">
              {allRecipes.map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{r.title}</p>
                    <p className="text-sm text-gray-400">{r.category} · by {r.author_name}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {r.approved ? "Published" : "Pending"}
                  </span>
                  {!r.approved && (
                    <button onClick={() => approve(r.id)}
                      className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full hover:bg-green-600">
                      Approve
                    </button>
                  )}
                  <button onClick={() => reject(r.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full hover:bg-red-200">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Users */}
          {tab === "users" && (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-amber-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {u.username?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{u.username}</p>
                    <p className="text-sm text-gray-400 truncate">{u.id}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === "admin" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-600"}`}>
                    {u.role}
                  </span>
                  {u.id !== user?.id && (
                    <button
                      onClick={() => toggleRole(u)}
                      className="px-3 py-1 border border-gray-200 text-xs font-medium rounded-full hover:border-orange-300 hover:text-orange-500 transition-colors"
                    >
                      {u.role === "admin" ? "Demote" : "Make Admin"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
