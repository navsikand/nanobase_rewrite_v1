"use client";

import { Button } from "@headlessui/react";
import { decode } from "jsonwebtoken";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Highlighted_Underline } from "./utils/layout/highlightedUnderline";

export const TopNavbar = () => {
  const router = useRouter();
  const pathName = usePathname();
  const [userAuthState, setUserAuthState] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    router.prefetch("/browse");

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const { exp, name, id } = decode(token) as {
          exp: number;
          name: string;
          id: string;
        };
        if (Date.now() < exp * 1000) {
          if (pathName === "/sign-in" || pathName === "/sign-up")
            router.push("/browse");

          setUserAuthState({ name, id });
        } else {
          if (pathName === "/upload-structure") {
            router.push("/sign-up");
          }
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      if (pathName === "/upload-structure") {
        router.push("/sign-in");
      }
    }
  }, [pathName, router]);

  const LINKS: { title: string; slug: string }[] = [
    { title: "Home", slug: "/" },
    { title: "Browse", slug: "/browse" },
    { title: "Upload structure", slug: "/upload-structure" },
    {
      title: "Profile",
      slug: userAuthState ? `/profile` : "/sign-in",
    },
    { title: "About us", slug: "/about-us" },
  ];
  return (
    <>
      <div className="p-4 px-8 grid grid-cols-2 items-center md:grid-cols-3">
        {/* Logo */}
        <div className="flex justify-start">
          <Link href="/" className="aspect-square size-12 relative">
            <span className="sr-only">Nanobase</span>
            <Image
              src="/images/nanobase_logo.svg"
              fill={true}
              sizes="100%"
              className="object-contain"
              alt="Nanobase"
            />
          </Link>
        </div>

        {/* Centered Links (hidden on mobile) */}
        <div className="hidden md:flex justify-center space-x-3 text-lg font-semibold">
          {LINKS.map((link) => (
            <Link href={link.slug} key={link.slug} className="group">
              {link.title}
              <Highlighted_Underline />
            </Link>
          ))}
        </div>

        {/* User Info or Sign In with Mobile Hamburger */}
        <div className="flex justify-end items-center">
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
                className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200"
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
        <div className="md:hidden px-8 pb-4">
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
                className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200"
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
