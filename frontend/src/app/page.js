// app/page.jsx
import { Suspense } from "react";
import Home from "./Home";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading homepage...</div>}>
      <Home />
    </Suspense>
  );
}
