"use client";

import { useState } from "react";
import { Button } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { apiRoot } from "@/helpers/fetchHelpers";

export default function ResetPassword() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in.");
      }

      const response = await fetch(`${apiRoot}/auth/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push("/sign-in");
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "Failed");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8">
        <h1 className="mb-6 text-center text-3xl font-bold">Reset password</h1>
        {errorMessage && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {errorMessage}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              New password
            </label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
              placeholder="********"
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-center justify-end">
            <Button
              type="submit"
              className="cursor-pointer rounded-lg bg-black px-4 py-2 text-white duration-200 hover:-translate-y-1 hover:shadow-xl"
              disabled={loading}
            >
              {loading ? "Reseting..." : "Reset"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
