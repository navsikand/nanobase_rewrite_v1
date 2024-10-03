"use client";

import { ChangeEvent, useState } from "react";
import { Button, Transition } from "@headlessui/react";

export default function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [submitted, setSubmitted] = useState(false);

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
        <Transition
          show={!submitted}
          enter="transition-opacity duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <form
            className="space-y-6"
            onSubmit={async (e) => {
              e.preventDefault();
              await fetch("http://localhost:3000/api/v1/auth/login", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
              });
              console.log(formData);
              setSubmitted(true);
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
        </Transition>
      </div>
    </div>
  );
}
