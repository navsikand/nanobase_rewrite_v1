"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@headlessui/react";
import { usePathname, useRouter } from "next/navigation";
import { apiRoot } from "@/helpers/fetchHelpers";
import { decode } from "jsonwebtoken";

export default function ResetPassword() {
  const router = useRouter();
  const pathName = usePathname();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    router.prefetch("/browse");

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const { exp } = decode(token) as {
          exp: number;
          name: string;
          id: string;
        };
        if (Date.now() < exp * 1000) {
          // Signed in
        } else {
          // Not signed in
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      // Not signed in
    }
  }, [pathName, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");

      // Check if token exists, and throw an error if it's missing
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${apiRoot}/auth/reset`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        router.push("/browse");
      } else {
        const data = await response.json();
        setErrorMessage(
          data.message || "Authentication failed. Please try again."
        );
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Sign In</h1>
        {errorMessage && (
          <div className="mb-4 p-3 text-red-700 bg-red-100 rounded">
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
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="********"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="flex items-center justify-end">
            <Button
              type="submit"
              className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200 cursor-pointer"
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
