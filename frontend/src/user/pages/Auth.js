import React, { isValidElement } from "react";
import { useContext } from "react";
import { AuthContext } from "../../shared/context/auth-context";
import { useState } from "react";
import Card from "../../shared/components/UIElements/Card";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
import { useHttpClient } from "../../shared/hooks/http-hook";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form-hook";
import "./Auth.css";

const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  //Diabled in 155 video
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setIsError] = useState(false);
  const {isLoading, error, sendRequest, clearError} = useHttpClient();
  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const switchModeHandler = () => {
    //Update the form data when form mode is switched
    if (!isLogin) {
      //Currently in signup mode and going back to login mode

      setFormData(
        { ...formState.inputs, name: undefined,image:undefined },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      //Currently in signin and toggling to SignUp
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: "",
            isValid: false,
          },
           image: {
            value: null,
            isValid: false,
          },
        },
        false
      );
    }
    setIsLogin((prevMode) => !prevMode);
  };
  const authSubmitHandler = async (event) => {
    event.preventDefault();
    console.log(formState.inputs);
    if(isLogin){
      try{
      const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL+ '/users/login',
      'POST',
      JSON.stringify({
        email:formState.inputs.email.value,
        password: formState.inputs.password.value,
      }),
      {
      'Content-Type': 'application/json'
     },
  );
    auth.login(responseData.userId,responseData.token);
}
catch(error){}
      }

    else{
         try{
          const formData = new FormData();
          formData.append('name',formState.inputs.name.value);
          formData.append('email',formState.inputs.email.value);
          formData.append('password',formState.inputs.password.value);
          formData.append('image',formState.inputs.image.value);
      const responseData = await sendRequest(process.env.REACT_APP_BACKEND_URL + '/users/signup',
      'POST',
      formData
    //   JSON.stringify({
    //     name:formState.inputs.name.value,
    //     email:formState.inputs.email.value,
    //     password: formState.inputs.password.value,
    //     image: formState.inputs.image.value,
    //   }),
    //   {
    //   'Content-Type': 'application/json'
    //  },
  );
    auth.login(responseData.userId,responseData.token);
}
catch(error){}
    }
  };

 
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError}/>
    <Card className="authentication">
      {isLoading && <LoadingSpinner asOverlay/>}
      <h2>Login Required</h2>
      <hr />
      <form onSubmit={authSubmitHandler}>
        {!isLogin && (
          <Input
            element="input"
            id="name"
            type="text"
            label="Your Name"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a name."
            onInput={inputHandler}
          />
        )}
        {!isLogin && <ImageUpload center id="image" onInput={inputHandler}/>}
        <Input
          element="input"
          id="email"
          type="email"
          label="E-Mail"
          validators={[VALIDATOR_EMAIL()]}
          errorText="Please enter a valid email address."
          onInput={inputHandler}
        />
        <Input
          element="input"
          id="password"
          type="password"
          label="Password"
          validators={[VALIDATOR_MINLENGTH(6)]}
          errorText="Please enter a valid password, at least 5 characters."
          onInput={inputHandler}
        />
        <Button type="submit" disabled={!formState.isValid}>
          {isLogin ? "LOGIN" : "SIGNUP"}
        </Button>
      </form>
      <Button inverse onClick={switchModeHandler}>
        SWITCH TO {isLogin ? "SIGNUP" : "LOGIN"}
      </Button>
    </Card>
    </React.Fragment>
  );
};

export default Auth;
