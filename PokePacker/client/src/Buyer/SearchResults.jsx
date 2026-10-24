import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q"); // READ URL
  const [results, setResults] = useState([]);
  const [itemID, setItemID] = useState("");

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
          <button onClick={() => navigate(`/item/${item.id}`)}>
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
