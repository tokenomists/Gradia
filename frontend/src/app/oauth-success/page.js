import { Suspense } from "react";
import OAuthSuccess from "./OAuthSuccess";

export const dynamic = "force-dynamic"; 

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OAuthSuccess />
    </Suspense>
  );
}
