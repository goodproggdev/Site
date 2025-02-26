<<<<<<< HEAD
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
=======
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'flowbite';
import './index.css'
import App from './App.tsx'
>>>>>>> c950a27049e42b0509ec026487062d35f05fbf1b

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
