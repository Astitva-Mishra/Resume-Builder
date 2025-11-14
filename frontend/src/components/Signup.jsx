import React, { useContext, useState } from 'react'
import { authStyles as styles } from '../assets/dummystyle'
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../utils/helper';
import axiosInstance from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import { Input } from './Inputs';


const Signup = ({setCurrentPage}) => {

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState(null);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();


  const handleSignup = async (e) => {
    e.preventDefault();
    if(!fullName){
      setError("Please enter your full name")
      return;
    }
    if(!validateEmail(email)){
      setError("Please enter a valid email address")
      return;
    }
    if(!password){
      setError("Please enter a password")
      return;
    }
    setError('');

    try{
        const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
            name: fullName,
            email,
            password
        });
        const {token} = response.data;
        if(token){
            localStorage.setItem('token', token);
            //Update user context
            updateUser(response.data);
            //Redirect to dashboard
            navigate('/dashboard');
        }
    }
    catch(error){
        setError(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <div className={styles.signupContainer}>
        <div className={styles.headerWrapper}>
            <h3 className={styles.signupTitle}>Create Account</h3>
            <p className={styles.signupSubtitle}>Join Thousands Of Professionals Today</p>
        </div>

        {/* SIGNUP FORM */}
        <form onSubmit={handleSignup} className={styles.signupForm}>
            <Input value={fullName} onChange={({target}) => setFullName(target.value)}
            label='Full Name'
            placeholder='John Doe'
                type='text'/>

            <Input value={email} onChange={({target}) => setEmail(target.value)}
            label='Email'
            placeholder='email@example.com'
                type='email'/>

            <Input value={password} onChange={({target}) => setPassword(target.value)}
            label='Password'
            placeholder='Min 8 Characters'
                type='password'/>

                {error && <div className={styles.errorMessage}>{error}</div>}
            <button type='submit' className={styles.signupSubmit}>Create Account</button>

            {/* FOOTER */}
            <p className={styles.switchText}>
                Already have an account?{' '}
                <button onClick={() => setCurrentPage('login')} type="button" className={styles.signupSwitchButton}>
                    Sign In
                </button>
            </p>
        </form>
    </div>
  )
}

export default Signup