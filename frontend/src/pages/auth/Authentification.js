import React, { Component } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import { Navigate } from 'react-router-dom' 
import Dropdown from 'react-bootstrap/Dropdown'

import Login from './Login'
import Register from './Register'

class Authentification extends Component {
 
    constructor(props){
        super(props)

        this.state = {
            user: '',
            redirect: ''
        }

        this.handleClick = this.handleClick.bind(this)
    }

    componentDidMount() {
        // Lấy user từ localStorage hoặc redux store
        const userName = localStorage.getItem('userName');
        const userId = localStorage.getItem('userId');
        if (userName && userId) {
            this.setState({ user: { name: userName, id: userId } });
        }
    }

    componentDidUpdate() {
        if(this.props.user && this.props.user.name !== this.state.user.name) {
            this.setState({user: this.props.user});
        }
    }

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        this.setState({
            user: ''
        });
        this.props.removeUser();
    }

    handleClick(e) {
        switch(e.target.id) {
          
            case '0':
                this.setState({redirect: 'profile'})
                break;
          
            case '1': 
                this.logout()
                break;
        }
    }
   

    render() {
        const redirect = this.state.redirect

        if (redirect) {
            return <Navigate to={`/${redirect}`} />
        }

        if (this.props.user !== 'guest' && localStorage.getItem('authToken')) {
            return (
                <Dropdown>
                    <Dropdown.Toggle className="toggle-btn" id="dropdown-basic">
                        <i className="material-icons-outlined" style={{ fontSize: 20 }}>account_circle</i>
                        <span>{this.state.user.name}</span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="menu-drop" onClick={this.handleClick}>
                        {/* Nếu cần hiển thị Dashboard cho user có role, có thể kiểm tra thêm trường role nếu lưu trong localStorage hoặc redux */}
                       
                        <Dropdown.Item id="0">Tài khoản của tôi</Dropdown.Item>
                                                
                        <Dropdown.Divider />
                        <Dropdown.Item id="1">
                            <i id="1" className="fa fa-sign-out" aria-hidden="true"></i>
                            Đăng xuất
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            )
        } else {
            return (
                <React.Fragment>
                    <Login />
                    {/* <Register /> */}
                </React.Fragment>
            )
        }
    }
}

const mapStateToProps = state => {
    return {
        user: state.user_data
    }
}

const mapDispatchToProps = dispatch => {
    return {
        removeUser: ( () => dispatch({type: 'USER', value: 'guest'}))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Authentification)
