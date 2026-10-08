import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from './contexts/ThemeContext';
import { App } from "./App";

const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(<ThemeProvider><App /></ThemeProvider>);
}
