import './styles/Login.css';
import { useActionState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { Link } from 'react-router';

function Login() {
    const [state, formAction, isPending] = useActionState(loginFunction, {
        email: '',
        password: ''
    });

    async function loginFunction(prevState, formData) {
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password')
        }
        try {
            // logica per login, ad esempio:
            // const response = await API.loginCitizen(credentials);
        } catch (error) {
            // gestione errori
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
                        <Form.Control type="password" name="password" placeholder="Enter your password" required />
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
        </div>
    );
}

export default Login;
