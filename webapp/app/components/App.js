import React, {useState, useEffect, Fragment} from "react";

import styles from "../css/app.less";
import ApiHandler from "./endpoint";

export default function App() {
  // create the relevant endpoint
  const [api, setApi] = useState(new ApiHandler());

  return ( 
    <Fragment>
      <p>WELCOME TO THE SPEEDTESTER!</p>
    </Fragment>
  );
}

