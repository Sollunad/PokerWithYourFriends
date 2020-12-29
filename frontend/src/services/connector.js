const axios = require('axios');
const config = require('../../config');

export default fetch;

async function fetch(vue, endpoint, method, params) {
    const token = await vue.$auth.getTokenSilently();
    const headers = { Authorization: `Bearer ${token}`};
    const environment = process.env.NODE_ENV;
    let url = config[environment] + endpoint;
    if (method === 'get') {
        return (await axios({method, url, headers, params})).data;
    } else {
        return (await axios({method, url, headers, data: params})).data;
    }
}