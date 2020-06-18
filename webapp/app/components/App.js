import React, {useState, useEffect} from "react";
import {Button, Container, Row, Jumbotron} from 'react-bootstrap';
import {XYPlot, LineSeries, HorizontalGridLines, VerticalGridLines, XAxis, YAxis} from 'react-vis';

import styles from "../css/app.less";
import ApiHandler from "./endpoint";

//import 'babel-polyfill';

export default function App() {
  // --- STATES ---
  // create the relevant endpoint
  const [api, setApi] = useState(new ApiHandler());
  const [settings, setSettings] = useState({});
  const [speeds, setSpeeds] = useState([]);
  const [tags, setTags] = useState([]);

  // --- LOGIC ---
  // load all data initially
  useEffect(() => {
    api.getSpeeds().then(data => setSpeeds(data))
    api.getSettings().then(data => setSettings(data))
    api.getTags().then(data => setTags(data))

    const interval = setInterval(() => {
      api.getSettings().then(data => setSettings(data))
      api.getTags().then(data => setTags(data));
      console.log(speeds);
      api.getNewSpeeds(speeds[0].measure_time.toDate()).then(data => setSpeeds(speeds.concat(data)))
    }, 10000);

    return () => clearInterval(interval);
  }, [api])

  // timed effect to refresh
  useEffect(() => {
    //
  })

  // --- RENDER ---
  const createGraph = () => {
    let dl = speeds.map(data => { return {x: data.measure_time.toDate(), y: data.download}; })
    console.log(dl);
    return (
      <XYPlot height={500} width={1000} xType="time">
        <HorizontalGridLines />
        <VerticalGridLines />
        <LineSeries data={dl} />
        <XAxis tickFormat={function tickFormat(d){
          const date = new Date(d)
          return date.toISOString().substr(11, 8)
        }} />
        <YAxis />
      </XYPlot>
    );
  }

  return ( 
    <Container>
      <Jumbotron>
        <h1>Welcome to the Internet Speedtester</h1>
        <p>
          This is a simple tool that allows you to monitor your local internet speeds.
        </p>
      </Jumbotron>
      <Container>
        {createGraph()}
      </Container>
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
    </Container>
  );
}

