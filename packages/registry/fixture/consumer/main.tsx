import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { CourseActivity } from "./activity";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CourseActivity />
  </StrictMode>,
);
