"use client";

import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/16/solid";
import Image from "next/image";
import Link from "next/link";

// import { useState } from "react";

// const tags = [
//   { id: 1, name: "Title" },
//   { id: 2, name: "Author" },
//   { id: 3, name: "Application" },
//   { id: 4, name: "Modification" },
//   { id: 5, name: "Keyword" },
//   { id: 6, name: "User" },
// ];

const LINKS: { title: string; slug: string }[] = [
  { title: "Upload structure", slug: "/upload-structure" },
  { title: "Profile", slug: "/profile" },
  { title: "About", slug: "/about" },
  { title: "How to upload", slug: "/how-to-upload" },
  { title: "Quick download", slug: "/quick-download" },
];

export const TopNavbar = (): JSX.Element => {
  // const [selectedPerson, setSelectedPerson] = useState<{
  //   id: number;
  //   name: string;
  // } | null>({ id: -1, name: "" });

  // const [query, setQuery] = useState("");

  // const filteredTags =
  //   query === ""
  //     ? tags
  //     : tags.filter((tag) => {
  //         return tag.name.toLowerCase().includes(query.toLowerCase());
  //       });

  return (
    <div className="p-4 px-8 flex items-center">
      {/* Logo */}
      <div className="flex">
        <Link href="/" className="aspect-square size-12 relative">
          <span className="sr-only">Nanobase</span>

          <Image
            src="/images/rounded_logo-min.png"
            fill={true}
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

      <Link href={"/sign-in"} className="flex items-center w-12">
        <span className="sr-only">Sign in</span>
        <ArrowRightStartOnRectangleIcon className="size-8" />
      </Link>
    </div>
  );
};
