import Image from "next/image";
import Link from "next/link";

const LINKS: { title: string; slug: string }[] = [
  { title: "Home", slug: "/" },
  { title: "Upload structure", slug: "/upload-structure" },
  { title: "Profile", slug: "/profile" },
  { title: "About", slug: "/about" },
  { title: "How to upload", slug: "/how-to-upload" },
  { title: "Quick download", slug: "/quick-download" },
];

export const SidebarNav = () => {
  return (
    <div className="hidden flex-col space-y-2 p-4 md:flex">
      {/* Logo */}
      <div className="flex">
        <div className="flex">
          <Link href="/" className="relative aspect-square size-10">
            <span className="sr-only">Nanobase</span>

            <Image
              src="/images/favicon.png"
              fill={true}
              className="object-contain"
              alt="Nanobase"
            />
          </Link>
        </div>

        <h1 className="ml-2 flex items-center">Nanobase</h1>
      </div>
      {LINKS.map((link) => (
        <Link href={link.slug} key={link.slug}>
          {link.title}
        </Link>
      ))}
    </div>
    // <div className="bg-red-300">
    //   <h1>Nanobase</h1>

    //   <div className="flex flex-col mt-2 space-y-2">
    //     {LINKS.map((link) => (
    //       <Link href={link.slug} key={link.slug}>
    //         {link.title}
    //       </Link>
    //     ))}
    //   </div>
    // </div>
  );
};
