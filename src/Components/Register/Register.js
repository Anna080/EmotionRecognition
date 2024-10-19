import React from "react";
import swal from "sweetalert";

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      name: "",
      isValid: false,
      errorMessage: "",
    };
  }

  // Fonction pour valider l'email
  validateEmail = (email) => {
    return email.includes("@gmail.com") || email.includes("@notse.com");
  };

  onEmailChange = (event) => {
    const email = event.target.value;
    const isValid = this.validateEmail(email);

    this.setState({ email, isValid });

    if (!isValid) {
      this.setState({
        errorMessage:
          "Only @gmail.com or @notse.com emails are allowed.",
      });
    } else {
      this.setState({ errorMessage: "" });
    }
  };

  onNameChange = (event) => {
    this.setState({ name: event.target.value });
  };

  onPasswordChange = (event) => {
    this.setState({ password: event.target.value });
  };

  onSubmitChange = (event) => {
    event.preventDefault(); // Empêche le rechargement de la page

    const { email, password, name, isValid } = this.state;

    if (isValid) {
      fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          name: name,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Failed to register. The email might already be in use."
            );
          }
          return response.json();
        })
        .then((data) => {
          if (data.id) {
            this.props.loadUser(data);
            this.props.homeScreen("home");
          }
        })
        .catch((error) => {
          swal({
            title: "Error",
            text: error.message,
            dangerMode: true,
            button: { text: "Ok" },
          });
        });
    } else {
      swal({
        title: "Error",
        text: this.state.errorMessage || "Please enter a valid email.",
        dangerMode: true,
        button: { text: "Ok" },
      });
    }
  };

  render() {
    const { homeScreen } = this.props;
    const { errorMessage } = this.state;

    return (
      <div className="container">
        <article className="white mv4 w-100 w-50-m w-25-l mw5 center shadow-5 cssSignin ">
          <main className="pa4 black-80">
            <div className="measure ">
              <fieldset id="sign_up" className="ba b--transparent ph0 mh0">
                <legend className="f2 white fw6 ph0 mh0">Register</legend>
                <div className="mt3">
                  <label
                    className="db white fw6 lh-copy f6"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input
                    onChange={this.onNameChange}
                    className="pa2 input-reset cssBorder bg-transparent hover-white w-100"
                    type="text"
                    name="name"
                    id="name"
                    required
                  />
                </div>
                <div className="mt3">
                  <label
                    className="db white fw6 lh-copy f6"
                    htmlFor="email-address"
                  >
                    Email
                  </label>
                  <input
                    onChange={this.onEmailChange}
                    className="pa2 input-reset cssBorder bg-transparent hover-white w-100"
                    type="email"
                    name="email-address"
                    id="email-address"
                    required
                  />
                  {errorMessage && <p className="red">{errorMessage}</p>}
                </div>
                <div className="mv3">
                  <label
                    className="db white fw6 lh-copy f6"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <input
                    onChange={this.onPasswordChange}
                    className="b pa2 input-reset cssBorder bg-transparent hover-white w-100"
                    type="password"
                    name="password"
                    id="password"
                    required
                  />
                </div>
              </fieldset>
              <div>
                <input
                  className="b ph3 pv2 white input-reset ba b--white bg-transparent grow pointer f6 dib"
                  type="submit"
                  value="Register"
                  onClick={this.onSubmitChange}
                />
              </div>
            </div>
          </main>
        </article>
      </div>
    );
  }
}

export default Register;