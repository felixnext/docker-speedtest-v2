import React, {useState, useEffect} from "react";
import {Button, Container, Row, Col, Jumbotron, Spinner} from 'react-bootstrap';
import {FlexibleWidthXYPlot, LineMarkSeries, HorizontalGridLines, VerticalGridLines, XAxis, YAxis, Crosshair} from 'react-vis';
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

  // --- ACTIONS ---

  const runScan = () => {
    api.setFlag().then(success => {
      api.getSettings().then(data => setSettings(data))
    })
  }

  // --- RENDER ---
  const createGraph = () => {
    // TODO: limit data
    let dl = speeds.map(data => { return {x: data.measure_time, y: data.download}; })
    let ul = speeds.map(data => { return {x: data.measure_time, y: data.upload}; })
    let pn = speeds.map(data => { return {x: data.measure_time, y: data.ping}; })
    return (
      <FlexibleWidthXYPlot height={500} xType="time">
        <HorizontalGridLines />
        <VerticalGridLines />
        <LineMarkSeries data={dl} color="green" size={2} />
        <LineMarkSeries data={ul} color="yellow" size={2} />
        <LineMarkSeries data={pn} color="red" size={2} />
        <XAxis tickFormat={function tickFormat(d){
          var date = moment(d);
          return date.format("MM/dd/YY hh:mm");
        }} />
        <YAxis />
      </FlexibleWidthXYPlot>
    );
    // <Crosshair values={this.state.crosshairValues} className={'data-legend'} />
  }

  const scanButton = () => {
    if ((settings["run_test"] || "false").toLowerCase() == 'true') {
      return (<Button variant="warning" disabled>
        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
        <span> Scanning ...</span>
      </Button>)
    }
    else {
      return (<Button variant="outline-warning" onClick={runScan}>Scan Now</Button>)
    }
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
        <Row>
          Slider here
        </Row>
        <Row>
          {createGraph()}
        </Row>
        <Row>
          <Col sm>
            Slider here
          </Col>
          <Col style={{textAlign: "right"}}sm={{span: 4, offset: 4}}>
            {scanButton()}
          </Col>
        </Row>
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

