import { GambaUi } from "gamba-react-ui";
import { Gamba } from "gamba/react";
import React from "react";
import ReactDOM from "react-dom/client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { App } from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <Gamba
    creator="5Wu7wbvCXYHrER7tnTyV3SzzMyoDaJoyRNFQVms3kvvg"
    connection={{
      endpoint:
        "https://rpc.helius.xyz/?api-key=d1b8ca10-0ab9-4f59-9568-18a686943a7f",
    }}
  >
    <GambaUi onError={(err) => toast(err.message, { type: "error" })}>
      <ToastContainer />
      <App />
    </GambaUi>
  </Gamba>
);
