import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { ShieldAlert } from 'lucide-react';
import { getUrl } from '@/utils/getUrl';
import axios from 'axios';



const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const authString = btoa(`${username}:${password}`);

  const handleLogin = async (e:any) => {
    e.preventDefault()
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/', {
        username,
        password,
      },{
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`
        },
        withCredentials: true
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('a_token', res.data.app_level._access);
      setResponse(res.data.message || 'Login successful!');
      //Delay before redirect
      setTimeout(() => {
        navigate('/dashboard'); // ✅ Redirect
        
      }, 3000); // 5 seconds delay
    } catch (err: any) {
      console.log(err.response?.data?.message)
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row>
      <Col md={4} className="pe-md-0">
        <div
          className="h-100"
          style={{ backgroundImage: `url(${getUrl('/images/photos/img.jpg')})`, backgroundSize: 'cover' }}
        ></div>
      </Col>
      <Col md={8} className="ps-md-0">
        <div className="px-4 py-5">
          <h5 className="text-secondary fw-normal mb-4">Login to your account</h5>
          <Form onSubmit={handleLogin} autoComplete="on">
            {error && (
              <Alert variant="danger">
                <ShieldAlert className="me-2" size={22} />
                {error}
              </Alert>
            )}
            {response && (
            <div className="alert alert-info mt-3" role="alert">
              {response}
            </div>
          )}
            <Form.Group className="mb-3" controlId="loginUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Username"
                autoComplete="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
               
              />
            </Form.Group>
            <Form.Group className="mb-4" controlId="loginPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </Form.Group>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" animation="border" /> Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default LoginPage;
