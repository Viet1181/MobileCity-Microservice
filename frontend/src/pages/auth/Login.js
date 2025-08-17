import React, { useState } from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import { connect } from "react-redux";
import { LOGIN, getAuthUser, REGISTER } from '../../api/apiService';

function Auth(props) {
  // State for login
  const [userName, setUserName] = useState("");     
  const [password, setPassword] = useState("");      
  // State for register
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorRegister, setErrorRegister] = useState("");
  const [successRegister, setSuccessRegister] = useState("");
  // State cho userDetails
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [locality, setLocality] = useState("");
  const [country, setCountry] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);
 
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

  

  
  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "userName") setUserName(value);
    if (name === "password") setPassword(value);
    if (name === "passwordConfirm") setPasswordConfirm(value);
    if (name === "firstName") setFirstName(value);
    if (name === "lastName") setLastName(value);
    if (name === "registerEmail") setRegisterEmail(value);
    if (name === "phoneNumber") setPhoneNumber(value);
    if (name === "street") setStreet(value);
    if (name === "streetNumber") setStreetNumber(value);
    if (name === "zipCode") setZipCode(value);
    if (name === "locality") setLocality(value);
    if (name === "country") setCountry(value);
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await LOGIN({ userName, password });
      // Đảm bảo chỉ lưu nếu có đầy đủ thông tin và không có lỗi
      if (data && data.authToken && data.userName && data.id) {
        const token = data.authToken.replace('Bearer ', '');
        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userName', data.userName);
        if (props.addUser) props.addUser({ name: data.userName, id: data.id });
        setShow(false);
        setLoading(false);
        window.location.reload();
      } else {
        // Không lưu gì nếu thiếu trường hoặc backend trả về lỗi
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        setError('Sai tài khoản hoặc mật khẩu');
        setLoading(false);
      }
    } catch (err) {
      // Không lưu gì nếu lỗi
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      setError('Sai tài khoản hoặc mật khẩu');
      setLoading(false);
    }
  }


  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorRegister("");
    setSuccessRegister("");
    if (password !== passwordConfirm) {
      setErrorRegister("Mật khẩu xác nhận không khớp!");
      setLoading(false);
      return;
    }
    try {
      const userData = {
        userName,
        userPassword: password,
        active: 1,
        userDetails: {
          firstName,
          lastName,
          email: registerEmail,
          phoneNumber,
          street,
          streetNumber,
          zipCode,
          locality,
          country
        },
        role: { roleName: 'ROLE_USER' }
      };
      await REGISTER(userData);
      setSuccessRegister("Đăng ký thành công! Vui lòng đăng nhập.");
      setShowRegister(false);
      setLoading(false);
    } catch (err) {
      if (err.response?.data?.message?.includes('User already exists')) {
        setErrorRegister("Tên đăng nhập đã được sử dụng. Vui lòng chọn tên khác.");
      } else {
        setErrorRegister(err.response?.data?.message || "Đã xảy ra lỗi khi đăng ký");
      }
      setLoading(false);
    }
  }

  return (
    <React.Fragment>
      {/* Button should not be wrapped in any <li> or <ul> tags */}

      <Button onClick={handleShow} className="login-btn" bsPrefix="auth">
        <div className="btn-content">
          <span className="material-icons-outlined" style={{ fontSize: 20 }}>
            account_circle
          </span>
          <span>Login</span>
        </div>
      </Button>
      <Modal show={show} onHide={handleClose} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title className="auth-title">
            {showRegister ? "Đăng ký" : "Đăng nhập"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showRegister ? (
            <form className="auth" onSubmit={handleRegisterSubmit}>
              {errorRegister && (
                <div className="form-alert">
                  <Alert variant="danger">
                    <i className="fa fa-exclamation-triangle"></i>
                    {typeof errorRegister === 'string' ? errorRegister : errorRegister.error || errorRegister.confirmPassword}
                  </Alert>
                </div>
              )}
              {successRegister && (
                <div className="form-alert">
                  <Alert variant="success">
                    <i className="fa fa-check-circle"></i>
                    {successRegister}
                  </Alert>
                </div>
              )}
              <div className="form-group">
                <input
                  type="text"
                  required
                  className="form-control auth-input"
                  name="userName"
                  onChange={handleChange}
                />
                <label htmlFor="userName">Tên đăng nhập</label>
                <i className="fa fa-user"></i>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  required
                  className="form-control auth-input"
                  name="lastName"
                  onChange={handleChange}
                />
                <label htmlFor="lastName">Họ</label>
                <i className="fa fa-user"></i>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  required
                  className="form-control auth-input"
                  name="firstName"
                  onChange={handleChange}
                />
                <label htmlFor="firstName">Tên</label>
                <i className="fa fa-user"></i>
              </div>
              <div className="form-group">
                <input
                  type="email"
                  required
                  className="form-control auth-input"
                  name="registerEmail"
                  onChange={handleChange}
                />
                <label htmlFor="registerEmail">Email</label>
                <i className="fa fa-envelope"></i>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  required
                  className="form-control auth-input"
                  name="phoneNumber"
                  onChange={handleChange}
                />
                <label htmlFor="phoneNumber">Số điện thoại</label>
                <i className="fa fa-phone"></i>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  required
                  className="form-control auth-input"
                  name="street"
                  onChange={handleChange}
                />
                <label htmlFor="street">Đường</label>
                <i className="fa fa-road"></i>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  required
                  className="form-control auth-input"
                  name="streetNumber"
                  onChange={handleChange}
                />
                <label htmlFor="streetNumber">Số nhà</label>
                <i className="fa fa-home"></i>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  required
                  className="form-control auth-input"
                  name="zipCode"
                  onChange={handleChange}
                />
                <label htmlFor="zipCode">Mã bưu điện</label>
                <i className="fa fa-envelope"></i>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  required
                  className="form-control auth-input"
                  name="locality"
                  onChange={handleChange}
                />
                <label htmlFor="locality">Thành phố/Huyện</label>
                <i className="fa fa-map-marker"></i>
              </div>
              <div className="form-group">
                <input
                  type="text"
                  required
                  className="form-control auth-input"
                  name="country"
                  onChange={handleChange}
                />
                <label htmlFor="country">Quốc gia</label>
                <i className="fa fa-flag"></i>
              </div>
              <div className="form-group">
                <input
                  type="password"
                  required
                  className="form-control auth-input"
                  name="password"
                  onChange={handleChange}
                />
                <label htmlFor="password">Mật khẩu</label>
                <i className="fa fa-lock"></i>
              </div>
              <div className="form-group">
                <input
                  type="password"
                  required
                  className="form-control auth-input"
                  name="passwordConfirm"
                  onChange={handleChange}
                />
                <label htmlFor="passwordConfirm">Nhập lại mật khẩu</label>
                <i className="fa fa-lock"></i>
              </div>
              <button type="submit" className="submit btn btn-danger">
                {loading ? (
                  <div className="align-middle">
                    <Spinner
                      as="span"
                      animation="grow"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span>Đang đăng ký...</span>
                  </div>
                ) : (
                  <span>Đăng ký</span>
                )}
              </button>
              <div
                className="register-section"
                style={{ textAlign: "center", marginTop: "1rem" }}
              >
                <span>Đã có tài khoản? </span>
                <Button variant="link" onClick={handleShowLogin}>
                  Đăng nhập
                </Button>
              </div>
            </form>
          ) : (
            <form className="auth" onSubmit={handleLoginSubmit}>
              {error && (
                <div className="form-alert">
                  <Alert variant="danger">
                    <i className="fa fa-exclamation-triangle"></i>
                    Invalid credentials!
                  </Alert>
                </div>
              )}
              <div className="form-group">
              <input
  type="text"
  required
  className="form-control auth-input"
  name="userName"
  onChange={handleChange}
/>
<label htmlFor="userName">Tên đăng nhập</label>
                <i className="fa fa-user"></i>
              </div>
              <div className="form-group">
                <input
                  type="password"
                  required
                  className="form-control auth-input"
                  name="password"
                  onChange={handleChange}
                />
                <label htmlFor="password">Password</label>
                <i className="fa fa-lock"></i>
              </div>
              <button type="submit" className="submit btn btn-danger">
                {loading ? (
                  <div className="align-middle">
                    <Spinner
                      as="span"
                      animation="grow"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span>Đang đăng nhập...</span>
                  </div>
                ) : (
                  <span>Đăng nhập</span>
                )}
              </button>
              <div
                className="register-section"
                style={{ textAlign: "center", marginTop: "1rem" }}
              >
                <span>Bạn chưa có tài khoản? </span>
                <Button variant="link" onClick={handleShowRegister}>
                  Đăng ký
                </Button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </React.Fragment>
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    addUser: (user) => dispatch({ type: "USER", value: user }),
    hideAuth: () => dispatch({ type: "LOGIN_CONTROL", value: false }),
  };
};

export default connect(null, mapDispatchToProps)(Auth);
