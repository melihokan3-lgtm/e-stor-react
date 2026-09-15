import { Suspense } from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import LoadingState from "../components/common/LoadingState";
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
