import Link from "next/link";

const LINKS: { title: string; slug: string }[] = [
  { title: "Home", slug: "/" },
  { title: "Upload structure", slug: "/upload" },
  { title: "Profile", slug: "/profile" },
  { title: "About", slug: "/about" },
  { title: "How to upload", slug: "/how-to-upload" },
  { title: "Quick download", slug: "/quick-download" },
];

export const SidebarNav = (): JSX.Element => {
  return (
    <div className="bg-red-300">
      <h1>Nanobase</h1>

      <div>DUMMY_DATA</div>

      {LINKS.map((link) => (
        <Link href={link.slug} key={link.slug}>
          {link.title}
        </Link>
      ))}
    </div>
  );
};
