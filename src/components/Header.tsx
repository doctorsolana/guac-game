// Header.tsx
import React from "react";
import { GambaConnectButton } from 'gamba-react-ui'
import "./Header.css";

const Header = () => {
  return (
    <div className="app-header">
      <GambaConnectButton />
    </div>
  );
};

export default Header;
