import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { finishPrimersSignIn, primersRedirectUri } from '../lib/primersId';

/** Where Primers ID sends people back to: finishes the sign-in, then opens the app. */
export const PrimersReturn = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const ran = useRef(false);

    useEffect(() => {
        if (ran.current) return; // the code is single use; never send it twice
        ran.current = true;
        (async () => {
            try {
                const { code, verifier } = finishPrimersSignIn();
                const { data } = await axios.post('auth/primers', { code, verifier, redirect_uri: primersRedirectUri() });
                login(data.access_token, data.refresh_token, data.user);
                navigate('/', { replace: true });
            } catch (err: any) {
                const message = err?.response?.data?.message;
                setError((Array.isArray(message) ? message[0] : message) || err?.message || 'Could not sign you in.');
            }
        })();
    }, [login, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl" role="status">
                {error ? (
                    <>
                        <h2 className="text-xl font-bold text-gray-900">Sign-in didn't finish</h2>
                        <p className="mt-3 text-sm text-red-600">{error}</p>
                        <Link to="/login" className="mt-6 inline-block font-medium text-primary hover:text-primary-dark">Back to sign in</Link>
                    </>
                ) : (
                    <p className="text-sm text-gray-600">Signing you in with Primers ID…</p>
                )}
            </div>
        </div>
    );
};
