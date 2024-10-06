"use client";

import { ChangeEvent, useState } from "react";
import { Button, Transition } from "@headlessui/react";

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
              console.log(formData);
              setSubmitted(true);
            }}
          >
            <div className="flex flex-col">
              <input
                className="p-2 bg-stone-400/20 rounded-2xl"
                placeholder="First name..."
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col">
              <input
                className="p-2 bg-stone-400/20 rounded-2xl"
                placeholder="Last name..."
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

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

            <div className="flex flex-col">
              <input
                className="p-2 bg-stone-400/20 rounded-2xl"
                placeholder="Institution..."
                id="institutionName"
                name="institutionName"
                type="text"
                value={formData.institutionName}
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
              Submit
            </Button>
          </form>
        </Transition>

        <Transition
          show={submitted}
          enter="transition-opacity duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div>
            <p>
              Thank you for signing up! We’ve received your information.
            </p>
          </div>
        </Transition>
      </div>
    </div>
  );
}
