CREATE DATABASE speedtest;
\c speedtest;

CREATE TABLE speeds(
    id SERIAL PRIMARY KEY NOT NULL,
    download REAL NOT NULL,
    upload REAL NOT NULL,
    ping REAL NOT NULL,
    measure_time TIMESTAMP NOT NULL,
    record_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip VARCHAR(20),
    isp VARCHAR(50),
    country VARCHAR(50),
    description TEXT DEFAULT NULL
);

CREATE TABLE tags(
    id SERIAL PRIMARY KEY NOT NULL,
    tag VARCHAR(50) 
);

CREATE TABLE speed2tag(
    speed int REFERENCES speeds(id) ON UPDATE CASCADE ON DELETE CASCADE,
    tag int REFERENCES tags(id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE settings(
    item VARCHAR(20) PRIMARY KEY NOT NULL,
    value VARCHAR(20) NOT NULL
);

INSERT INTO settings(item, value) VALUES('run_test', 'false');
INSERT INTO settings(item, value) VALUES('interval', '30');