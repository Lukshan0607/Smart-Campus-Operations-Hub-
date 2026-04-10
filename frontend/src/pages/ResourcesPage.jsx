import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    try {
      const response = await api.get("/api/resources");
      setResources(response.data.content || []);
    } catch (error) {
      console.error("Failed to load resources", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  if (loading) {
    return <div className="p-6">Loading resources...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Available Resources</h1>

      {resources.length === 0 ? (
        <p>No resources found.</p>
      ) : (
        <div className="grid gap-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <h2 className="text-xl font-semibold">{resource.name}</h2>
              <p className="text-sm text-gray-600">{resource.description}</p>
              <p><strong>Type:</strong> {resource.type}</p>
              <p><strong>Location:</strong> {resource.location}</p>
              <p><strong>Status:</strong> {resource.status}</p>

              <Link
                to={`/book/${resource.id}`}
                className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded"
              >
                Book Now
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResourcesPage;