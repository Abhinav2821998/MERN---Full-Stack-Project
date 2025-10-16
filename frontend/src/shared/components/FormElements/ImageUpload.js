// ImageUpload.js
import Button from "./Button";
import "./ImageUpload.css";
import { useRef, useState, useEffect } from "react";

const ImageUpload = (props) => {
  const filePickRef = useRef();
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [valid, setIsValid] = useState(false);

  useEffect(() => {
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickImagehandler = () => {
    filePickRef.current.click();
  };

  const fileHandler = (event) => {
    // debug
    console.log("file input event:", event.target.files);

    let pickedFile = null;
    let fileIsValid = false;

    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;
      // IMPORTANT: inform parent immediately
      console.log("calling onInput with file:", pickedFile);
      props.onInput(props.id, pickedFile, fileIsValid);
    } else {
      setIsValid(false);
      fileIsValid = false;
      console.log("no file or multiple files picked");
      props.onInput(props.id, null, fileIsValid);
    }
  };

  return (
    <div className="form-control">
      <input
        id={props.id}
        style={{ display: "none" }}
        type="file"
        ref={filePickRef}
        accept=".jpg,.png,.jpeg"
        onChange={fileHandler}
      />
      <div className={`image-upload ${props.center && "center"}`}>
        <div className="image-upload__preview">
          {previewUrl && <img src={previewUrl} alt="Preview" />}
          {!previewUrl && <p>Please pick an image.</p>}
        </div>
        <Button type="button" onClick={pickImagehandler}>
          PICK IMAGE
        </Button>
      </div>
      {!valid && <p>{props.errorText}</p>}
    </div>
  );
};

export default ImageUpload;
