import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "react-toastify";

axios.defaults.baseURL = import.meta.env.VITE_API_URL;
//axios.defaults.baseURL = "https://maxtransapi-dev.azurewebsites.net/api/";
axios.defaults.headers.common = {
  'content-type': 'application/json',
  'Authorization': 'Bearer '// + ${auth_token}
};

const responseData = (axiosResponse: AxiosResponse) => axiosResponse.data;

axios.interceptors.response
.use((axiosResponse: AxiosResponse) => { return axiosResponse },
     (error: AxiosError) => { 
        switch(error.status){
            case 404:
                toast.error(error.message);
                break
            default:
                toast.error(error.message);
                console.log(error);
                break;
        }

        return Promise.reject(error.response);
    });

const requests = {
    get: (url: string, httpOptions : AxiosRequestConfig = {} ) => {
        return axios.get(url).then(responseData)
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

  