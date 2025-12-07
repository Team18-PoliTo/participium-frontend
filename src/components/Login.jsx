import './styles/Login.css';
import { useActionState, useContext,useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { Link, useNavigate} from 'react-router';
import { UserContext } from '../App';
import API from '../API/API';
import ErrorModal from './ErrorModal'; 

function Login() {
    const [, formAction, isPending] = useActionState(loginFunction, {
        email: '',
        password: ''
    });

    
    // State per il toggle tra Citizen e Employee
    const [isEmployee, setIsEmployee] = useState(false);

    const { setCitizenLoggedIn,  setUserLoggedIn, setUser, setUserRole} = useContext(UserContext);

    const [errorModalShow, setErrorModalShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    async function loginFunction(prevState, formData) {
        const credentials = {
            email: formData.get('email').trim(),
            password: formData.get('password').trim()
        }
        try {
            if (isEmployee) {
                const { internalUser, token } =  await API.loginInternalUser(credentials);
                const user = await API.getUserInfo();
                setUser(user);
                setUserRole(user.profile.role);
                setUserLoggedIn(true);
                navigate('/dashboard'); // Cambiato da '/admin' a '/dashboard'
                return { ...prevState, internalUser, token };
            } else {
                const { citizen, token } = await API.loginCitizen(credentials);
                const user = await API.getUserInfo();
                setUser(user);
                setCitizenLoggedIn(true);
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
                {/* Toggle per switchare tra Citizen e Employee */}
                <div className={`user-type-toggle ${isEmployee ? 'employee-active' : ''}`}>
                    <Button
                        className={`toggle-btn ${isEmployee ? '' : 'active'}`}
                        variant="link"
                        onClick={() => setIsEmployee(false)}
                        disabled={isPending}
                    >
                        Citizen
                    </Button>
                    <Button
                        className={`toggle-btn ${isEmployee ? 'active' : ''}`}
                        variant="link"
                        onClick={() => setIsEmployee(true)}
                        disabled={isPending}
                    >
                        Employee
                    </Button>
                </div>

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
                        !isEmployee && (
                            <div className="register-link-text">
                                If you don't have an account, <Link to="/register">register</Link>
                            </div>
                        )
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
