"use client";

import { ChangeEvent, useState } from "react";
import { Button, Transition } from "@headlessui/react";
import Link from "next/link";
import { apiRoot } from "@/helpers/fetchHelpers";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    institutionName: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${apiRoot}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "Signup failed, please try again.");
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
      <div className="max-w-xl w-full bg-white rounded-lg p-8">
        {!submitted ? (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>
            {errorMessage && (
              <div className="mb-4 p-3 text-red-700 bg-red-100 rounded">
                {errorMessage}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    autoComplete="given-name"
                    placeholder="John"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    autoComplete="family-name"
                    placeholder="Doe"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    placeholder="example@example.com"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="institutionName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Institution
                  </label>
                  <input
                    type="text"
                    name="institutionName"
                    id="institutionName"
                    value={formData.institutionName}
                    onChange={handleChange}
                    required
                    autoComplete="organization"
                    placeholder="Your Institution"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  placeholder="********"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  Already have an account?{" "}
                  <Link
                    href="/sign-in"
                    className="text-blue-600 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
                <Button
                  type="submit"
                  className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200 cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Signing up..." : "Sign Up"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <Transition
            show={submitted}
            enter="transition-opacity duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                Registration Successful
              </h2>
              <p className="mb-6">
                Please check your email for a verification link to activate your
                account.
              </p>
              <Link href="/sign-in" className="text-blue-600 hover:underline">
                Go to Sign In
              </Link>
            </div>
          </Transition>
        )}
      </div>
    </div>
  );
}
