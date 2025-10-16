import { useState, useCallback,useRef } from "react";
import { useEffect } from "react";
export const useHttpClient = () =>{
     const [isLoading, setIsLoading] = useState(false);
    const [error, setIsError] = useState(false);

    const activeHttpRequests = useRef([]);
    const sendRequest = useCallback(async (url, method='GET',body=null,headers={})=>{
      setIsLoading(true);
      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);
        try{
            const response = await fetch(url,{
            method,
            body,
            headers,
            //Linking AbortController to this request
            signal:httpAbortCtrl.signal
        });
         const responseData = await response.json();
         activeHttpRequests.current = activeHttpRequests.current.filter(
          reqCtrl => reqCtrl !== httpAbortCtrl
         )
    if(!response.ok){
      throw new Error(responseData.message);
    }
    setIsLoading(false);
    return responseData;
  }
    
    catch(error){
      setIsLoading(false);
      setIsError(error.message);
      throw error;
    }
    
    },[]);

    const clearError = () =>{
      setIsError(null);
    }
    useEffect(()=>{
      return ()=>{
        activeHttpRequests.current.forEach(abortCtrl=>abortCtrl.abort());
      }
    },[])
    return {isLoading, error, sendRequest, clearError};
}