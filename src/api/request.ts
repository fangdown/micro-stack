import axios from 'axios';
import { message } from 'antd';

// const DEV_BASE_API = 'http://localhost:11000';
const DEV_BASE_API = 'https://api.git123.cn';
const PRO_BASE_API = 'https://api.git123.cn';
const API = process.env.NODE_ENV === 'development' ? DEV_BASE_API : PRO_BASE_API;
// create an axios instance
const service = axios.create({
    baseURL: API, // url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 5000, // request timeout
});

// request interceptor
service.interceptors.request.use(
    (config: any) => {
        // do something before request is send
        config.headers['Authorization'] = 'Bearer ' + sessionStorage.getItem('token') || '';
        return config;
    },
    (error) => {
        // do something with request error
        console.log(error); // for debug
        return Promise.reject(error);
    }
);

// response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
     */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    (response: any) => {
        const res = response.data;
        // console.log('res', res);
        // if the custom code is not 0, it is judged as an error.
        if (res.code !== 0) {
            message.error(res.message || 'Error');
            return Promise.reject(new Error(res.message || 'Error'));
        } else {
            return res;
        }
    },
    (error) => {
        console.log('err，' + error.message); // for debug
        // eslint-disable-next-line no-debugger
        message.error(error.message);
        return Promise.reject(error);
    }
);

export default service;
