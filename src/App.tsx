import { useWallet } from "@solana/wallet-adapter-react";
import React from "react";

import "./App.css";

import Header from "./components/Header";
import Game from "./components/Game";
import SideInfo from "./components/SideInfo";

export function App() {
  const { connected } = useWallet();

  return (
    <>
      <Header />
      <div className="logo">
        <img src="/logo.png" alt="logo" className="logoimg" />
      </div>
      <div className="mainApp">
        <Game />
      </div>
    </>
  );
}
