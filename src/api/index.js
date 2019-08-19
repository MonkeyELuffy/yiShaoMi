import service from '../utils/request';

export const request = (data, url) => {
    return service({
        url,
        method: 'post',
        data,
    })
}
