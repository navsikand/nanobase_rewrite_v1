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
    { title: "Upload structure", slug: "/upload-structure" },
    {
      title: "Profile",
      slug: userAuthState ? `/profile` : "/sign-in",
    },
    { title: "About us", slug: "/about-us" },
    // { title: "How to upload", slug: "/how-to-upload" },
    { title: "Browse", slug: "/browse" },
    // { title: "Submit job", slug: "/submit-oxdna-jobs" },
  ];
  return (
    <div className="p-4 px-8 grid grid-cols-3 items-center">
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

      {/* Centered Links */}
      <div className="flex justify-center space-x-3 text-lg font-semibold">
        {LINKS.map((link) => (
          <Link href={link.slug} key={link.slug} className="group">
            {link.title}
            <Highlighted_Underline />
          </Link>
        ))}
      </div>

      {/* User Info or Sign In */}
      <div className="flex justify-end">
        {userAuthState ? (
          <p>Signed in as {userAuthState.name}</p>
        ) : (
          <Button
            className="rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200"
            onClick={() => router.push("/sign-in")}
          >
            Sign in
          </Button>
        )}
      </div>
    </div>
  );
};
