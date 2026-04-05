"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
  }, []);

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
          Jain<span className="text-orange-500">Rasoi</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/recipes" className="hover:text-gray-900 transition-colors">Recipes</Link>
          {user && <Link href="/submit" className="hover:text-gray-900 transition-colors">Submit</Link>}
          {profile?.role === "admin" && (
            <Link href="/admin" className="hover:text-orange-500 transition-colors">Admin</Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="hover:text-gray-900 transition-colors">
                {profile?.username ?? "Profile"}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="px-4 py-1.5 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-5 h-0.5 bg-gray-700 mb-1" />
          <div className="w-5 h-0.5 bg-gray-700 mb-1" />
          <div className="w-5 h-0.5 bg-gray-700" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3 text-sm font-medium text-gray-700">
          <Link href="/recipes" onClick={() => setMenuOpen(false)}>Recipes</Link>
          {user && <Link href="/submit" onClick={() => setMenuOpen(false)}>Submit Recipe</Link>}
          {profile?.role === "admin" && (
            <Link href="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>
          )}
          {user ? (
            <>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
              <button onClick={handleLogout} className="text-left text-red-500">Sign out</button>
            </>
          ) : (
            <Link href="/auth" onClick={() => setMenuOpen(false)} className="text-orange-500 font-semibold">Sign in</Link>
          )}
        </div>
      )}
    </nav>
  );
}
