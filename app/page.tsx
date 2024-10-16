"use client";

import { Button } from "@headlessui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="">
      {/* Header text */}
      <div className="flex flex-col w-11/12 mx-auto justify-center items-center mt-20 lg:w-[65%] ">
        <div>
          <p className="text-2xl font-light -ml-6">Welcome to</p>
          <h1 className="ml-6 text-6xl font-bold">Nanobase</h1>
        </div>

        <p className="mt-12 text-center">
          Over the past 40 years, nucleic acid nanotechnology has developed
          a wide range of static and dynamic nanostructures, used in
          applications like nanopatterning, drug delivery, diagnostics, and
          nanophotonics. However, many verified structures are rarely
          reused, with labs often creating their own designs. This effort
          aims to create a community database for sharing nanostructure
          design files, fostering collaboration and modularity. The
          platform includes tools to edit and characterize DNA, RNA, and
          hybrid nanostructures, with a GUI for visualization. It supports
          conversion to a common format and integrates with the oxDNA
          server for simulations using coarse-grained models.
        </p>
      </div>

      <div className="flex flex-col justify-center items-center mt-20">
        <Button
          className={
            "rounded-lg px-8 py-4 font-bold text-xl bg-black text-white relative hover:-translate-y-1 hover:shadow-xl duration-200"
          }
          onClick={() => router.push("/sign-up")}
        >
          Get started
        </Button>

        <p className="text-sm mt-2">
          Already have an account?{" "}
          <Link href="/sign-in" className="underline text-blue-800">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
