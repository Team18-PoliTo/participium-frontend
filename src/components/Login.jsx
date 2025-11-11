import { useState } from 'react';  // importa useState
import './styles/Login.css';
import { useActionState, useContext } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation} from 'react-router';
import { UserContext } from '../App';
import API from '../API/API';
import ErrorModal from './ErrorModal'; 

function Login() {
    const [state, formAction, isPending] = useActionState(loginFunction, {
        email: '',
        password: ''
    });

    const location = useLocation();
    const isInternalLogin = location.pathname === '/login_internal_user';

    const {loggedIn, setLoggedIn, setUser, setUserRole} = useContext(UserContext);

    const [errorModalShow, setErrorModalShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    async function loginFunction(prevState, formData) {
        const credentials = {
            email: formData.get('email').trim(),
            password: formData.get('password').trim()
        }
        try {
            if (isInternalLogin) {
                const { internalUser, token } =  await API.loginInternalUser(credentials);
                const user = await API.getUserInfo();
                setUser(user);
                setLoggedIn(true);
                setUserRole(user.profile.role);
                navigate('/admin');
                return { ...prevState, internalUser, token };

            } else {
                const { citizen, token } = await API.loginCitizen(credentials);
                const user = await API.getUserInfo();
                setUser(user);
                setLoggedIn(true);
                navigate('/map');
                return { ...prevState, citizen, token };
            }
        } catch (error) {
            setErrorMessage(error.message);
            setErrorModalShow(true);
        }
    }

    return (
        <div className="login-wrapper">
            <Container className="login-container">
                <Form action={formAction} className="login-form">
                    {isPending && <div className="loading-indicator">Logging in...</div>}
                    <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" placeholder="Enter your email" required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name="password" placeholder="Enter your password" required minLength={6} />
                    </Form.Group>
                    {
                        isInternalLogin ? (
                            <div className="register-link-text">
                                If you are a citizen, please <Link to="/login">login here</Link>
                            </div>
                        ) :                     
                            <div className="register-link-text">
                                If you don't have an account, <Link to="/register">register</Link>
                            </div>
                    }
                    <Button
                        className="login-btn"
                        variant="primary"
                        type="submit"
                        disabled={isPending}
                    >
                        Login
                    </Button>
                </Form>
            </Container>

            {/* Modale errore */}
            <ErrorModal
                isOpen={errorModalShow}
                onClose={() => setErrorModalShow(false)}
                title="Login error"
                message={errorMessage}
            />
        </div>
    );
}

export default Login;
