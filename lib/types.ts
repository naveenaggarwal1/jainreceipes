export type JainTag = "no_root_veg" | "paryushan" | "upvas" | "no_onion_garlic";
export type RecipeCategory = "Main Dish" | "Dessert" | "Snack" | "Fasting" | "Breakfast";

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  role: "user" | "admin";
  created_at: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  category: RecipeCategory;
  jain_tags: JainTag[];
  author_id: string;
  author_name: string;
  approved: boolean;
  image_url: string | null;
  created_at: string;
  avg_rating?: number;
  rating_count?: number;
}

export interface Rating {
  id: string;
  recipe_id: string;
  user_id: string;
  score: number;
  review: string | null;
  created_at: string;
  profiles?: { username: string };
}

export interface Bookmark {
  id: string;
  recipe_id: string;
  user_id: string;
  created_at: string;
}
