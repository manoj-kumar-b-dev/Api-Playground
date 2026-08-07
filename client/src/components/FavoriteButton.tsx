import React from "react";
import { Star } from "lucide-react";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: (e: React.MouseEvent) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  size = "md",
  className = "",
}) => {
  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
        isFavorite
          ? "text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20"
          : "text-slate-400 hover:text-amber-400 hover:bg-slate-800 border border-transparent"
      } ${className}`}
    >
      <Star
        className={`${iconSizes[size]} ${
          isFavorite ? "fill-amber-400 text-amber-400" : ""
        }`}
      />
    </button>
  );
};
