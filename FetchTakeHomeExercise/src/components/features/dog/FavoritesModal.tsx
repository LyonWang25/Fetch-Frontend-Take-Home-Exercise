import React from "react";
import { Heart } from "lucide-react";
import { Dog } from "../../../api";

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  favoriteDogs: Dog[];
  onToggleFavorite: (id: string) => void;
  onClearAll: () => void;
  onMatchSubmit: () => void;
}

const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favoriteDogs = [], 
  onToggleFavorite,
  onClearAll,
  onMatchSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            Your Favorite Dogs ({favoriteDogs?.length || 0})
          </h2>
          <div className="flex items-center gap-2">
            {favoriteDogs?.length > 0 && (
              <button
                onClick={onMatchSubmit}
                className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1 mr-4"
              >
                Find Match
              </button>
            )}
            <button
              onClick={onClearAll}
              className="text-gray-500 hover:text-red-600 text-sm flex items-center gap-1 mr-4"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {favoriteDogs?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteDogs.map((dog) => (
              <FavoriteCard
                key={dog.id}
                dog={dog}
                onRemove={() => onToggleFavorite(dog.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No favorite dogs yet. Heart some dogs to add them to your favorites!
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

interface FavoriteCardProps {
  dog: Dog;
  onRemove: () => void;
}

const FavoriteCard: React.FC<FavoriteCardProps> = ({ dog, onRemove }) => (
  <div className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow">
    <img
      src={dog.img}
      alt={dog.name}
      className="w-24 h-24 object-cover rounded-lg"
    />
    <div>
      <h3 className="font-semibold text-lg">{dog.name}</h3>
      <p className="text-gray-600">{dog.breed}</p>
      <p className="text-sm text-gray-500">Age: {dog.age}</p>
      <p className="text-sm text-gray-500">Location: {dog.zip_code}</p>
      <button
        onClick={onRemove}
        className="mt-2 text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
      >
        <Heart size={16} fill="currentColor" /> Remove from favorites
      </button>
    </div>
  </div>
);

export default FavoritesModal;
