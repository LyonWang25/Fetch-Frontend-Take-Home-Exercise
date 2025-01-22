import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { dogsAPI, Dog, authAPI, locationsAPI } from "../api";
import { Heart, LogOut } from "lucide-react";
import { useUser } from "../context/UserContext";
import SearchControls from "../components/features/dog/SearchControls";
import DogGrid from "../components/features/dog/DogGrid";
import FavoritesModal from "../components/features/dog/FavoritesModal";
import { LocationSearchRef } from "../components/LocationSearch";

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
  const [searchCity, setSearchCity] = useState<string[]>([]);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [favoriteDogs, setFavoriteDogs] = useState<Dog[]>([]);
  const [resetTrigger, setResetTrigger] = useState(false); // New state to trigger reset
  const locationSearchRef = useRef<LocationSearchRef>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { userName, setUserName } = useUser();
  const navigate = useNavigate();

  // Fetch breeds on mount
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

  // Handler functions
  const handleMultipleSearch = (
    options: Array<{ category: string; value: string }>
  ) => {
    // Reset page when search changes
    setCurrentPage(1);
    // console.log("MultipleSearch options:", options);

    // Handle breed selection
    const breedSelections = options
      .filter((option) => option.category === "breed")
      .map((option) => option.value);
    setSelectedBreeds(breedSelections);

    // Handle state selections
    const stateSelections = options
      .filter((option) => option.category === "state")
      .map((option) => option.value);
    // Handle ZIP codes selection
    const zipSelections = options
      .filter((option) => option.category === "zipCode")
      .map((option) => option.value);
    // console.log("ZIP code selections:", zipSelections);

    // Handle city selections (without ZIP codes)
    const citySelections = options
      .filter((option) => option.category === "city")
      .map((option) => {
        try {
          return JSON.parse(option.value);
        } catch (error) {
          console.error("Error parsing city data:", error);
          return null;
        }
      })
      .filter(Boolean);
    setSearchCity(citySelections);
    // console.log("City selections extracted:", citySelections); 

    // Fetch ZIP codes for the selected city
    if (citySelections.length > 0) {
      const { city, state } = citySelections[0];
      locationsAPI
        .searchLocations({ city, states: [state], size: 100 }) // Use both city and state
        .then(({ results }) => {
          const cityZipCodes = results.map((loc) => loc.zip_code);
          // console.log("ZIP codes for city:", cityZipCodes);
          setSelectedZipCodes(cityZipCodes); // Update selected ZIP codes
        })
        .catch((error) =>
          console.error("Error fetching ZIP codes for city:", error)
        );
    }

    // If states are selected, trigger location search
    if (stateSelections.length > 0) {
      locationsAPI
        .searchLocations({ states: stateSelections, size: 100 })
        .then(({ results }) => {
          const stateZipCodes = results.map((loc) => loc.zip_code);
          setSelectedZipCodes([...zipSelections, ...stateZipCodes]);
        })
        .catch((error) => console.error("Error searching locations:", error));
    } else {
      setSelectedZipCodes(zipSelections);
    }

    // Handle age selection
    const ageSelection = options.find((option) => option.category === "age");
    setSearchAge(ageSelection ? ageSelection.value : "");
  };

  // Fetch dogs data
  const fetchDogs = async () => {
    setIsLoading(true);
    try {
      const searchParams = {
        breeds: selectedBreeds,
        ...(selectedZipCodes.length > 0 && { zipCodes: selectedZipCodes }),
        size: 20,
        from: (currentPage - 1) * 20,
        sort: `breed:${sortOrder === "asc" ? "asc" : "desc"}`,
        ...(searchAge && {
          ageMin: parseInt(searchAge),
          ageMax: parseInt(searchAge),
        }),
      };

      // console.log("fetchDogs searchParams:", searchParams); 

      const searchResult = await dogsAPI.search(searchParams);
      // console.log("fetchDogs searchResult:", searchResult); 

      const dogsData = await dogsAPI.getDogs(searchResult.resultIds);
      // console.log("Dogs data fetched:", dogsData); 

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
  }, [
    selectedBreeds,
    selectedZipCodes,
    sortOrder,
    currentPage,
    searchAge,
    searchCity,
  ]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem("userName"); // Clear stored name
      setUserName(""); // Clear context
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleLocationSelect = (zipCodes: string[]) => {
    setSelectedZipCodes(zipCodes);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSelectedBreeds([]);
    setSelectedZipCodes([]);
    setSortOrder("asc");
    setCurrentPage(1);
    setSearchAge("");
    setResetTrigger(true); // Trigger reset for MultipleSearch
    locationSearchRef.current?.reset(); // Reset LocationSearch
    setTimeout(() => setResetTrigger(false), 0); // Reset the trigger back
  };

  const toggleFavorite = (dogId: string) => {
    setFavorites((prev) =>
      prev.includes(dogId)
        ? prev.filter((id) => id !== dogId)
        : [...prev, dogId]
    );
  };

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

  const handleClearFavorites = () => {
    setFavorites([]);
    setFavoriteDogs([]);
    setShowFavoritesModal(false);
  };

  //Match Modal
  const handleMatchSubmit = async () => {
    if (favorites.length === 0) {
      return;
    }

    try {
      setIsLoading(true);
      // console.log("Submitting match request with favorites:", favorites);

      const matchResponse = await dogsAPI.match(favorites);
      // console.log("Match API response:", matchResponse);

      const [matchedDogData] = await dogsAPI.getDogs([matchResponse.match]);
      // console.log("Matched dog details:", matchedDogData);

      // setMatchedDog(matchedDogData);
      setShowSuccessMessage(true);

      setFavorites([]); // Clear favorites array
      setFavoriteDogs([]); // Clear favorite dogs data

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setShowFavoritesModal(false); // Close the favorites modal
      }, 3000);
    } catch (error) {
      console.error("Error generating match:", error);
    } finally {
      setIsLoading(false);
    }
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

      {/* Search Controls */}
      <SearchControls
        breeds={breeds}
        selectedBreeds={selectedBreeds}
        favorites={favorites}
        sortOrder={sortOrder}
        onMultipleSearch={handleMultipleSearch}
        onBreedSelect={setSelectedBreeds}
        onLocationSelect={handleLocationSelect}
        onSortOrderChange={setSortOrder}
        onReset={handleReset}
        onClearFavorites={handleClearFavorites}
        onViewFavorites={fetchFavoriteDogs}
        onMatchSubmit={handleMatchSubmit}
        resetTrigger={resetTrigger}
        locationSearchRef={locationSearchRef}
      />

      {/* Dog Grid */}
      <div className="max-w-7xl mx-auto">
        {!isLoading &&
          dogs && ( // Add check for dogs
            <DogGrid
              dogs={dogs}
              favorites={favorites}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onToggleFavorite={toggleFavorite}
            />
          )}
      </div>

      {/* Favorites Modal */}
      <FavoritesModal
        isOpen={showFavoritesModal}
        onClose={() => setShowFavoritesModal(false)}
        favoriteDogs={favoriteDogs || []} // Add fallback
        onToggleFavorite={(id) => {
          toggleFavorite(id);
          setFavoriteDogs((prev) => prev?.filter((dog) => dog.id !== id) || []);
        }}
        onClearAll={handleClearFavorites}
        onMatchSubmit={handleMatchSubmit}
      />

      {/* Floating Action Button */}
      {favorites.length > 0 && (
        <button
          onClick={fetchFavoriteDogs}
          className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Heart size={20} /> View Favorites ({favorites.length})
        </button>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">Loading...</div>
        </div>
      )}

      {/*{/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
            <div className="text-green-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Match Generated!</h3>
            <p className="text-gray-600 mb-4">
              Thank you for using our matching service. Your perfect match has
              been found!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
