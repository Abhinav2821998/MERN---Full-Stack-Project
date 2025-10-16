// import React from "react";
// import Input from "../../shared/components/FormElements/Input";
// import Button from "../../shared/components/FormElements/Button";
// import "./NewPlace.css";
// import {
//   VALIDATOR_REQUIRE,
//   VALIDATOR_MINLENGTH,
// } from "../../shared/util/validators";
// import { useForm } from "../../shared/hooks/form-hook";
// // const formReducer = (state, action) => {
// //   switch (action.type) {
// //     case "INPUT_CHANGE":
// //       let formIsValid = true;
// //       for (const inputId in state.inputs) {
// //         if (inputId === action.inputId) {
// //           formIsValid = formIsValid && action.isValid;
// //         } else {
// //           formIsValid = formIsValid && state.inputs[inputId].isValid;
// //         }
// //       }
// //       return {
// //         ...state,
// //         inputs: {
// //           ...state.inputs,
// //           [action.inputId]: { value: action.value, isValid: action.isValid },
// //         },
// //         isValid: formIsValid,
// //       };
// //     default:
// //       return state;
// //   }
// // };
// const NewPlace = () => {
//   // const [formaState, dispatch] = useReducer(formReducer, {
//   //   inputs: {
//   //     title: {
//   //       value: "",
//   //       isValid: false,
//   //     },
//   //     description: {
//   //       value: "",
//   //       isValid: false,
//   //     },
//   //   },
//   //   isValid: false,
//   // });
//   const [formaState, inputHandler] = useForm(
//     {
//       title: {
//         value: "",
//         isValid: false,
//       },
//       description: {
//         value: "",
//         isValid: false,
//       },
//       address: {
//         value: "",
//         isValid: false,
//       }
//     },
//     false
//   );
//   // const inputHandler = useCallback((id, value, isValid) => {
//   //   dispatch({
//   //     type: "INPUT_CHANGE",
//   //     value: value,
//   //     isValid: isValid,
//   //     inputId: id,
//   //   });
//   // }, []);
//   // const descriptionInputHandler = useCallback((id, value, isValid) => {}, []);
//   const placeSubmitHandler = (event) => {
//     event.preventDefault();
//     console.log(formaState.inputs);
//   };
//   return (
//     <form className="place-form" onSubmit={placeSubmitHandler}>
//       <Input
//         id="title"
//         element="input"
//         type="text"
//         label="Title"
//         validators={[VALIDATOR_REQUIRE()]}
//         onInput={inputHandler}
//         errorText="Please enter a valid title"
//       ></Input>
//       <Input
//         id="description"
//         element="textarea"
//         type="text"
//         label="Description"
//         validators={[VALIDATOR_MINLENGTH(5)]}
//         onInput={inputHandler}
//         errorText="Please enter a valid description"
//       ></Input>
//       <Input
//         id="address"
//         element="textarea"
//         type="text"
//         label="Address"
//         validators={[VALIDATOR_REQUIRE()]}
//         onInput={inputHandler}
//         errorText="Please enter a valid description"
//       ></Input>
//       <Button type="submit" disabled={!formaState.isValid}>
//         ADD PLACE
//       </Button>
//     </form>
//   );
// };

// export default NewPlace;
import React from 'react';
import { useContext } from 'react';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import { useNavigate } from 'react-router-dom';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import './NewPlace.css';
import { useHttpClient } from "../../shared/hooks/http-hook";
import {AuthContext} from "../../shared/context/auth-context";
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';
const NewPlace = () => {
  //Setting up listener to auth context.
  const auth = useContext(AuthContext);
  const {isLoading, error, sendRequest, clearError} = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      title: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      },
      address: {
        value: '',
        isValid: false
      },
      image: {
        value: '',
        isValid: false
      }
    },
    false
  );
  
  const navigate = useNavigate();
  const placeSubmitHandler = async  event => {
    event.preventDefault();
    // console.log(formState.inputs); // send this to the backend!
    try{
       const formData = new FormData();
          formData.append('title',formState.inputs.title.value);
          formData.append('description',formState.inputs.description.value);
          formData.append('address',formState.inputs.address.value);
          formData.append('creator',auth.userId);
          formData.append('image',formState.inputs.image.value);
      await sendRequest(process.env.REACT_APP_BACKEND_URL +'/places',
      'POST',formData,
      {
        Authorization: 'Bearer ' + auth.token
      }
    //   JSON.stringify({
    //     title:formState.inputs.title.value,
    //     description: formState.inputs.description.value,
    //     address: formState.inputs.address.value,
    //     creator: auth.userId,
    //   }),
    //   {
    //   'Content-Type': 'application/json'
    //  },

     //After sendinng place, we needc to redirect the user to different page
    //  navigate('/')
  );
    }catch(error){/*No need to do anytthing inside success case as we have managed it inside custom hook.*/}
  };

  return (
    <React.Fragment>
    <ErrorModal error={error} onClear={clearError}/>
    <form className="place-form" onSubmit={placeSubmitHandler}>
      {isLoading && 
       <LoadingSpinner asOverlay/>
    }
      <Input
        id="title"
        element="input"
        type="text"
        label="Title"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid title."
        onInput={inputHandler}
      />
      <Input
        id="description"
        element="textarea"
        label="Description"
        validators={[VALIDATOR_MINLENGTH(5)]}
        errorText="Please enter a valid description (at least 5 characters)."
        onInput={inputHandler}
      />
      <Input
        id="address"
        element="input"
        label="Address"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid address."
        onInput={inputHandler}
      />
      <ImageUpload center id="image" onInput={inputHandler} errorText="Please provide an image"/>
      <Button type="submit" disabled={!formState.isValid}>
        ADD PLACE
      </Button>
    </form>
    </React.Fragment>
  );
};

export default NewPlace;
