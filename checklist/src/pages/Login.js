import React, { Component } from "react";
import { Button, Modal, Input, notification } from "antd";
import DropdownSelection from "../components/DropdownSelection.js";
import "../css/Login.css";
import firebase from "../configs/firebaseConfig.js";

let auth = firebase.auth();
auth.onAuthStateChanged(function(user) {
  if (user) {
    console.log(user);
  } else {
    console.log("No user");
  }
});

/* PROPS
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
const locations = ["Charlottesville", "Newark"];
const roles = [
  "GM",
  "Assistant GM",
  "Kitchen Manager",
  "Shift Manager",
  "Grill",
  "Prep",
  "Line",
  "Dish"
];

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoginVisible: false,
      isCreateAccountVisible: false,
      loginInfo: blankLoginInfo,
      createAccountInfo: blankCreateAccountInfo
    };
  }

  onClickLogin() {
    this.setState({
      ...this.state,
      isCreateAccountVisible: false,
      isLoginVisible: true
    });
  }

  onClickCreateAccount() {
    this.setState({
      ...this.state,
      isCreateAccountVisible: true,
      isLoginVisible: false
    });
  }

  closeModals() {
    this.setState({
      ...this.state,
      isCreateAccountVisible: false,
      isLoginVisible: false
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
          delete userInfo.password;
          delete userInfo.passwordRepeated;
          firebase.database().ref("users/unverified/" + uid).set(userInfo);
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
    return (
      <div className="LoginPage">
        <h1> SOFTROOTS </h1>
        <h3> Checklists For Dayz </h3>
        <Button.Group>
          <Button onClick={() => this.onClickCreateAccount()}>
            {" "}Create Account{" "}
          </Button>
          <Button onClick={() => this.onClickLogin()}> Login </Button>
        </Button.Group>

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
            onChange={e => this.onChange(e.target.value, "firstName", "create")}
          />

          <h3> Last Name </h3>
          <Input
            onChange={e => this.onChange(e.target.value, "lastName", "create")}
          />

          <h3> Email </h3>
          <Input
            onChange={e => this.onChange(e.target.value, "email", "create")}
          />

          <h3> Password </h3>
          <Input
            type="password"
            onChange={e => this.onChange(e.target.value, "password", "create")}
          />

          <h3> Repeat Password </h3>
          <Input
            type="password"
            onChange={e =>
              this.onChange(e.target.value, "passwordRepeated", "create")}
          />

          <h3> Location </h3>
          <DropdownSelection
            defaultText="Select Location"
            dropdownValues={locations}
            onClickField={val => this.onChange(val, "location", "create")}
          />

          <h3> Roles </h3>
          <DropdownSelection
            defaultText="Select Role"
            dropdownValues={roles}
            onClickField={val => this.onChange(val, "role", "create")}
          />
        </Modal>
      </div>
    );
  }
}