const moment = require('moment-timezone');
const conf = require('../config');

export default class ApiHandler {
    constructor() {
        // retrieve the api location
        this.host = conf.API_HOST || "localhost";
        this.port = conf.API_PORT || 7000;

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

    updateSpeedData(data) {
        // clean data (adjust timezones)
        return data.map( item => {
            item["measure_time"] = moment.utc(item["measure_time"]).local()
            item["tags"] = item["tags"].filter(item => item != null)
            return item;
        })
    }

    //! Retrieves the current settings
    getSettings() {
        return this.getContentData("/settings")
            .then(data => {
                return data.reduce( (map, obj) => {
                    map[obj.item] = obj.value;
                    return map;
                }, {})
            })
    }

    //! Sets the scan interval in the settings
    setInterval(val) {
        return this.getContentData("/settings/interval/" + val)
            .then(data => {
                return true;
            })
            .catch(error => {
                return false;
            })
    }

    //! Sets the flag
    setFlag() {
        return this.getContentData("/settings/flag")
            .then(data => {
                return true;
            })
            .catch(error => {
                return false;
            })
    }

    //! Returns all speeds in the system (through pagination)
    getSpeeds() {
        return this.getContentData("/speed/count")
            .then(data => {
                return Promise.all([...Array(data.pages).reverse().keys()].map( (idx) => {
                    return this.getContentData("/speed/pages/" + idx).then(data => {
                        return this.updateSpeedData(data);
                    })
                })).then((values) => {
                    // check how to combine the array
                    if (values.length == 0) {
                        return [];
                    }
                    if (values.length == 1) {
                        return values[0];
                    }
                    return values[0].concat(...values.slice(1));
                });
            });
    }

    //! Filters and returns only speeds new up to the given date
    getNewSpeeds(date) {
        return this.getContentData("/speed/new/" + date.getTime())
            .then(data => {
                return this.updateSpeedData(data);
            })
    }
    
    //! Returns a specific speed (in case metadata is updated)
    getSpeedById(id) {
        return this.getContentData("/speed/id/" + id)
            .then(data => {
                return this.updateSpeedData([data])[0];
            })
    }

    getTags() {
        return this.getContentData("/tags")
    }

    createTag(name) {
        return this.getContentData("/tags/create/" + name)
            .then(data => {
                return data.id;
            })
    }

    deleteTag(id) {
        return this.getContentData("/tags/delete/" + id)
            .then(data => {
                return true;
            })
            .catch(data => {
                return false;
            })
    }

    linkTag(speed, tag) {
        return this.getContentData("/tags/link/" + tag + "/" + speed)
            .then(data => {
                return true;
            })
            .catch(data => {
                return false;
            })
    }

    unlinkTag(speed, tag) {
        return this.getContentData("/tags/unlink/" + tag + "/" + speed)
            .then(data => {
                return true;
            })
            .catch(data => {
                return false;
            })
    }
}