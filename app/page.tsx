const DUMMY_TAGS = ["diagnostics, nuclear delivery, self assembly"];

export default function Home() {
  return (
    <div className="flex-1 bg-teal-300">
      <h1>Body</h1>

      {/* Tags panel */}
      <div className="">
        {DUMMY_TAGS.map((tag) => (
          <button key={tag}>{tag}</button>
        ))}
      </div>
    </div>
  );
}
