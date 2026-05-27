//chonghao.25@ichat.sp.edu.sg adminNo 2523330  DIT/FT/1B/04
function fetchMethod(url, callback, method = "GET", data = null, token = null) {
  console.log("fetchMethod: ", url, method, data, token);

  const headers = {};

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  let options = {
    method: method.toUpperCase(),
    headers: headers,
  };

  if (method.toUpperCase() !== "GET" && data !== null) {
    options.body = JSON.stringify(data);
  }

  fetch(url, options)
    .then((response) => {
      // No content: still call callback so caller can react to status (e.g. 204)
      if (response.status === 204) {
        callback(response.status, {});
        return;
      }

      // Try to parse JSON body; if it fails, still surface the status to caller
      response
        .json()
        .then((responseData) => callback(response.status, responseData))
        .catch((parseError) => {
          console.error(`Error parsing JSON from ${method} ${url}:`, parseError);
          callback(response.status, null);
        });
    })
    .catch((error) => {
      console.error(`Error from ${method} ${url}:`, error);
      // status 0 convention: network error / server unreachable
      callback(0, null);
    });
}