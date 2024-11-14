"use client";

import { Button } from "@headlessui/react";
import { decode } from "jsonwebtoken";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS: { title: string; slug: string }[] = [
  { title: "Upload structure", slug: "/upload-structure" },
  // { title: "Profile", slug: "/profile" },
  { title: "About", slug: "/about" },
  // { title: "How to upload", slug: "/how-to-upload" },
  { title: "Browse", slug: "/browse" },
  { title: "Submit job", slug: "/submit-oxdna-jobs" },
];

export const TopNavbar = (): JSX.Element => {
  const router = useRouter();
  const pathName = usePathname();
  const [userAuthState, setUserAuthState] = useState<string | null>(null);

  useEffect(() => {
    router.prefetch("/browse");

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const { exp, name } = decode(token) as {
          exp: number;
          name: string;
        };
        if (Date.now() < exp * 1000) {
          if (pathName === "/sign-in" || pathName === "/sign-up")
            router.push("/browse");
          setUserAuthState(name);
        } else {
          if (pathName === "/upload-structure") {
            router.push("/sign-up");
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  }, [pathName, router]);

  return (
    <div className="p-4 px-8 flex items-center">
      {/* Logo */}
      <div className="flex">
        <Link href="/" className="aspect-square size-12 relative">
          <span className="sr-only">Nanobase</span>

          <Image
            src="/images/rounded_logo-min.png"
            fill={true}
            sizes="100%"
            className="object-contain rounded-full shadow-lg"
            alt="Nanobase"
          />
        </Link>
      </div>

      <div className="mx-auto space-x-3">
        {LINKS.map((link) => (
          <Link href={link.slug} key={link.slug}>
            {link.title}
          </Link>
        ))}
      </div>

      {userAuthState ? (
        <p>Signed in as {userAuthState}</p>
      ) : (
        <Button
          className={
            "rounded-lg px-4 py-2 bg-black text-white hover:-translate-y-1 hover:shadow-xl duration-200"
          }
          onClick={() => router.push("/sign-in")}
        >
          Sign in
        </Button>
      )}
    </div>
  );
};
