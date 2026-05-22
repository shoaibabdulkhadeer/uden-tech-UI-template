import React from "react";
import { Scrollbars } from "react-custom-scrollbars";

const CustomScrollbars = (props:any) => (
  <Scrollbars
    {...props}
    autoHide
    autoHideTimeout={800}
    autoHideDuration={300}
    renderTrackHorizontal={(props:any) => (
      <div
        {...props}
        style={{ display: "none" }}
        className="track-horizontal"
      />
    )}
    renderTrackVertical={({ style, ...rest }:any) => (
      <div
        {...rest}
        style={{
          ...style,
          right: 2,
          top: 2,
          bottom: 2,
          borderRadius: 10,
          background: 'transparent',
        }}
      />
    )}
    renderThumbVertical={({ style, ...rest }:any) => (
      <div
        {...rest}
        style={{
          ...style,
          background: 'rgba(99,102,241,0.18)',
          borderRadius: 10,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          border: '1px solid rgba(99,102,241,0.12)',
          transition: 'background 0.2s ease',
          cursor: 'pointer',
        }}
      />
    )}
  />
);

export default CustomScrollbars;
