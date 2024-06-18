import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "react-toastify";




axios.defaults.baseURL = import.meta.env.VITE_API_URL;
//axios.defaults.baseURL = "https://maxtransapi-dev.azurewebsites.net/api/";
axios.defaults.headers.common = {
  'content-type': 'application/json',
};

axios.interceptors.request
.use((requestConfig) => {
    if (localStorage.getItem('authentication') == null && location.href.indexOf('login') == -1){
        const cancelSource = axios.CancelToken.source();
        requestConfig.cancelToken = cancelSource.token;
        cancelSource.cancel('AuthToken expired');
        location.replace('/login');
    }

    const userAuth = localStorage.getItem('authentication') != null ? localStorage.getItem('authentication') : '{}';
    const authToken = JSON.parse(userAuth??'').token;
    const authHeader =  `Bearer ${authToken}`;
    requestConfig.headers['Authorization'] = authHeader;
    return requestConfig;
} )


const responseData = (axiosResponse: AxiosResponse) => axiosResponse.data;

axios.interceptors.response
.use((axiosResponse: AxiosResponse) => { return axiosResponse },
     (error: AxiosError) => { 
        switch(error.response?.status){
            case 404:
                toast.error(error.response?.statusText);
                break
            default:
                const data = error.response ? error.response?.data as string : '';
                data.indexOf('The token is expired.') > 0 ? toast.error("Token expired") : (data !== '' ? toast.error(data) : '');
                console.log(error);
                break;
        }

        return Promise.reject(error.response);
    });

const requests = {
    get: (url: string, httpOptions : AxiosRequestConfig = {} ) => {
        return axios.get(url, httpOptions).then(responseData)
    },
    post:(url: string, data: any) => axios.post(url, data).then(responseData),
    put:(url: string, data: any) => axios.put(url, data).then(responseData),
    delete: (url: string) => axios.delete(url).then(responseData),
    setAutentication: (token: string) => {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
}


const APIService = {
    requests
}

export default APIService;

  