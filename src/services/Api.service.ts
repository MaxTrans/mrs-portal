import axios, { AxiosError, AxiosResponse } from "axios";
import { toast } from "react-toastify";

axios.defaults.baseURL = "http://localhost:5107/api/";
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
    get: (url: string) => axios.get(url, { headers: {'content-type': 'application/json'} }).then(responseData),
    post:(url: string, data: any) => axios.post(url, data).then(responseData),
    put:(url: string, data: any) => axios.put(url, data).then(responseData),
    delete: (url: string) => axios.delete(url).then(responseData)
}


const APIService = {
    requests
}

export default APIService;

  