"use client";

import { useState } from "react";
import { Button } from "@headlessui/react";
import { apiRoot } from "@/helpers/fetchHelpers";

export default function ResetPasswordEmail() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${apiRoot}/auth/send-reset-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmailSent(true);
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
    <div className="flex min-h-screen justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8">
        <h1 className="mb-6 text-center text-3xl font-bold">
          Send reset email
        </h1>
        {errorMessage && (
          <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
            {errorMessage}
          </div>
        )}
        {emailSent ? (
          <div className="text-center">
            <p className="rounded bg-green-100 p-3 text-green-700">
              Reset email sent successfully! Please check your inbox.
            </p>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                className="mt-1 block w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-blue-500"
                placeholder="example@example.com"
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="flex items-center justify-end">
              <Button
                type="submit"
                className="cursor-pointer rounded-lg bg-black px-4 py-2 text-white duration-200 hover:-translate-y-1 hover:shadow-xl"
                disabled={loading}
              >
                Send reset email
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
