import React, {useState, useEffect, Fragment} from "react";

import styles from "../css/app.less";
import ApiHandler from "./endpoint";

//import 'babel-polyfill';

export default function App() {
  // create the relevant endpoint
  const [api, setApi] = useState(new ApiHandler());
  const [settings, setSettings] = useState({});
  const [speeds, setSpeeds] = useState([]);

  useEffect(() => {
    api.getSettings().then(data => setSettings(data))
  }, [])

  useEffect(() => {
    api.getSpeeds().then(data => setSpeeds(data))
  }, [])

  console.log("rendered");

  return ( 
    <Fragment>
      <p>WELCOME TO THE SPEEDTESTER!</p>
      <div>{Object.keys(settings).map( (key, index) => {
        return (<div key={index}>
          <span>{key}</span>
          <span> - </span>
          <span>{settings[key]}</span>
         </div>)
      })}</div>
      <div>{speeds.map( (key, index) => {
        return (<div key={index}>
          <span>{key.id}</span>
          <span> - </span>
          <span>{key.download}</span>
          <span> - </span>
          <span>{key.measure_time.toString()}</span>
          <span> - </span>
          <span>{key.tags}</span>
         </div>)
      })}</div>
    </Fragment>
  );
}

