import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";  // Une logique partagée
import './index.css';
/*import './front-admin/css/style.css';
import './front-admin/css/satoshi.css';
import 'jsvectormap/dist/css/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
*/
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
        //<React.StrictMode>
          <App />
    //</React.StrictMode> 
     );
