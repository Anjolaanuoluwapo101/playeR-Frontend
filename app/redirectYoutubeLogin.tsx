import { Stack } from 'expo-router';
import { useEffect } from 'react';
import {setCookie,getCookie,deleteCookie} from '@/components/Cookies';

export default function Redirect() {
    //runs once
    useEffect(() => {

        const params = new URLSearchParams(window.location.search);
        if (params.has('setCookie')) {
            setCookie({
                name : params.get('setCookie'),
                value : 1,
                minutes : 10
            })

        }
        if (params.has('tokenTime')) {
            setCookie({
                name : 'tokenTimeYT',
                value : params.get('tokenTime'),
                minutes : 10
            })

        }

        window.location.href = '/';
    }, [])
    return null;
}