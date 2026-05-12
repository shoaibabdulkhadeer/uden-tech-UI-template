import React from "react";

const CircularProgress = ({className}:any) => <div className={`loader ${className}`}>
  <img src="/assets/images/loader.svg" alt="loader"/>
</div>;
export default CircularProgress;
