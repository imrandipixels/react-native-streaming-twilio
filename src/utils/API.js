import axios from 'axios';

export const ENDPOINT = `https://40f1056d8fe4.ngrok.io`;

export default axios.create({
  baseURL: ENDPOINT,
  timeout: 6000,
});
