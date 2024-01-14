import axios from './request';
// axios.defaults.baseURL = 'https://api.fangdown.cn';
// axios.defaults.baseURL = 'http://localhost:11000';
// axios.defaults.headers.common['Authorization'] = sessionStorage.getItem('token') || '';

export const login = (data: Record<string, any>) => {
    const { username, password } = data;
    return axios.post('/auth/login', { username, password });
};
export const addStack = (data: Record<string, any>) => {
    const { id, pid, title, link, img_url, icon } = data;
    return axios.post('/stack/add', { id, pid, title, link, img_url, icon });
};
export const updatePid = (id: number, pid: number) => {
    return axios.post('/stack/update-pid', { id, pid });
};

export const listStack = (title?: string) => {
    return axios.get('/stack/list', {
        params: {
            page: 1,
            title,
        },
    });
};

export const deleteStack = (id: number) => {
    return axios.post('/stack/delete', { ids: [id] });
};
