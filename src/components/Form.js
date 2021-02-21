import "./Form.scss";
import {ArrowRight} from '../icons'
import {useState, useCallback, useRef} from 'react'

function Form({placeholder, onSubmit, invalid}) {
  console.log('render form')
  const ref = useRef()

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault()      
      if(ref.current && ref.current.value){
        onSubmit(ref.current.value)
      }
    },
    []
  )

  return (
    <form className={`form${invalid ? ' form--invalid' : ''}`} onSubmit={handleSubmit}>
      <input type="text" ref={ref}  aria-label={placeholder} placeholder={placeholder} />
      <button type="submit" aria-label="Submit">
        {ArrowRight}
      </button>
    </form>
  );
}
export default Form;
