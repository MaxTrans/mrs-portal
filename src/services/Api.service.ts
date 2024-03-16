const config = {
    api: 'http://localhost:5107/api/',
    options: {
      headers: { 'content-type': 'application/json', 'Authorization': ''},
    },
  };

  const getAuthHeaders = () => {
    let authentication:any = localStorage.getItem('authentication');
      if (authentication) {
        authentication = JSON.parse(authentication);
        config.options.headers.Authorization = 'Bearer ' + authentication.profile.token ;
        return config.options;
      }
      else
      return config.options;
  };
  
  const httpGet = (endpoint:string) => {
    let options :any = getAuthHeaders();
    return fetch(`${config.api}${endpoint}`, {
      ...options,
    })
      .then((response) => handleResponse(response))
      .then((response) => response)
      .catch((error) => {
        console.error(error);
        throw Error(error);
      });
  };
  
  const httpPost = (endpoint:string, data:any) => {
    let options:any = getAuthHeaders();
    return fetch(`${config.api}${endpoint}`, {
      method: 'post',
      body: data ? JSON.stringify(data) : null, 
      ...options
    })
      .then((response) => handleResponse(response))
      .then((response) => response)
      .catch((error) => {
        console.error(error);
        throw Error(error);
      });
  };
  
  const httpPut = (endpoint:string, data:any) => {
    let options:any = getAuthHeaders();
    return fetch(`${config.api}${endpoint}`, {
      method: 'put',
      body: data ? JSON.stringify(data) : null,
      ...options,
    })
      .then((response) => handleResponse(response))
      .then((response) => response)
      .catch((error) => {
        console.error(error);
        throw Error(error);
      });
  };
  
  const httpDelete = (endpoint:string, data:any) => {
    let options:any = getAuthHeaders();
    return fetch(`${config.api}${endpoint}`, {
      method: 'delete',
      ...options,
    })
      .then((response) => handleResponse(response))
      .then((response) => response)
      .catch((error) => {
        console.error(error);
        throw Error(error);
      });
  };
  
  const handleResponse = (response:any) => {
    // You can handle 400 errors as well.
    if (response.status === 200) {
      return response.json();
    } else {
      throw Error(response.json() || 'error');
    }
  };
  
  export default { httpGet, httpPost, httpPut, httpDelete };
  