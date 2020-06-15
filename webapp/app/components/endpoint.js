
export default class ApiHandler {
    constructor() {
        // retrieve the api location
        this.host = process.env.API_HOST || "localhost";
        this.port = process.env.API_PORT || 7000;

        console.log("API AT LOCATION: " + this.host + ":" + this.port);
    }

    _getData(url = '') {
        // Default options are marked with *
        return fetch(url, {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json',
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // no-referrer, *client
            //body: data
        })
        .then(response => ({ status: response.status, ok: response.ok, data: response.json() }) ) // parses JSON response into native Javascript objects
        .catch(err => ({status: 503, ok: false, data: err}))
    }

    //! Helper that sends a get request to the server
    getContentData(url) {
        let final_url = "http://" + this.host + ":" + this.port + url;
        let ref = this
        return new Promise(function(resolve, reject) {
            ref._getData(final_url)
                .then(resp => resp.ok ? resolve(resp.data) : reject(resp.data))
                .catch(error => reject(error))
        });
    }

    getSettings() {
        console.log("called")
        return this.getContentData("/settings")
            .then(data => {
                return data.reduce( (map, obj) => {
                    map[obj.item] = obj.value;
                    return map;
                }, {})
            })
    }
}