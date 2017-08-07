import React, { Component } from "react";
import { Button, Modal, Input, notification } from "antd";
import DropdownSelection from "../components/DropdownSelection.js";
import ChangePasswordModal from "../components/ChangePasswordModal.js";
import "../css/Login.css";
import firebase from "../configs/firebaseConfig.js";
import { Redirect } from "react-router-dom";
import roles from "../roles/roles.js";
import rootsLogo from "../images/rootsLogo.jpg";
import background from "../images/splashPageBackground.jpg";

/* PROPS
    userInfo: user info pulled from firebase after logging in; if logged in, redirect to home page
*/

/* STATE
    loginInfo: object, has two fields based on user input; passed into Firebase Auth to login
      email: string
      password: string
    createAccountInfo: object, has the following fields based on user input; passed into Firebase Auth to create account
      email: string
      password: string
      firstName: string
      lastName: string
      location: string
      role: string
    isLoginVisible: boolean, controls whether the Login Modal is displayed or not
    isCreateAccountVisible: boolean, controls whether the Create Account Modal is displayed or not
    isResetPasswordVisible: boolean, controls whether the Reset Password Modal is displayed or not
*/

const blankLoginInfo = {
  email: "",
  password: ""
};

const blankCreateAccountInfo = {
  email: "",
  password: "",
  passwordRepeated: "",
  firstName: "",
  lastName: "",
  location: "",
  role: ""
};

// arrays for the dropdowns when creating an account
const locations = ["Charlottesville, VA", "Newark, DE"];

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoginVisible: false,
      isCreateAccountVisible: false,
      isResetPasswordVisible: false,
      loginInfo: blankLoginInfo,
      createAccountInfo: blankCreateAccountInfo,
      resetEmail: ""
    };
  }

  onClickLogin() {
    this.setState({
      ...this.state,
      isResetPasswordVisible: false,
      isCreateAccountVisible: false,
      isLoginVisible: true
    });
  }

  onClickCreateAccount() {
    this.setState({
      ...this.state,
      isResetPasswordVisible: false,
      isCreateAccountVisible: true,
      isLoginVisible: false
    });
  }

  onClickResetPassword() {
    this.setState({
      isResetPasswordVisible: true,
      isCreateAccountVisible: false,
      isLoginVisible: false
    });
  }

  onChangeEmailToReset(email) {
    this.setState({
      ...this.state,
      resetEmail: email
    });
  }

  closeModals() {
    this.setState({
      ...this.state,
      isCreateAccountVisible: false,
      isLoginVisible: false,
      isResetPasswordVisible: false
    });
  }

  onCancel() {
    console.log("Cancelled");
    this.setState({
      ...this.state,
      isCreateAccountVisible: false,
      isLoginVisible: false,
      loginInfo: blankLoginInfo,
      createAccountInfo: blankCreateAccountInfo
    });
  }

  onCreateAccountSubmit() {
    if (this.verifyInput()) {
      let email = this.state.createAccountInfo.email;
      let password = this.state.createAccountInfo.password;
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(user => {
          let uid = user.uid;
          let userInfo = this.state.createAccountInfo;
          userInfo.uid = uid;
          delete userInfo.password;
          delete userInfo.passwordRepeated;
          firebase.database().ref("users/unverified/" + uid).set(userInfo);
        })
        .then(response => {
          Modal.info({
            title: "Account Created.",
            content:
              "Please wait for an admin to verify your account before trying to log in.",
            okText: "Close"
          });
          firebase.auth().signOut();
        })
        .catch(function(error) {
          notification.error({
            title: "ERROR",
            description: error.message
          });
          console.log(error.message);
        });
      this.closeModals();
    }
  }

  onLoginSubmit() {
    let email = this.state.loginInfo.email;
    let password = this.state.loginInfo.password;
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(function() {
        window.location.href = "/home";
      })
      .catch(function(error) {
        notification.error({
          title: "ERROR",
          description: error.message
        });
        console.log(error.message);
      });
    this.closeModals();
  }

  onChange(value, field, loginOrCreate) {
    switch (loginOrCreate) {
      case "login":
        let loginInfo = this.state.loginInfo;
        loginInfo[field] = value;
        this.setState({
          ...this.state,
          loginInfo: loginInfo
        });
        break;
      case "create":
        let createInfo = this.state.createAccountInfo;
        createInfo[field] = value;
        this.setState({
          ...this.state,
          createAccountInfo: createInfo
        });
        break;
      default:
        console.log("ERROR");
    }
  }

  // verifies inputs for creating accounts.  checks all fields are filled in, the
  // passwords equal each other, and the password is at least six characters
  verifyInput() {
    let errors = [];
    Object.keys(this.state.createAccountInfo).map(field => {
      if (this.state.createAccountInfo[field] === "") {
        errors.push("The " + field + " field is empty.");
      }
    });

    // if no errors, return true
    if (
      errors.length === 0 &&
      this.state.createAccountInfo.password ===
        this.state.createAccountInfo.passwordRepeated &&
      this.state.createAccountInfo.password.length >= 6
    ) {
      return true;
    } else {
      // else, render notifications for each error and return false
      errors.map(error => {
        notification.error({
          message: "Missing Input",
          description: error
        });
      });
      if (
        this.state.createAccountInfo.password !==
        this.state.createAccountInfo.passwordRepeated
      ) {
        notification.error({
          message: "Passwords do not match.",
          description: "Please make sure the two passwords are matching."
        });
      }
      if (this.state.createAccountInfo.password.length < 6) {
        notification.error({
          message: "Password is too short.",
          description: "Your password must be at least six characters long."
        });
      }
      return false;
    }
  }

  render() {
    // if logged in, then redirect to home page
    if (this.props.userInfo) {
      return <Redirect to="/home" />;
    }

    console.log(this.state);
    return (
      <div
        className="LoginContainer"
        style={{
          width: "100%",
          height: "100%",
          backgroundImage: "url(" + background + ")",
          backgroundSize: "100% 100%"
        }}
      >
        <div className="LoginPage">
          <div className="rootsLogo">
            <img src={rootsLogo} alt="Roots Logo" height="80px" width="80px" />
            <div style={{ margin: "20px 0" }} />
          </div>
          <h1
            style={{
              color: "white"
            }}
          >
            {" "}ListTalk{" "}
          </h1>
          <div style={{ margin: "20px 0" }} />
          <Button.Group>
            <Button onClick={() => this.onClickCreateAccount()}>
              {" "}Create Account{" "}
            </Button>
            <Button type="primary" onClick={() => this.onClickLogin()}>
              {" "}Login{" "}
            </Button>
          </Button.Group>

          <p
            style={{ color: "white", cursor: "pointer" }}
            onClick={() => this.onClickResetPassword()}
          >
            {" "}Forgot your password?{" "}
          </p>

          <Modal
            title="Login"
            visible={this.state.isLoginVisible}
            onOk={() => this.onLoginSubmit()}
            onCancel={() => this.onCancel()}
            okText="Login"
            cancelText="Cancel"
          >
            <h3> Email: </h3>
            <Input
              onChange={e => this.onChange(e.target.value, "email", "login")}
            />

            <h3> Password: </h3>
            <Input
              type="password"
              onChange={e => this.onChange(e.target.value, "password", "login")}
            />
          </Modal>

          <Modal
            title="Create Account"
            visible={this.state.isCreateAccountVisible}
            onOk={() => this.onCreateAccountSubmit()}
            onCancel={() => this.onCancel()}
            okText="Create Account"
            cancelText="Cancel"
          >
            <h3> First Name </h3>
            <Input
              onChange={e =>
                this.onChange(e.target.value, "firstName", "create")}
              placeholder="First Name (max 100 characters)"
              maxLength={100}
            />

            <h3> Last Name </h3>
            <Input
              onChange={e =>
                this.onChange(e.target.value, "lastName", "create")}
              placeholder="Last Name (max 100 characters)"
              maxLength={100}
            />

            <h3> Email </h3>
            <Input
              onChange={e => this.onChange(e.target.value, "email", "create")}
              placeholder="Email (max 100 characters)"
              maxLength={100}
            />

            <h3> Password </h3>
            <Input
              type="password"
              onChange={e =>
                this.onChange(e.target.value, "password", "create")}
              placeholder="Password (between 6-100 characters)"
              maxLength={100}
            />

            <h3> Repeat Password </h3>
            <Input
              type="password"
              onChange={e =>
                this.onChange(e.target.value, "passwordRepeated", "create")}
              placeholder="Repeat Password (between 6-100 characters)"
              maxLength={100}
            />

            <h3> Location </h3>
            <DropdownSelection
              promptText="Select Location"
              selectedValue={this.state.createAccountInfo.location}
              dropdownValues={locations}
              onClickField={val => this.onChange(val, "location", "create")}
            />

            <h3> Roles </h3>
            <DropdownSelection
              promptText="Select Role"
              selectedValue={this.state.createAccountInfo.role}
              dropdownValues={roles}
              onClickField={val => this.onChange(val, "role", "create")}
            />
          </Modal>

          <ChangePasswordModal
            isVisible={this.state.isResetPasswordVisible}
            emailToReset={this.state.resetEmail}
            onChange={email => this.onChangeEmailToReset(email)}
            closeModal={() => this.closeModals()}
          />
        </div>
      </div>
    );
  }
}
