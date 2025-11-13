const cron = require('node-cron');
const axios = require('axios');

const API_URL = "https://erp-student-backend.onrender.com";

async function callOwnApi() {
    try {
        const response = await axios.get(API_URL);
        // console.log(`Cron Scheduler API call at ${new Date().toISOString()}:`, response.data);
    } catch (error) {
        // console.error(`Scheduler API error at ${new Date().toISOString()}:`, error.message);
    }
}
function startScheduler() {
    cron.schedule('*/6 * * * *', () => {
        // console.log(`Running scheduled API call at ${new Date().toISOString()}`);
        callOwnApi();
    });
    // console.log('Scheduler initialized. API calls will run every 10 minutes.');
}

module.exports = { startScheduler };