import React, {useState, useEffect, Fragment} from "react";
import {Button, Container, Row, Col, Jumbotron, Spinner} from 'react-bootstrap';
import {FlexibleWidthXYPlot, LineMarkSeries, XAxis, YAxis, HorizontalGridLines, VerticalGridLines, Crosshair} from 'react-vis';
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
  const [api, setApi] = useState(new ApiHandler()); // defines API access
  const [settings, setSettings] = useState({});     // stores the settings
  const [speeds, setSpeeds] = useState([]);         // stores all speed measurements
  const [tags, setTags] = useState([]);             // stores all tags
  const [lastDate, setLastDate] = useState(null);   // stores the last data that is used for sync
  const [interval, setInterval] = useState(0);      // helper for the interval UI element
  const [timeFilter, setTimeFilter] = useState(null); // defines the time filter for the graph
  const [graphCrossdata, setGraphCrossdata] = useState({crosshairValues: []});

  // --- LOGIC ---
  // load all data initially
  const refreshData = () => {
    const to = setTimeout(() => {
      api.getSettings().then(data => setSettings(data))
      api.getTags().then(data => setTags(data));
      api.getNewSpeeds(lastDate).then(data => {
        let updateFilter = timeFilter != null && (timeFilter[1] == speeds[0].measure_time);
        let newData = data.concat(speeds)

        setSpeeds(newData)
        if (updateFilter == true && newData.length > 0) {
          setTimeFilter([timeFilter[0], newData[0].measure_time])
        }

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
        setTimeFilter([data[data.length > 20 ? 20 : data.length - 1].measure_time, data[0].measure_time])
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
    setTimeFilter([moment.utc(start).local(), moment.utc(end).local()])
  }

  const filterData = () => {
    let filterSpeed = speeds;

    // filter data
    if (timeFilter != null) {
      filterSpeed = filterSpeed.filter(item => item.measure_time >= timeFilter[0] && item.measure_time <= timeFilter[1]);
    }

    return filterSpeed;
  }

  // --- RENDER ---
  const createGraph = (filterSpeed) => {
    // generate data
    let data = [
      {
        label: "Download (MB/s)",
        data: filterSpeed.map(data => { return {x: data.measure_time, y: data.download}; })
      },
      {
        label: "Upload (MB/s)",
        data: filterSpeed.map(data => { return {x: data.measure_time, y: data.upload}; })
      },
      {
        label: "Ping (ms)",
        data: filterSpeed.map(data => { return {x: data.measure_time, y: data.ping}; })
      }
    ]
    let axes = [
      { primary: true, type: 'time', position: 'bottom' },
      { type: 'linear', position: 'left' }
    ]
    return (
      <FlexibleWidthXYPlot onMouseLeave={() => setGraphCrossdata({crosshairValues: []})} height={400}>
        <HorizontalGridLines />
        <VerticalGridLines />
        <LineMarkSeries data={data[0].data} onNearestX={(val, idx) => setGraphCrossdata({crosshairValues: data.map(d => d.data[idx.index]).map(d => ({x: d.x.valueOf(), y: d.y}))})} />
        <LineMarkSeries data={data[1].data} />
        <LineMarkSeries data={data[2].data} />
        <XAxis title="Time" tickLabelAngle={-20} tickFormat={v => moment(v).format("DD-MM-YY hh:mm")} />
        <YAxis title="Speed" />
        <Crosshair
          values={graphCrossdata.crosshairValues}
          itemsFormat={vdata => vdata.map((d, idx) => ({title: data[idx].label, value: d.y}))}
          titleFormat={data => ({title: moment(data[0].x).format("DD-MM-YY hh:mm"), value: null})}
        />
      </FlexibleWidthXYPlot>
    );
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

  const renderFilterTime = () => {
    if (timeFilter != null) {
      return (<Fragment>
        <Col xs={4}>
          <span>{timeFilter[0].format("MM/DD/YY hh:mm")}</span>
          <span> to </span>
          <span>{timeFilter[1].format("MM/DD/YY hh:mm")}</span>
        </Col>
      </Fragment>);
    }
    return (null);
  }
  
  let minTime = 0;
  let maxTime = moment().valueOf();
  if (speeds.length > 0) {
    minTime = speeds[speeds.length - 1].measure_time.valueOf();
    maxTime = speeds[0].measure_time.valueOf();
  }
  let filterSpeeds = filterData();

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
          <Col xs={6}>
            <h4>Selected Time:</h4>
          </Col>
          {renderFilterTime()}
        </Row>
        <Row>
          <Range allowCross={false} value={timeFilter != null ? [timeFilter[0].valueOf(), timeFilter[1].valueOf()] : []} onChange={updateGraphScope} min={minTime} max={maxTime} />
        </Row>
        <Row>
          {createGraph(filterSpeeds)}
        </Row>
        <Row>
          <Col sm={8}>
            <h6>Update Interval: </h6>
            <Slider onChange={(value) => setInterval(value)} min={1} max={120} defaultValue={settings["interval"] || 30} onAfterChange={updateInterval}/>
            <span> Every {interval} minutes</span>
          </Col>
          <Col style={{textAlign: "right"}} sm={{span: 4}}>
            {scanButton()}
          </Col>
        </Row>
      </Container>
      <Container style={{marginTop: "40px"}}>
        <Row>
          <Col xs={6} md={4} style={{textAlign: "center"}}>
            <h5>Avg Download: {(filterSpeeds.reduce((acc, val) => acc + val.download, 0) / filterSpeeds.length).toFixed(2)} MB/s</h5>
          </Col>
          <Col xs={6} md={4} style={{textAlign: "center"}}>
            <h5>Avg Upload: {(filterSpeeds.reduce((acc, val) => acc + val.upload, 0) / filterSpeeds.length).toFixed(2)} MB/s</h5>
          </Col>
          <Col xs={6} md={4} style={{textAlign: "center"}}>
            <h5>Avg Ping: {(filterSpeeds.reduce((acc, val) => acc + val.ping, 0) / filterSpeeds.length).toFixed(2)} ms</h5>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

