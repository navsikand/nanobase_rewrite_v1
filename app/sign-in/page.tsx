"use client";

import { Button } from "@headlessui/react";
import { ChangeEvent, useState } from "react";

export default function SignIn() {
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
      <div className="mx-auto w-1/2 mt-16">
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
            } else {
              console.log("Authentication failed");
            }

            console.log(formData);
          }}
        >
          <div className="flex flex-col">
            <input
              className="p-2 bg-stone-400/20 rounded-2xl"
              placeholder="Email..."
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col">
            <input
              className="p-2 bg-stone-400/20 rounded-2xl"
              placeholder="Password..."
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            className={
              "rounded-lg px-6 py-2 font-semibold text-lg bg-stone-400/20 text-black"
            }
            type="submit"
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
