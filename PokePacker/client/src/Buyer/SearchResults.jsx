import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q"); // READ URL
  const [results, setResults] = useState([]);

  // CALL WHEN PAGE LOADS
  useEffect(() => {
    async function getResults() {
      // GRAB SEARCH RESULTS FROM BACKEND
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/search?q=${query}`,
        );
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Error: ", error);
      }
    }

    // CHECK VALID QUERY
    if (query) {
      getResults();
    }
  }, [query]);

  return (
    <div>
      <h1> Search Results! (Buyer) </h1>
      <h2> Results for: {query}</h2>
      {results.map((item) => (
        <li key={item.id}>
          <button onClick={() => console.log("Button Click")}>
            <strong>
              {item.listing_name} - ${item.price}
            </strong>
          </button>
        </li>
      ))}
    </div>
  );
}

export default SearchResults;
