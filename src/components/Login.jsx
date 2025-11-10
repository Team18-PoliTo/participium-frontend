import { useState } from 'react';  // importa useState
import './styles/Login.css';
import { useActionState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { Link, useNavigate} from 'react-router';
import API from '../API/API';
import ErrorModal from './ErrorModal'; 

function Login() {
    const [state, formAction, isPending] = useActionState(loginFunction, {
        email: '',
        password: ''
    });

    const [errorModalShow, setErrorModalShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    async function loginFunction(prevState, formData) {
        const credentials = {
            email: formData.get('email').trim(),
            password: formData.get('password').trim()
        }
        try {
            const { citizen, token } = await API.loginCitizen(credentials);
            navigate('/map');
            return { ...prevState, citizen, token };
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

                    <div className="register-link-text">
                        If you don't have an account, <Link to="/register">register</Link>
                    </div>

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
