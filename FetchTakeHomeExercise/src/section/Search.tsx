import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dogsAPI, Dog, authAPI, locationsAPI } from "../api";
import { ArrowUpDown, Heart, LogOut } from "lucide-react";
import { useUser } from "../context/UserContext";
import LocationSearch from "../components/LocationSearch";
import Pagination from "../components/Pagination";
import MultipleSearch from "../components/MultipleSearch";

const Search = () => {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedZipCodes, setSelectedZipCodes] = useState<string[]>([]);
  const [searchAge, setSearchAge] = useState<string>("");
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [favoriteDogs, setFavoriteDogs] = useState<Dog[]>([]);
  const { userName } = useUser();
  const navigate = useNavigate();

  // Fetch breeds on component mount
  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const breedList = await dogsAPI.getBreeds();
        setBreeds(breedList);
      } catch (error) {
        console.error("Error fetching breeds:", error);
      }
    };
    fetchBreeds();
  }, []);

  const handleMultipleSearch = (
    options: Array<{ category: string; value: string }>
  ) => {
    // Reset page when search changes
    setCurrentPage(1);

    // Handle breed selections
    const breedSelections = options
      .filter((option) => option.category === "breed")
      .map((option) => option.value);
    setSelectedBreeds(breedSelections);

    // Handle state/ZIP code selections
    const stateSelections = options
      .filter((option) => option.category === "state")
      .map((option) => option.value);
    const zipSelections = options
      .filter((option) => option.category === "zipCode")
      .map((option) => option.value);

    // If states are selected, trigger location search
    if (stateSelections.length > 0) {
      const searchParams = {
        states: stateSelections,
        size: 100,
      };
      locationsAPI
        .searchLocations(searchParams)
        .then(({ results }) => {
          const zipCodes = results.map((loc) => loc.zip_code);
          setSelectedZipCodes(zipCodes);
        })
        .catch((error) => console.error("Error searching locations:", error));
    } else if (zipSelections.length > 0) {
      setSelectedZipCodes(zipSelections);
    } else {
      setSelectedZipCodes([]);
    }

    // Handle age selection
    const ageSelection = options.find((option) => option.category === "age");
    setSearchAge(ageSelection ? ageSelection.value : "");
  };

  // Fetch dogs based on filters
  const fetchDogs = async () => {
    setIsLoading(true);
    try {
      const searchResult = await dogsAPI.search({
        breeds: selectedBreeds,
        ...(selectedZipCodes.length > 0 && { zipCodes: selectedZipCodes }),
        size: 20,
        from: (currentPage - 1) * 20,
        sort: `breed:${sortOrder === "asc" ? "asc" : "desc"}`,
        ...(searchAge && {
          ageMin: parseInt(searchAge),
          ageMax: parseInt(searchAge),
        }),
      });

      const dogsData = await dogsAPI.getDogs(searchResult.resultIds);
      console.log("Current sort order:", sortOrder);
      setDogs(dogsData);
      setTotalPages(Math.ceil(searchResult.total / 20));
    } catch (error) {
      console.error("Error fetching dogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDogs();
  }, [selectedBreeds, selectedZipCodes, sortOrder, currentPage]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleLocationSelect = (zipCodes: string[]) => {
    setSelectedZipCodes(zipCodes);
    setCurrentPage(1); // Reset to first page when changing location filter
  };

  const handleReset = () => {
    setSelectedBreeds([]);
    setSelectedZipCodes([]);
    setSortOrder("asc");
    setCurrentPage(1);
  };

  const toggleFavorite = (dogId: string) => {
    setFavorites((prev) =>
      prev.includes(dogId)
        ? prev.filter((id) => id !== dogId)
        : [...prev, dogId]
    );
  };


  //clear Favorites breeds
  const clearAllFavorites = () => {
    setFavorites([]);
    setFavoriteDogs([]);
    setShowFavoritesModal(false);
  };

  // fetch favorite dogs details
  const fetchFavoriteDogs = async () => {
    if (favorites.length === 0) return;

    try {
      const dogsData = await dogsAPI.getDogs(favorites);
      setFavoriteDogs(dogsData);
      setShowFavoritesModal(true);
    } catch (error) {
      console.error("Error fetching favorite dogs:", error);
    }
  };

  const NoResultsMessage = () => {
    if (selectedBreeds.length === 0 && selectedZipCodes.length === 0) {
      return null;
    }

    const breedText =
      selectedBreeds.length === 1
        ? selectedBreeds[0]
        : `${selectedBreeds.length} selected breeds`;

    const stateText =
      selectedZipCodes.length > 0 ? `in the selected states` : "";

    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Dogs Found
          </h3>
          <p className="text-gray-600">
            {`Sorry, we couldn't find any ${breedText} ${stateText}. Try adjusting your filters or selecting different locations.`}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Hi, {userName} 👋</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Search controls */}
        <div className="max-w-7xl mx-auto mb-6 bg-white rounded-lg shadow p-4">
          {/* MultipleSearch component */}
          <MultipleSearch breeds={breeds} onSearch={handleMultipleSearch} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Breed filter */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Breed
              </label>
              <select
                multiple
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                onChange={(e) =>
                  setSelectedBreeds(
                    Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    )
                  )
                }
                size={4}
              >
                {breeds.map((breed) => (
                  <option key={breed} value={breed}>
                    {breed}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort button */}
            <div className="flex items-center gap-4 justify-end">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={() =>
                  setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                }
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowUpDown size={20} />
                Sort Breeds: {sortOrder === "asc" ? "A to Z" : "Z to A"}
              </button>
            </div>
          </div>

          {/* Location search */}
          <div className="mt-4">
            <LocationSearch onLocationSelect={handleLocationSelect} />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={clearAllFavorites}
              disabled={favorites.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear All
            </button>

            <button
              onClick={fetchFavoriteDogs}
              disabled={favorites.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Heart size={20} />
              View Favorites ({favorites.length})
            </button>
          </div>
        </div>
      </div>

      {/* Dog cards grid */}
      <div className="max-w-7xl mx-auto">
        {dogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {dogs.map((dog) => (
                <div
                  key={dog.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={dog.img}
                    alt={dog.name}
                    className="w-full h-72 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{dog.name}</h3>
                        <p className="text-gray-600">{dog.breed}</p>
                      </div>
                      <button
                        onClick={() => toggleFavorite(dog.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Heart
                          size={24}
                          fill={
                            favorites.includes(dog.id) ? "currentColor" : "none"
                          }
                        />
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Age: {dog.age}</p>
                      <p className="text-sm text-gray-500">
                        Zip Code: {dog.zip_code}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <NoResultsMessage />
        )}
      </div>

      {/* Favorites Modal */}
      {showFavoritesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                Your Favorite Dogs ({favoriteDogs.length})
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearAllFavorites}
                  className="text-gray-500 hover:text-red-600 text-sm flex items-center gap-1 mr-4"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFavoritesModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {favoriteDogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteDogs.map((dog) => (
                  <div
                    key={dog.id}
                    className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <img
                      src={dog.img}
                      alt={dog.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{dog.name}</h3>
                      <p className="text-gray-600">{dog.breed}</p>
                      <p className="text-sm text-gray-500">Age: {dog.age}</p>
                      <p className="text-sm text-gray-500">
                        Location: {dog.zip_code}
                      </p>
                      <button
                        onClick={() => {
                          toggleFavorite(dog.id);
                          setFavoriteDogs((prev) =>
                            prev.filter((d) => d.id !== dog.id)
                          );
                        }}
                        className="mt-2 text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                      >
                        <Heart size={16} fill="currentColor" /> Remove from
                        favorites
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No favorite dogs yet. Heart some dogs to add them to your
                favorites!
              </div>
            )}

            <button
              onClick={() => setShowFavoritesModal(false)}
              className="mt-6 w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Match button */}
      {favorites.length > 0 && (
        <button
          onClick={fetchFavoriteDogs}
          className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Heart size={20} /> Match ({favorites.length})
        </button>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default Search;
