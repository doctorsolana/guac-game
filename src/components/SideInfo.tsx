import React from "react";
import "./SideInfo.css";

const SideInfo = ({ betAmount, avocadoAmount }) => {
    const totalBet = betAmount * avocadoAmount;
    
  
    return (
      <>
        <div className="left-info-container">
          <div className="small-text">Potenital Payout</div>
          <div className="large-text">{totalBet.toFixed(2)}</div>
        </div>
        <div className="right-info-container">
          <div className="small-text">Odds</div>
          <div className="large-text">1/{avocadoAmount}</div>
        </div>
      </>
    );
  };
  

export default SideInfo;
