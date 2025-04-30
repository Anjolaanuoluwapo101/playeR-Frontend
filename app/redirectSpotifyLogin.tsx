import { Stack } from 'expo-router';
import { useEffect } from 'react';
import {setCookie,getCookie,deleteCookie} from '@/components/Cookies';

// the cookie time limit is same for the backend
// so once this expires,the server own expires along with it
export default function Redirect() {
    //runs once
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('setCookie')) {
            let date = new Date();
            let currentTime = date.getTime()/1000;
            let expireTime = (Number(params.get('tokenTime')) - currentTime) / 60;
            alert('expireTime: ' + expireTime);
            setCookie({
                name : params.get('setCookie'),
                value : 1,
                minutes : expireTime
            })
        }
        // if (params.has('tokenTime')) {
        //     setCookie({
        //         name : 'tokenTimeSF',
        //         value : params.get('tokenTime'),
        //         minutes : 15
        //     })

        // }
        window.location.href = '/';
    }, [])

    return null;
}