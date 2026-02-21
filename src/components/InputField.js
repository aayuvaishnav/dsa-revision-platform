import {useState} from 'react';

const InputField = ({type, placeholder, icon, onChange}) => {
    const[isPasswordShown, setIsPasswordShown] =useState(false);
  return (
    <div className='input-wrapper'>
    <input type={isPasswordShown ? 'text' : type}
     placeholder={placeholder}
      className='input-field' required
      onChange={onChange}
      />
    <i class="material-symbols-rounded">{icon}</i>
    {type === 'password' && (
        <i onClick={()=> setIsPasswordShown(prevState =>!prevState)} class="material-symbols-rounded eye-icon">
            
            {isPasswordShown ? 'visibility' : 'visibility_off'}
        </i>
    )}
  </div>
  )
}

export default InputField;
