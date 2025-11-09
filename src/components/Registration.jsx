import { useState, useActionState} from 'react'; 
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';
import API from '../API/API';
import ErrorModal from './ErrorModal'; 
import './styles/Registration.css';

function Registration() {
    const [state, formAction, isPending] = useActionState(registrationFunction, {
        name: '',
        surname: '',
        username: '',
        email: '',
        password: ''
    });

    const [errorModalShow, setErrorModalShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const navigate = useNavigate();

    async function registrationFunction(prevState, formData) {
        const credentials = {
            name: formData.get('name'),
            surname: formData.get('surname'),
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password')
        }
        try {
            const citizen = await API.registerCitizen(credentials);
            navigate('/login');
            return { ...prevState, citizen };
        } catch (error) {
            setErrorMessage(error.message);
            setErrorModalShow(true);
        }
    }

    return (
        <div className="registration-wrapper">
            <Container className="registration-container">
                <Form action={formAction} className="registration-form">
                    {isPending && <div className="loading-indicator">Registering...</div>}
                    <Row className="mb-3">
                        <Col>
                            <Form.Group controlId="formName">
                                <Form.Label>Name</Form.Label>
                                <Form.Control type="text" name="name" placeholder="Enter your name" required />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group controlId="formSurname">
                                <Form.Label>Surname</Form.Label>
                                <Form.Control type="text" name="surname" placeholder="Enter your surname" required />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Form.Group className="mb-3" controlId="formUsername">
                        <Form.Label>Username</Form.Label>
                        <Form.Control type="text" name="username" placeholder="Choose a username" required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" name="email" placeholder="Enter your email" required />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" name="password" placeholder="Enter your password" required minLength={6} />
                    </Form.Group>

                    <div className="login-link-text">
                        If you don't have an account, <Link to="/login">login</Link>
                    </div>

                    <Button
                        className="register-btn"
                        variant="primary"
                        type="submit"
                        disabled={isPending}
                    >
                        Register
                    </Button>
                </Form>
            </Container>

            {/* Modale errore */}
            <ErrorModal
                isOpen={errorModalShow}
                onClose={() => setErrorModalShow(false)}
                title="Registration error"
                message={errorMessage}
            />
        </div>
    );
}

export default Registration;
