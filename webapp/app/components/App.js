import React, {useState, useEffect, Fragment, useMemo} from "react";
import {Button, Container, Row, Col, Jumbotron, Spinner} from 'react-bootstrap';
import {FlexibleWidthXYPlot, LineMarkSeries, XAxis, YAxis, HorizontalGridLines, VerticalGridLines, Crosshair} from 'react-vis';
const moment = require('moment-timezone');
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import {useCookies} from 'react-cookie';

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
  const [cookies, setCookies, rmCookies] = useCookies(['timeFilter', 'smoothing']); // defines the time filter for the graph
  const [graphCrossdata, setGraphCrossdata] = useState({crosshairValues: []});
  const [graphHighlight, setGraphHighlight] = useState(null); // defines which graph is highlighted
  const smoothing = parseInt(cookies["smoothing"] || "0")
  const timeFilter = (cookies["timeFilter"] != null ? cookies["timeFilter"].map(x => moment(x)) : null)

  // --- LOGIC ---
  // load all data initially
  const refreshData = () => {
    const to = setTimeout(() => {
      api.getSettings().then(data => setSettings(data))
      api.getTags().then(data => setTags(data));
      api.getNewSpeeds(lastDate).then(data => {
        let newData = data.concat(speeds)

        setSpeeds(newData)

        if (newData.length > 0) {
          setLastDate(newData[0].measure_time)
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
        if (timeFilter == null) {
          setCookies("timeFilter", [data[data.length > 20 ? 20 : data.length - 1].measure_time])
        }
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
    let start = moment.utc(numbers[0]).local()
    let end = moment.utc(numbers[1]).local()
    let isFinal = speeds.length > 0 && (end.unix() == speeds[0].measure_time.unix());
    if (isFinal) {
      setCookies("timeFilter", [moment.utc(start).local()])
    } else {
      setCookies("timeFilter", [moment.utc(start).local(), moment.utc(end).local()])
    }
  }

  const filterData = (data) => {
    let filterSpeed = data;

    // filter data
    if (timeFilter != null) {
      if (timeFilter.length > 1) {
        filterSpeed = filterSpeed.filter(item => item.measure_time >= timeFilter[0] && item.measure_time <= timeFilter[1]);
      } else {
        filterSpeed = filterSpeed.filter(item => item.measure_time >= timeFilter[0]);
      }
    }

    return filterSpeed;
  }

  const smoothData = (data, sm_size) => {
    if (sm_size <= 1 || sm_size == null) {
      return data;
    }
    
    const every = Math.ceil(sm_size / 5)

    const smooth = (arr, item) => {
      let wnd = arr[1];
      let out = arr[0];
      let idx = arr[2];
      wnd = wnd.slice(1);
      wnd.push(Object.assign({}, item));

      let avg_item = Object.assign({}, item);

      if (item.download > 0) {
        ["download", "upload", "ping"].forEach(key => {
          avg_item[key] = (wnd.reduce((p, c) => p + (c == null ? 0 : c[key]), 0) / wnd.reduce((p, c) => p + (c == null ? 0 : 1), 0));
        })
      }
      if (idx % every == 0 || avg_item.download == 0 || (out.length > 0 && out[out.length - 1].download == 0)) {
        out.push(avg_item);
      }
      
      return [out, wnd, idx + 1];
    };

    return [...data].reverse().reduce((p, c) => smooth(p, c), [[], Array(sm_size).fill(null), 0])[0].reverse();
  }

  const computeDown = (data) => {
    let downTime = 0;
    let downCount = 0;
    let isDown = null;
    
    // iterate through all data and compute down time
    [...data].reverse().forEach(item => {
      if (item.download == 0) {
        if (isDown == null) {
          downCount += 1;
          isDown = item.measure_time;
        }
      }
      else {
        if (isDown != null) {
          downTime += item.measure_time.diff(isDown);
        }
        isDown = null;
      }
    })

    return {
      time: moment.duration(downTime),
      counts: downCount
    }
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
        <LineMarkSeries size={2.5} curve={'curveMonotoneX'} opacity={graphHighlight == null || graphHighlight == "download" ? 1 : 0.2} onSeriesMouseOver={() => setGraphHighlight("download")} onSeriesMouseOut={() => setGraphHighlight(null)} data={data[0].data} onNearestX={(val, idx) => setGraphCrossdata({crosshairValues: data.map(d => d.data[idx.index]).map(d => ({x: d.x.valueOf(), y: d.y}))})} />
        <LineMarkSeries size={2.5} curve={'curveMonotoneX'} opacity={graphHighlight == null || graphHighlight == "upload" ? 1 : 0.2} onSeriesMouseOver={() => setGraphHighlight("upload")} onSeriesMouseOut={() => setGraphHighlight(null)} data={data[1].data} />
        <LineMarkSeries size={2.5} curve={'curveMonotoneX'} opacity={graphHighlight == null || graphHighlight == "ping" ? 1 : 0.2} onSeriesMouseOver={() => setGraphHighlight("ping")} onSeriesMouseOut={() => setGraphHighlight(null)} data={data[2].data} />
        <XAxis title="Time" tickLabelAngle={-20} tickFormat={v => moment(v).format("DD-MM-YY HH:mm")} />
        <YAxis title="Speed" />
        <Crosshair
          values={graphCrossdata.crosshairValues}
          itemsFormat={vdata => vdata.map((d, idx) => ({title: data[idx].label, value: d.y.toFixed(2)}))}
          titleFormat={data => ({title: moment(data[0].x).format("DD-MM-YY HH:mm"), value: null})}
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

  const renderFilterTime = (maxTime) => {
    if (timeFilter != null) {
      return (<Fragment>
        <Col xs={4}>
          <span style={{fontWeight:"bold"}}>{timeFilter[0].format("MM/DD/YY HH:mm")}</span>
          <span> to </span>
          <span style={{fontWeight:"bold"}}>{timeFilter.length > 1 ? timeFilter[1].format("MM/DD/YY HH:mm") : ( moment(maxTime).format("MM/DD/YY HH:mm") + " (newest)")}</span>
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
  const smoothSpeed = useMemo(() => smoothData(speeds, smoothing), [speeds, cookies, tags]);
  let filterSpeeds = filterData(smoothSpeed);
  let downs = computeDown(filterSpeeds);

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
          {renderFilterTime(maxTime)}
        </Row>
        <Row>
          <Range allowCross={false} value={timeFilter != null ? [timeFilter[0].valueOf(), timeFilter.length > 1 ? timeFilter[1].valueOf() : maxTime] : []} onChange={updateGraphScope} min={minTime} max={maxTime} />
        </Row>
        <Row>
          {createGraph(filterSpeeds)}
        </Row>
        <Row style={{marginTop: "10px"}}>
          <Col sm={6}>
            <h6>Update Interval: </h6>
            <Slider onChange={(value) => setInterval(value)} min={1} max={120} defaultValue={settings["interval"] || 30} onAfterChange={updateInterval}/>
            <span> Every {interval} minutes</span>
          </Col>
          <Col sm={4}>
            <h6>Smoothing: </h6>
            <Slider onChange={(value) => setCookies("smoothing", value)} min={1} max={20} defaultValue={smoothing}/>
            <span>{smoothing > 1 ? smoothing + " window size" : "disabled"}</span>
          </Col>
          <Col style={{textAlign: "right"}} sm={{span: 2}}>
            {scanButton()}
          </Col>
        </Row>
      </Container>
      <Container style={{marginTop: "40px"}}>
        <Row>
          <Col xs={6} md={4} style={{textAlign: "center"}}>
            <h5>Avg Download: {(filterSpeeds.reduce((acc, val) => acc + val.download, 0) / filterSpeeds.length).toFixed(2)} MB/s</h5>
            <h5>Avg Upload: {(filterSpeeds.reduce((acc, val) => acc + val.upload, 0) / filterSpeeds.length).toFixed(2)} MB/s</h5>
          </Col>
          <Col xs={6} md={4} style={{textAlign: "center"}}>
            <h5>Total Down: {downs.time.humanize({h: 24})}</h5>
            <h5>Down Count: {downs.counts}</h5>
          </Col>
          <Col xs={6} md={4} style={{textAlign: "center"}}>
            <h5>Avg Ping: {(filterSpeeds.reduce((acc, val) => acc + val.ping, 0) / filterSpeeds.length).toFixed(2)} ms</h5>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}

