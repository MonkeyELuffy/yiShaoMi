import service from '../utils/request';

export const request = (data, url, upFileQuery = {}) => {
    return service({
        url,
        method: 'post',
        data,
        upFileQuery,
    })
}
