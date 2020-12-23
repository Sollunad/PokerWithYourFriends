const axios = require('axios');

export default fetch;

async function fetch(vue, endpoint, method, params) {
    const token = await vue.$auth.getTokenSilently();
    const headers = { Authorization: `Bearer ${token}`};
    const url = 'http://localhost:8081/' + endpoint;
    if (method === 'get') {
        return (await axios({method, url, headers, params})).data;
    } else {
        return (await axios({method, url, headers, data: params})).data;
    }
}