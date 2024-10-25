"use client";

import { ChangeEvent, useState } from "react";
import { Button, Transition } from "@headlessui/react";
import Link from "next/link";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    institutionName: "",
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
              await fetch("http://localhost:3002/api/v1/auth/signup", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
              });
              setSubmitted(true);
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label htmlFor="firstName">First name</label>
                <input
                  className="p-2 bg-stone-400/20 rounded-lg mt-1"
                  placeholder="John"
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="lastName">Last name</label>
                <input
                  className="p-2 bg-stone-400/20 rounded-lg mt-1"
                  placeholder="Doe"
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label htmlFor="email">Email</label>
                <input
                  className="p-2 bg-stone-400/20 rounded-lg mt-1"
                  placeholder="example@example.com"
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
                <label htmlFor="institutionName">Institution</label>
                <input
                  className="p-2 bg-stone-400/20 rounded-lg mt-1"
                  placeholder="The College of Water Polo and Divinity"
                  id="institutionName"
                  name="institutionName"
                  type="text"
                  value={formData.institutionName}
                  onChange={handleChange}
                  required
                  autoComplete="organization"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="password">Password</label>
              <input
                className="p-2 bg-stone-400/20 rounded-lg mt-1"
                placeholder="Not test123"
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="w-full flex justify-between">
              <p className="text-sm mt-3">
                Already have an account?{" "}
                <Link href="/sign-in" className="underline text-blue-800">
                  Sign in
                </Link>
              </p>
              <Button
                className={
                  "rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200"
                }
                type="submit"
              >
                Sign up
              </Button>
            </div>
          </form>
        </Transition>
      </div>
    </div>
  );
}
