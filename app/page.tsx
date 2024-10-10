"use client";

import { useRouter } from "next/navigation";

import { Button } from "@headlessui/react";

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

        <p className="mt-12">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
          mi augue, euismod id nisl eget, vehicula facilisis nunc. Quisque
          vestibulum imperdiet magna a pretium. Maecenas id mattis orci.
          Mauris eget tortor feugiat, dignissim massa vitae, dictum neque.
          Fusce augue lacus, sodales a molestie id, faucibus vel risus.
          Maecenas pharetra tempus rutrum. Fusce sollicitudin vehicula dui
          sed lacinia. Donec sed metus blandit, pellentesque purus sed,
          finibus nisl. Praesent ornare arcu non ipsum eleifend pretium.
          Etiam ut eros at dui varius laoreet.
        </p>
      </div>

      {/* Body */}
      {/* Get started */}
      <div className="flex justify-center items-center mt-20">
        <Button
          className={
            "rounded-lg px-8 py-4 font-bold text-xl bg-black text-white hover:-mt-3 hover:shadow-2xl duration-[200ms]"
          }
          onClick={() => router.push("/sign-up")}
        >
          Get started
        </Button>
      </div>
    </div>
  );
}
