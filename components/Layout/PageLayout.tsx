/* eslint-disable react/destructuring-assignment */
// import Footer from "./Footer.js";
import { ReactNode } from "react";
import Navbar from "./Navbar";
import { useTheme } from "@/hooks/useDarkMode";

const PageLayout = (props): JSX.Element => {
  const darkTheme = useTheme();
  return (
    <div className={`mx-auto w-full h-screen min-h-screen ${darkTheme && "dark"}`}>
      <Navbar />
      {props.children}
      {/* <Footer /> */}
    </div>
  );
};

export default PageLayout;
