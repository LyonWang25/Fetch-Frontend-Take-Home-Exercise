import React from "react";
import { Dog } from "../../../api";
import DogCard from "./DogCard";
import Pagination from "../../Pagination";

interface IDogGridProps {
  dogs: Dog[];
  favorites: string[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onToggleFavorite: (id: string) => void;
}

const DogGrid: React.FC<IDogGridProps> = ({
  dogs = [], // Provide default empty array
  favorites,
  currentPage,
  totalPages,
  onPageChange,
  onToggleFavorite,
}) => {
  // Add null check
  if (!dogs) {
    return null;
  }

  // Check for empty array
  if (dogs.length === 0) {
    return <NoResultsMessage />;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {dogs.map((dog) => (
          <DogCard
            key={dog.id}
            dog={dog}
            isFavorite={favorites.includes(dog.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {totalPages > 1 && ( // Only show pagination if there are multiple pages
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

const NoResultsMessage = () => (
  <div className="text-center py-8">
    <div className="max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        No Dogs Found
      </h3>
      <p className="text-gray-600">
        Try adjusting your filters or selecting different locations.
      </p>
    </div>
  </div>
);

export default DogGrid;
