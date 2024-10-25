"use client";

import { Button } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="">
      <div className="mx-auto w-1/2 max-w-3xl mt-16">
        <h1 className="text-4xl font-bold mb-5">Sign in</h1>
        <form
          className="space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            const response = await fetch(
              "http://localhost:3002/api/v1/auth/login",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
              }
            );

            if (response.ok) {
              const data = await response.json();
              // Store the token in localStorage or cookies
              localStorage.setItem("token", data.token);

              console.log("User authenticated");
              router.push("/browse");
            } else {
              console.log("Authentication failed");
            }
          }}
        >
          <div className="flex flex-col">
            <label htmlFor="email">Email</label>
            <input
              className="p-2 bg-stone-400/20 rounded-lg mt-1"
              placeholder="Email..."
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="password">Password</label>
            <input
              className="p-2 bg-stone-400/20 rounded-lg mt-1"
              placeholder="Password..."
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="w-full flex justify-end">
            <Button
              className={
                "rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200"
              }
              type="submit"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
