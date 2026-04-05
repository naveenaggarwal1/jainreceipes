"use client";

import type { JainTag } from "@/lib/types";

const FILTERS: { tag: JainTag; label: string; emoji: string }[] = [
  { tag: "no_root_veg",    label: "No Root Veg",     emoji: "🥕" },
  { tag: "paryushan",      label: "Paryushan",        emoji: "🙏" },
  { tag: "upvas",          label: "Upvas / Fasting",  emoji: "🌙" },
  { tag: "no_onion_garlic",label: "No Onion/Garlic",  emoji: "🧅" },
];

interface FilterBarProps {
  active: JainTag[];
  onChange: (tags: JainTag[]) => void;
}

export default function FilterBar({ active, onChange }: FilterBarProps) {
  const toggle = (tag: JainTag) => {
    onChange(
      active.includes(tag) ? active.filter((t) => t !== tag) : [...active, tag]
    );
  };

  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ tag, label, emoji }) => {
        const on = active.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => toggle(tag)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all
              ${on
                ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-500"
              }`}
          >
            <span>{emoji}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
