import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, LoginData } from "../api";

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    name: "",
    email: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authAPI.login(formData);

      if (response.ok) {
        navigate("/search");
      } else {
        const errorData = await response.json().catch(() => null);
        setError(
          errorData?.message || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8">
        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          <h5 className="text-xl font-medium text-gray-900">
            Welcome to Dog Finder
          </h5>
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Your name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:opacity-50"
              placeholder="John Doe"
              required
              disabled={isLoading}
              autoComplete="name"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Your email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:opacity-50"
              placeholder="name@company.com"
              required
              disabled={isLoading}
              autoComplete="email"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center" role="alert">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? "Logging in..." : "Find Your Perfect Dog"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
