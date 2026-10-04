import "./landing.css";
import "./reload-demo.css";

export default function Layout({ children }: LayoutProps<"/">) {
  return <div className="air-landing">{children}</div>;
}
