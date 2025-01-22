import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Dog, locationsAPI } from "../../../api";

interface IDogCardProps {
  dog: Dog;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export interface ILocationInfo {
  city: string;
  state: string;
}

const DogCard: React.FC<IDogCardProps> = ({
  dog,
  isFavorite,
  onToggleFavorite,
}) => {
    const [locationInfo, setLocationInfo] = useState<ILocationInfo | null>(null);

    useEffect(() => {
      const fetchLocation = async () => {
        try {
          const response = await locationsAPI.getLocations([dog.zip_code]);
          if (response && response.length > 0) {
            setLocationInfo({
              city: response[0].city,
              state: response[0].state,
            });
          }
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      };

      fetchLocation();
    }, [dog.zip_code]);


  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={dog.img}
        alt={`${dog.name} - ${dog.breed}`}
        className="w-full h-72 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{dog.name}</h3>
            <p className="text-gray-600">{dog.breed}</p>
          </div>
          <button
            onClick={() => onToggleFavorite(dog.id)}
            className="text-red-500 hover:text-red-600"
          >
            <Heart size={24} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Age: {dog.age}{" "}
            <span className="text-sm text-gray-600 ml-1">
              {dog.age === 1 ? "year" : "years"}
            </span>
          </p>
          {locationInfo ? (
            <>
              <p className="text-sm text-gray-500">
                {locationInfo.city}, {locationInfo.state}, {dog.zip_code}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">ZIP: {dog.zip_code}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DogCard;
