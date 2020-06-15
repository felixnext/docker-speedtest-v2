import React, {useState, useEffect, Fragment} from "react";

import styles from "../css/app.less";
import ApiHandler from "./endpoint";

//import 'babel-polyfill';

export default function App() {
  // create the relevant endpoint
  const [api, setApi] = useState(new ApiHandler());
  const [settings, setSettings] = useState({});

  useEffect(() => {
    api.getSettings().then(data => setSettings(data))
  }, [])

  console.log("rendered");

  return ( 
    <Fragment>
      <p>WELCOME TO THE SPEEDTESTER!</p>
      <div>{Object.keys(settings).map( (key, index) => {
        return (<div>
          <span>{key}</span>
          <span> - </span>
          <span>{settings[key]}</span>
         </div>)
      })}</div>
    </Fragment>
  );
}

