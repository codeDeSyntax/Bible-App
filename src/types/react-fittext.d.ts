declare module "react-fittext" {
  import * as React from "react";

  interface ReactFitTextProps {
    compressor?: number;
    minFontSize?: number;
    maxFontSize?: number;
    children?: React.ReactNode;
    // allow any other props
    [key: string]: any;
  }

  const ReactFitText: React.ComponentType<ReactFitTextProps>;
  export default ReactFitText;
}
