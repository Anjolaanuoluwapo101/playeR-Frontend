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
            setCookie({
                name : params.get('setCookie'),
                value : 1,
                minutes : 60
            })

            window.location.href = '/';
        }

    }, [])

    return null;
}