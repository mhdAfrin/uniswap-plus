import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle({ className = "", showLabel = false }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${className}`}
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle dark / light theme"
    >
      <span className="theme-toggle-icon-wrap">
        {isDark ? (
          <Sun size={18} className="theme-icon sun-icon" />
        ) : (
          <Moon size={18} className="theme-icon moon-icon" />
        )}
      </span>
      {showLabel && (
        <span className="theme-toggle-label">{isDark ? "Light mode" : "Dark mode"}</span>
      )}
    </button>
  );
}

export default ThemeToggle;
