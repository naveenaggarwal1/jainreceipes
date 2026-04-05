"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

interface StarRatingProps {
  recipeId: string;
  userId: string | null;
  existingScore?: number;
  existingReview?: string;
  onSaved?: () => void;
}

export default function StarRating({ recipeId, userId, existingScore, existingReview, onSaved }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const [score, setScore] = useState(existingScore ?? 0);
  const [review, setReview] = useState(existingReview ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSave = async () => {
    if (!userId) { window.location.href = "/auth"; return; }
    if (!score) { setError("Pick a star rating first."); return; }
    setSaving(true);
    setError("");
    const { error: err } = await supabase.from("ratings").upsert(
      { recipe_id: recipeId, user_id: userId, score, review: review || null },
      { onConflict: "recipe_id,user_id" }
    );
    setSaving(false);
    if (err) { setError(err.message); return; }
    onSaved?.();
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onMouseEnter={() => setHovered(s)}
            onClick={() => setScore(s)}
            className={`text-2xl transition-colors ${s <= (hovered || score) ? "text-amber-400" : "text-gray-200"}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="Write a short review (optional)..."
        rows={3}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2 bg-orange-500 text-white rounded-full text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving…" : existingScore ? "Update rating" : "Submit rating"}
      </button>
    </div>
  );
}
