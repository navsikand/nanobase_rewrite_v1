"use client";

import { useEffect, useState } from "react";

export default function Profile() {
  const [first, setfirst] = useState(0);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3002/api/v1/auth/profile",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`, // Attach token here
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Protected data:", data);
      } else {
        console.log("Unauthorized access");
      }
    })();
  }, [first]);

  return (
    <div>
      <h1>hi from </h1>
      <button onClick={() => setfirst(first + 1)}>CLICKK</button>
    </div>
  );
}
