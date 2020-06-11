CREATE TABLE speeds(
    id SERIAL PRIMARY KEY NOT NULL,
    download REAL NOT NULL,
    upload REAL NOT NULL,
    ping REAL NOT NULL,
    measure_time TIMESTAMP NOT NULL,
    ip VARCHAR(20),
    isp VARCHAR(50),
    country VARCHAR(50)
);

CREATE TABLE settings(
    item VARCHAR(20) PRIMARY KEY NOT NULL,
    value VARCHAR(20) NOT NULL
);

INSERT INTO settings(item, value) VALUES('run_test', 'false');
INSERT INTO settings(item, value) VALUES('interval', '30');