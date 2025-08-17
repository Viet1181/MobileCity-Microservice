import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { connect } from 'react-redux';

function Auth(props) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errorKeys, setErrorKeys] = useState([]);
  const [errorRegister, setErrorRegister] = useState([]);
  const [passwordError, setPasswordError] = useState('');

  const handleClose = () => {
    setShow(false);
    props.hideAuth();
  };

  const handleShow = () => {
    setShow(true);
  };

  const handleShowRegister = () => {
    setShowRegister(true);
  };

  const handleShowLogin = () => {
    setShowRegister(false);
  };

  function handleLoginSubmit(e) {
    e.preventDefault();
    
    if (password.length < 7) {
      setPasswordError('Mật khẩu phải có ít nhất 7 ký tự!');
      return;
    } else {
      setPasswordError('');
    }

    setLoading(true);
    axios.post('http://127.0.0.1:8000/api/login', {
      email: email,
      password: password,
    })
      .then(result => {
        localStorage.setItem('token', result.data.token);
        props.addUser(result.data.user);
        setLoading(false);
        handleClose(); // Close modal on successful login
      })
      .catch(error => {
        setError(true);
        setLoading(false);
      });
  }

  function handleRegisterSubmit(e) {
    e.preventDefault();

    if (password.length < 7) {
      setPasswordError('Mật khẩu phải có ít nhất 7 ký tự!');
      return;
    } else if (password !== passwordConfirm) {
      setPasswordError('Mật khẩu xác nhận không khớp!');
      return;
    } else {
      setPasswordError('');
    }

    setLoading(true);
    axios.post('http://127.0.0.1:8000/api/register', {
      name: name,
      email: email,
      password: password,
      password_confirmation: passwordConfirm,
    })
      .then(result => {
        localStorage.setItem('token', result.data.token);
        props.addUser(result.data.user);
        handleClose(); // Close modal on successful registration
      })
      .catch(err => {
        setErrorRegister(Object.keys(JSON.parse(err.response.data)));
        setErrorRegister(JSON.parse(err.response.data));
        setLoading(false);
      });
  }

  function handleChange(e) {
    if (e.target.name === 'email') setEmail(e.target.value);
    if (e.target.name === 'password') setPassword(e.target.value);
    if (e.target.name === 'name') setName(e.target.value);
if (e.target.name === 'password_confirmation') setPasswordConfirm(e.target.value);
  }

  return (
    <React.Fragment>
      <Button onClick={handleShow} className="auth-btn">
        <i className="fa fa-sign-in"></i> Đăng nhập
      </Button>

      <Modal show={show} onHide={handleClose} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title className="auth-title">
            {showRegister ? 'Sign Up' : 'Sign In'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showRegister ? (
            <form className="auth-form" onSubmit={handleRegisterSubmit}>
              {errorRegister && errorKeys.map(key => (
                <Alert variant='danger' className="form-alert" key={key}>
                  <i className="fa fa-exclamation-triangle"></i>
                  {errorRegister[key]}
                </Alert>
              ))}
              {passwordError && (
                <Alert variant='danger' className="form-alert">
                  <i className="fa fa-exclamation-triangle"></i>
                  {passwordError}
                </Alert>
              )}
              <div className="form-group">
                <input
                  type="text"
                  required
                  className="form-control auth-input"
                  name="name"
                  onChange={handleChange}
                  placeholder="Your name"
                />
                <i className="fa fa-user auth-icon"></i>
              </div>
              <div className="form-group">
                <input
                  type="email"
                  required
                  className="form-control auth-input"
                  name="email"
                  onChange={handleChange}
                  placeholder="Your email"
                />
                <i className="fa fa-envelope auth-icon"></i>
              </div>
              <div className="form-group">
                <input
                  type="password"
                  required
                  className="form-control auth-input"
                  name="password"
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
                <i className="fa fa-lock auth-icon"></i>
              </div>
              <div className="form-group">
                <input
                  type="password"
                  required
                  className="form-control auth-input"
                  name="password_confirmation"
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
                <i className="fa fa-lock auth-icon"></i>
              </div>
              <Button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
<span className="ml-2">Registering...</span>
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
              <div className="toggle-section text-center mt-3">
                <span>Đã có tài khoản? </span>
                <Button variant="link" onClick={handleShowLogin}>Đăng nhập</Button>
              </div>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleLoginSubmit}>
              {error && (
                <Alert variant='danger' className="form-alert">
                  <i className="fa fa-exclamation-triangle"></i>
                  Invalid credentials!
                </Alert>
              )}
              {passwordError && (
                <Alert variant='danger' className="form-alert">
                  <i className="fa fa-exclamation-triangle"></i>
                  {passwordError}
                </Alert>
              )}
              <div className="form-group">
                <input
                  type="email"
                  required
                  className="form-control auth-input"
                  name="email"
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
                <i className="fa fa-envelope auth-icon"></i>
              </div>
              <div className="form-group">
                <input
                  type="password"
                  required
                  className="form-control auth-input"
                  name="password"
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
                <i className="fa fa-lock auth-icon"></i>
              </div>
              <Button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ml-2">Logging in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
              <div className="toggle-section text-center mt-3">
                <span>Bạn chưa có tài khoản? </span>
                <Button variant="link" onClick={handleShowRegister}>Đăng ký</Button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}

const mapDispatchToProps = dispatch => {
  return {
    addUser: (user) => dispatch({ type: 'USER', value: user }),
    hideAuth: () => dispatch({ type: 'LOGIN_CONTROL', value: false }),
  };
};

export default connect(null, mapDispatchToProps)(Auth);