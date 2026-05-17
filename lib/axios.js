import axios from "axios";

// ngrok shows a browser warning page on free accounts that blocks requests.
// This header tells ngrok to skip that warning for all API calls.
// This header does nothing in production — it's harmless to leave in.
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

export default axios;
