"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiRoot } from "@/helpers/fetchHelpers";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState(
    "Verifying your email, please wait..."
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setMessage("Verification token is missing.");
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${apiRoot}/auth/verify-email?token=${token}`,
          {
            method: "GET",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMessage(data.message || "Email verified successfully!");
        } else {
          const errorData = await response.json();
          setMessage(
            errorData.message || "Verification failed. Please try again."
          );
        }
      } catch (error) {
        setMessage("An error occurred while verifying your email.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {loading ? (
        <p>{message}</p>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {message.includes("successfully") ? "Success!" : "Oops!"}
          </h1>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
