declare module "react-simple-marquee" {
  import React from "react";

  interface MarqueeProps {
    speed?: number;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
  }

  const Marquee: React.FC<MarqueeProps>;
  export default Marquee;
}
