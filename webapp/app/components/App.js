import React, {useState, useEffect} from "react";
import {Button, Container, Row, Col, Jumbotron, Spinner} from 'react-bootstrap';
//import {FlexibleWidthXYPlot, LineMarkSeries, HorizontalGridLines, VerticalGridLines, XAxis, YAxis, Crosshair} from 'react-vis';
import {Chart} from 'react-charts';
const moment = require('moment-timezone');
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

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
  const [interval, setInterval] = useState(0);

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
    api.getSettings().then(data => {
      setInterval(data["interval"] || 0)
      setSettings(data)
    })
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

  const updateInterval = (value) => {
    api.setInterval(value).then(success =>{
      api.getSettings().then(data => setSettings(data))
    })
  }

  const updateGraphScope = (numbers) => {
    let start = numbers[0]
    let end = numbers[1]
  }

  // --- RENDER ---
  const createGraph = () => {
    // TODO: limit data
    let data = [
      {
        label: "Download (MB/s)",
        data: speeds.map(data => { return {x: data.measure_time.toDate(), y: data.download}; })
      },
      {
        label: "Upload (MB/s)",
        data: speeds.map(data => { return {x: data.measure_time.toDate(), y: data.upload}; })
      },
      {
        label: "Ping (ms)",
        data: speeds.map(data => { return {x: data.measure_time.toDate(), y: data.ping}; })
      }
    ]
    let axes = [
      { primary: true, type: 'time', position: 'bottom' },
      { type: 'linear', position: 'left' }
    ]
    return (
      <div style={{height: "400px", width: "100%"}}>
        <Chart data={data} axes={axes} tooltip primaryCursor secondaryCursor />
      </div>
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
  
  // TODO: select time zones to limit to last 20

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
          <span>Select Time:</span>
          <Range allowCross={false} defaultValue={[0, 20]} onAfterChange={updateGraphScope} />
        </Row>
        <Row>
          {createGraph()}
        </Row>
        <Row>
          <Col sm={8}>
            <span>Update Interval: </span>
            <Slider onChange={(value) => setInterval(value)} min={1} max={120} defaultValue={settings["interval"] || 30} onAfterChange={updateInterval}/>
            <span> Every {interval} minutes</span>
          </Col>
          <Col style={{textAlign: "right"}} sm={{span: 4}}>
            {scanButton()}
          </Col>
        </Row>
      </Container>
      <Container>
        STATS HERE
      </Container>
    </Container>
  );
}

