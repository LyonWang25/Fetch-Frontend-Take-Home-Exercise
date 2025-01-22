import React, { useState, useEffect, useCallback } from "react";
import { US_STATES } from "../constants";
import { Search as SearchIcon } from "lucide-react";
import { locationsAPI } from "../api";
import { debounce } from "../util"
interface SearchOption {
  category: "breed" | "state" | "zipCode" | "age" | "city";
  value: string;
  label: string;
}

interface MultipleSearchProps {
  breeds: string[];
  onSearch: (options: SearchOption[]) => void;
  resetTrigger?: boolean;
}

const MultipleSearch: React.FC<MultipleSearchProps> = ({
  breeds,
  onSearch,
  resetTrigger,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<SearchOption[]>([]);
  const [suggestions, setSuggestions] = useState<SearchOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchCities = useCallback(
    debounce(async (term: string) => {
      if (term.length < 2) return;
      // console.log("searchCities called with term:", term); 
      try {
        const response = await locationsAPI.searchLocations({
          city: term,
          size: 10,
        });
        // console.log("searchCities API response:", response); 

        // Create a Set to store unique city-state combinations
        const uniqueCities = new Set();
        const cityOptions: SearchOption[] = [];

        response.results.forEach((loc) => {
          // console.log("Processing location result:", loc); 
          const cityState = `${loc.city}, ${loc.state}`;
          if (!uniqueCities.has(cityState)) {
            uniqueCities.add(cityState);
            cityOptions.push({
              category: "city",
              value: JSON.stringify({
                city: loc.city,
                state: loc.state,
              }),
              label: cityState,
            });
          }
        });
        // console.log("City suggestions generated:", cityOptions); 
        setSuggestions((prev) => {
          const nonCityOptions = prev.filter((opt) => opt.category !== "city");
          return [...nonCityOptions, ...cityOptions];
        });
      } catch (error) {
        console.error("Error searching cities:", error);
      }
    }, 300),
    []
  );

  const updateSuggestions = useCallback(() => {
    if (searchTerm.length < 1) {
      setSuggestions([]);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const newSuggestions: SearchOption[] = [];

    // Search breeds
    breeds.forEach((breed) => {
      if (breed.toLowerCase().includes(searchTermLower)) {
        newSuggestions.push({
          category: "breed",
          value: breed,
          label: breed,
        });
      }
    });

    // Search states
    US_STATES.forEach((state) => {
      if (state.toLowerCase().includes(searchTermLower)) {
        newSuggestions.push({
          category: "state",
          value: state,
          label: state,
        });
      }
    });

    // Check if input might be a ZIP code
    if (/^\d{5}$/.test(searchTerm)) {
      newSuggestions.push({
        category: "zipCode",
        value: searchTerm,
        label: `ZIP: ${searchTerm}`,
      });
    }

    // Check if input might be an age
    if (/^\d{1,2}$/.test(searchTerm)) {
      newSuggestions.push({
        category: "age",
        value: searchTerm,
        label: `Age: ${searchTerm} years`,
      });
    }

    setSuggestions((prev) => {
      const cityOptions = prev.filter((opt) => opt.category === "city");
      return [...newSuggestions, ...cityOptions];
    });
  }, [searchTerm, breeds]);

  useEffect(() => {
    if (searchTerm.length >= 2 && !searchTerm.match(/^\d/)) {
      searchCities(searchTerm);
    }
    updateSuggestions();
    setShowSuggestions(true); // Always show suggestions when typing

    return () => {
      searchCities.cancel?.();
    };
  }, [searchTerm, updateSuggestions, searchCities]);

  const handleSelect = useCallback(
    (option: SearchOption) => {
      // console.log("Option selected:", option); 
      if (option.category === "city") {
        try {
          const cityData = JSON.parse(option.value);
          // console.log("Parsed city data:", cityData); 
          const newOption = {
            category: "city",
            value: JSON.stringify({
              city: cityData.city,
              state: cityData.state,
            }),
            label: `${cityData.city}, ${cityData.state}`,
          };

          setSelectedOptions((prev) => {
            const filteredOptions = prev.filter(
              (opt) => opt.category !== "city"
            );
            const newOptions = [...filteredOptions, newOption];
            // console.log("Updated selected options:", newOptions);
            onSearch(newOptions);
            return newOptions;
          });
        } catch (error) {
          console.error("Error parsing city data:", error);
        }
      } else {
        // Handle other options as before
        setSelectedOptions((prev) => {
          if (
            prev.some(
              (selected) =>
                selected.category === option.category &&
                selected.value === option.value
            )
          ) {
            return prev;
          }
          const newOptions = [...prev, option];
          onSearch(newOptions);
          return newOptions;
        });
      }
      setSearchTerm("");
      setShowSuggestions(false);
    },
    [onSearch]
  );

  const handleRemoveOption = useCallback(
    (optionToRemove: SearchOption) => {
      setSelectedOptions((prev) => {
        const newOptions = prev.filter(
          (option) =>
            !(
              option.category === optionToRemove.category &&
              option.value === optionToRemove.value
            )
        );
        onSearch(newOptions);
        return newOptions;
      });
    },
    [onSearch]
  );

  // Handle resetTrigger to clear input and selected options
  useEffect(() => {
    if (resetTrigger) {
      setSearchTerm(""); 
      setSelectedOptions([]); 
      setSuggestions([]); 
    }
  }, [resetTrigger]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setSearchTerm(input);

    // Handle multiple inputs separated by commas
    if (input.includes(",")) {
      const terms = input
        .split(",")
        .map((term) => term.trim())
        .filter(Boolean);
      const lastTerm = terms[terms.length - 1];

      // Process all complete terms except the last one
      terms.slice(0, -1).forEach((term) => {
        // Check for ZIP code
        if (/^\d{5}$/.test(term)) {
          handleSelect({
            category: "zipCode",
            value: term,
            label: `ZIP: ${term}`,
          });
        }
        // Check for age
        else if (/^\d{1,2}$/.test(term)) {
          handleSelect({
            category: "age",
            value: term,
            label: `Age: ${term} years`,
          });
        }
        // Check for breed match
        else if (
          breeds.some((breed) => breed.toLowerCase() === term.toLowerCase())
        ) {
          handleSelect({
            category: "breed",
            value: term,
            label: term,
          });
        }
        // Check for state match
        else if (
          US_STATES.some((state) => state.toLowerCase() === term.toLowerCase())
        ) {
          handleSelect({
            category: "state",
            value: term.toUpperCase(),
            label: term.toUpperCase(),
          });
        }
      });

      // Keep only the last term in the input
      setSearchTerm(lastTerm);
    }

    setShowSuggestions(true);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breed":
        return "bg-blue-100 text-blue-800";
      case "city":
        return "bg-pink-100 text-pink-800";
      case "state":
        return "bg-green-100 text-green-800";
      case "zipCode":
        return "bg-purple-100 text-purple-800";
      case "age":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-white">
        {selectedOptions.map((option, index) => (
          <span
            key={`${option.category}-${option.value}-${index}`}
            className={`${getCategoryColor(
              option.category
            )} px-3 py-1 rounded-full text-sm flex items-center gap-2`}
          >
            {option.label}
            <button
              type="button"
              onClick={() => handleRemoveOption(option)}
              className="hover:text-red-500"
            >
              X
            </button>
          </span>
        ))}
        <div className="flex w-full">
          <SearchIcon size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            className="w-full border-none focus:ring-0 p-1 text-sm"
            placeholder="Search by breed, state, ZIP code, or age..."
          />
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              type="button"
              key={`${suggestion.category}-${suggestion.value}-${index}`}
              onClick={() => {
                handleSelect(suggestion);
                setShowSuggestions(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              <span
                className={`${getCategoryColor(
                  suggestion.category
                )} px-2 py-0.5 rounded-full text-xs`}
              >
                {suggestion.category}
              </span>
              {suggestion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultipleSearch;