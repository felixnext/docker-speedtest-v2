
export default class ApiHandler {
    constructor() {
        // TODO: retrieve api location
        this.host = process.env["API_HOST"];
        this.port = process.env["API_PORT"];

        console.log("API AT LOCATION: " + this.host + ":" + this.port);
    }
}