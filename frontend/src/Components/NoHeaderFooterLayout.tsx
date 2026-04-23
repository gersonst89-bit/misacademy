import type { ReactNode } from "react";

interface NoHeaderFooterLayoutProps {
  children: ReactNode;
}

const NoHeaderFooterLayout: React.FC<NoHeaderFooterLayoutProps> = ({
  children,
}) => {
  return <div>{children}</div>;
};

export default NoHeaderFooterLayout;
