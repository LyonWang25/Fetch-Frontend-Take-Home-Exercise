import React from "react";
import { ArrowUpDown, Heart } from "lucide-react";
import MultipleSearch from "../../MultipleSearch";
import LocationSearch, { LocationSearchRef } from "../../LocationSearch";

interface ISearchControlsProps {
  breeds: string[];
  selectedBreeds: string[];
  favorites: string[];
  sortOrder: "asc" | "desc";
  onMultipleSearch: (
    options: Array<{ category: string; value: string }>
  ) => void;
  onBreedSelect: (breeds: string[]) => void;
  onLocationSelect: (zipCodes: string[]) => void;
  onSortOrderChange: (order: "asc" | "desc") => void;
  onReset: () => void;
  onClearFavorites: () => void;
  onViewFavorites: () => void;
  onMatchSubmit: () => void;
  resetTrigger: boolean;
  locationSearchRef: React.RefObject<LocationSearchRef>;
}

const SearchControls: React.FC<ISearchControlsProps> = ({
  breeds,
  selectedBreeds,
  favorites,
  sortOrder,
  onMultipleSearch,
  onBreedSelect,
  onLocationSelect,
  onSortOrderChange,
  onReset,
  onClearFavorites,
  onViewFavorites,
  onMatchSubmit,
  resetTrigger,
}) => {
  return (
    <div className="p-4">
      <div className="max-w-7xl mx-auto mb-6 bg-white rounded-lg shadow p-4">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Search
          </label>
          <MultipleSearch
            breeds={breeds}
            onSearch={onMultipleSearch}
            resetTrigger={resetTrigger}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Breed
            </label>
            <select
              multiple
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={(e) =>
                onBreedSelect(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              value={selectedBreeds}
              size={4}
            >
              {breeds.map((breed) => (
                <option key={breed} value={breed}>
                  {breed}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col justify-between">
            <div className="flex items-center gap-4 justify-end">
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={() =>
                  onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
                }
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowUpDown size={20} />
                Sort Breeds: {sortOrder === "asc" ? "A to Z" : "Z to A"}
              </button>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClearFavorites}
                disabled={favorites.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Clear Favorites
              </button>
              <button
                onClick={onViewFavorites}
                disabled={favorites.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Heart size={20} />
                View Favorites ({favorites.length})
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <LocationSearch onLocationSelect={onLocationSelect} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {favorites.length > 0 && (
              <span className="text-sm text-gray-600">
                {favorites.length} dog{favorites.length !== 1 ? "s" : ""}{" "}
                selected
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onMatchSubmit}
              disabled={favorites.length === 0}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Find Match
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchControls;
