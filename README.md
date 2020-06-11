# docker-speedtest-v2

New version of the docker speedtest tool. The components are more decoupled and the UI is reworked to allow manual tests and more data.

## Getting Started

First build the docker containers:

```bash
cd speedtest
docker build -t speedtest .
cd ../webapp
docker build -t speedtest-app .
cd ..
```

You can then run the docker compose script:

```bash
docker-compose 
```

If you want to run the compose script always on startup:

```bash
docker-compose
```

## License

The code is published under the Apache-2 License.

## Contribution

If you want to contribute, feel free to create a PR