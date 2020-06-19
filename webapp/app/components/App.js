import React, {useState, useEffect} from "react";
import {Button, Container, Row, Jumbotron} from 'react-bootstrap';
import {XYPlot, LineSeries, HorizontalGridLines, VerticalGridLines, XAxis, YAxis} from 'react-vis';
const moment = require('moment-timezone');

import styles from "../css/app.less";
import '../../node_modules/react-vis/dist/style.css';
import ApiHandler from "./endpoint";

//import 'babel-polyfill';

export default function App() {
  // --- STATES ---
  // create the relevant endpoint
  const [api, setApi] = useState(new ApiHandler());
  const [settings, setSettings] = useState({});
  const [speeds, setSpeeds] = useState([]);
  const [tags, setTags] = useState([]);
  const [lastDate, setLastDate] = useState(null);

  // --- LOGIC ---
  // load all data initially
  const refreshData = () => {
    const to = setTimeout(() => {
      api.getSettings().then(data => setSettings(data))
      api.getTags().then(data => setTags(data));
      api.getNewSpeeds(lastDate).then(data => {
        console.log(data)
        setSpeeds(data.concat(speeds))
        if (data.length > 0) {
          setLastDate(data[0].measure_time)
        }
        else {
          return refreshData();
        }
      })

    }, 10000);

    return () => { clearTimeout(to) };
  }

  const loadInit = () => {
    api.getSettings().then(data => setSettings(data))
    api.getTags().then(data => setTags(data))
    api.getSpeeds().then(data => {
      setSpeeds(data)
      if (data.length > 0) {
        setLastDate(data[0].measure_time)
      }
      else {
        return refreshData()
      }
    })
  }

  useEffect(() => {
    if (lastDate == null) {
      return loadInit();
    }
    else {
      return refreshData();
    }
  }, [api, lastDate])

  // timed effect to refresh
  useEffect(() => {
    //
  })

  // --- RENDER ---
  const createGraph = () => {
    let dl = speeds.map(data => { return {x: data.measure_time, y: data.download}; })
    return (
      <XYPlot height={500} width={1000} xType="time">
        <HorizontalGridLines />
        <VerticalGridLines />
        <LineSeries data={dl} />
        <XAxis tickFormat={function tickFormat(d){
          var date = moment(d);
          return date.format("MM/dd/YY hh:mm");
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

