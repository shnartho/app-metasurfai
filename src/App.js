import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import AdHandler from "./components/ads/AdHandling";
import React from 'react';

export function App() {
    return (
        <main className="">
        <NavBar />
        <AdHandler />
        <Footer />
      </main>
    );
}