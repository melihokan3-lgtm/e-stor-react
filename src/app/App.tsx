import { Suspense } from "react";
import { Footer, Navbar } from "../components/layout";
import { LoadingState } from "../components/common";
import AppRouter from "./router";

export default function App() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<LoadingState message="Sayfa yükleniyor..." />}>
        <AppRouter />
      </Suspense>
      <Footer />
    </>
  );
}
