"use client";

import { Button } from "@headlessui/react";
import { decode } from "jsonwebtoken";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Highlighted_Underline } from "./highlightedUnderline";

export const Navbar = () => {
  const router = useRouter();
  const pathName = usePathname();

  const [userAuthState, setUserAuthState] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const protected_routes = ["/upload-structure", "profile", "profile/reset"];

  useEffect(() => {
    router.prefetch("/browse");

    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Updated to match new token payload structure
        const payload = decode(token) as {
          id: number;        // Changed from string to number
          email: string;     // New field
          name: string;
          tokenId: string;   // New field
          exp: number;
          iss: string;       // Issuer
          aud: string;       // Audience
          sub: string;       // Subject (user ID as string)
        };

        if (Date.now() < payload.exp * 1000) {
          if (pathName === "/sign-in" || pathName === "/sign-up")
            router.push("/browse");

          setUserAuthState({
            name: payload.name,
            id: String(payload.id) // Convert number to string for display
          });
        } else {
          // Token expired - clear it and redirect if on protected route
          localStorage.removeItem("token");
          if (protected_routes.includes(pathName)) {
            router.push("/sign-in");
          }
        }
      } catch (e) {
        console.error('Token decode error:', e);
        localStorage.removeItem("token");
        if (protected_routes.includes(pathName)) {
          router.push("/sign-in");
        }
      }
    } else {
      if (protected_routes.includes(pathName)) {
        router.push("/sign-in");
      }
    }
  }, [pathName, router]);

  const LINKS: { title: string; slug: string }[] = [
    { title: "Home", slug: "/" },
    { title: "Browse", slug: "/browse" },
    { title: "Upload structure", slug: "/upload-structure" },
    { title: "How to upload", slug: "/tutorial" },
    {
      title: "Profile",
      slug: userAuthState ? `/profile` : "/sign-in",
    },
    { title: "About us", slug: "/about-us" },
  ];
  return (
    <>
      <div className="grid grid-cols-2 items-center p-4 px-8 md:grid-cols-3">
        {/* Logo */}
        <div className="flex items-center justify-start">
          <Link href="/" className="relative aspect-square size-12">
            <span className="sr-only">Nanobase</span>
            <Image
              src="/images/nanobase_logo.svg"
              fill={true}
              sizes="100%"
              className="object-contain"
              alt="Nanobase"
            />
          </Link>
          <p className="ml-2 text-3xl font-semibold">Nanobase.org</p>
        </div>

        {/* Centered Links (hidden on mobile) */}
        <div className="hidden justify-center space-x-3 text-lg font-semibold whitespace-nowrap md:flex">
          {LINKS.map((link) => (
            <Link href={link.slug} key={link.slug} className="group">
              {link.title}
              <Highlighted_Underline />
            </Link>
          ))}
        </div>

        {/* User Info or Sign In with Mobile Hamburger */}
        <div className="flex items-center justify-end">
          {/* Mobile hamburger button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
          {userAuthState ? (
            <p>Signed in as {userAuthState.name}</p>
          ) : (
            // Original sign in button hidden on mobile
            <div className="hidden md:block">
              <Button
                className="cursor-pointer rounded-lg bg-black px-4 py-2 text-white duration-200 hover:-translate-y-1 hover:shadow-xl"
                onClick={() => router.push("/sign-in")}
              >
                Sign in
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="px-8 pb-4 md:hidden">
          <div className="flex flex-col space-y-2 text-lg font-semibold">
            {LINKS.map((link) => (
              <Link
                key={link.slug}
                href={link.slug}
                onClick={() => setIsMobileMenuOpen(false)}
                className="group"
              >
                {link.title}
                <Highlighted_Underline />
              </Link>
            ))}
            {/* Add Sign In button if user is not authenticated */}
            {!userAuthState && (
              <Button
                className="cursor-pointer rounded-lg bg-black px-4 py-2 text-white duration-200 hover:-translate-y-1 hover:shadow-xl"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  router.push("/sign-in");
                }}
              >
                Sign in
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
