import React, { useEffect, useState } from 'react';
import image from "/image2.jpg";

const Domaine: React.FC = () => {
  const [data, setData] = useState('');
  const [filteredData, setFilteredData] = useState<string[]>([]); // Filtered data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null); // Selected domain
  const [themes, setThemes] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_APP_API_URL}/apiUser/formations/Domains`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching data');
        }
        return response.text();
      })
      .then((data) => {
        setData(data);
        setFilteredData(data.split('\n')); // Split data by line
        setLoading(false);
      })
      .catch((error) => {
        console.error('Fetch error:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = data.split('\n').filter((line) =>
      line.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredData(filtered); // Update filtered data
  };

  const handleDomainClick = (domaine: string) => {
    const trimmedDomaine = domaine.trim();
    setSelectedDomain(trimmedDomaine);
    fetch(`${import.meta.env.VITE_APP_API_URL}/apiUser/formations/domaine=${trimmedDomaine}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching themes');
        }
        return response.text();
      })
      .then((data) => {
        const themeList = data.split(',').map((theme) => theme.trim());
        setThemes(themeList);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="flex flex-col items-center top-20 py-8">
           <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm z-[-1]"
        style={{ backgroundImage: `url('${image}')` }}
      ></div>
      <h1 className="text-4xl text-center my-20 text-[#477870] mb-8">Domaines</h1>

      <div className="w-full max-w-xl mb-8">
        <input
          type="text"
          placeholder="Rechercher un domaine..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full p-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#115442]"
        />
      </div>

      {loading && <p className="text-center text-gray-500">Chargement...</p>}
      {error && <p className="text-center text-red-500 font-semibold">{error}</p>}

      <div className="flex flex-wrap justify-center gap-4">
        {filteredData.length > 0 ? (
          filteredData.map((line, index) => (
            <div
              key={index}
              className="bg-[#82b89a] p-5 rounded-lg shadow-md min-w-[150px] h-[100px] flex items-center justify-center cursor-pointer hover:bg-[#6f9d7d]"
              onClick={() => handleDomainClick(line)}
            >
              {line}
            </div>
          ))
        ) : (
          <p className="text-center">Aucune donnée disponible</p>
        )}
      </div>

      {selectedDomain && (
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Thèmes liés à {selectedDomain}</h2>
          {themes.length > 0 ? (
            <ul className="list-disc pl-6 space-y-2">
              {themes.map((theme, index) => (
                <li key={index} className="text-lg">{theme}</li>
              ))}
            </ul>
          ) : (
            <p>Aucun thème disponible pour ce domaine.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Domaine;
