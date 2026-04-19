import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function SignupPage() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    setError("");
    
    switch (name) {
      case 'name':
        const filteredValue = value.replace(/[^a-zA-Z\s]/g, '');
        setForm({ ...form, name: filteredValue });
        setNameError("");
        break;
        
      case 'email':
        const emailFilteredValue = value.replace(/[A-Z\s]/g, '');
        setForm({ ...form, email: emailFilteredValue });
        setEmailError("");
        
        // Validate email format
        if (emailFilteredValue && !emailFilteredValue.endsWith('@gmail.com')) {
          setEmailError('Email must end with @gmail.com');
        }
        break;
        
      case 'phone':
        let phoneValue = value;
        // Remove any non-digit characters
        const digitsOnly = phoneValue.replace(/\D/g, '');
        
        // If empty, set to empty
        if (digitsOnly === '') {
          setForm({ ...form, phone: '' });
          setPhoneError("");
          return;
        }
        
        // If first digit is not 0 and it's the first character, don't allow it
        if (digitsOnly.length === 1 && digitsOnly !== '0') {
          setPhoneError('Phone number must start with 0');
          return;
        }
        
        // If first digit is not 0 and we have multiple digits, fix it
        if (digitsOnly.length > 1 && digitsOnly[0] !== '0') {
          setPhoneError('Phone number must start with 0');
          return;
        }
        
        // Limit to 10 digits
        const limitedValue = digitsOnly.slice(0, 10);
        
        setForm({ ...form, phone: limitedValue });
        setPhoneError("");
        
        if (limitedValue.length < 10) {
          setPhoneError('Phone number must be 10 digits');
        }
        break;
        
      case 'password':
        setForm({ ...form, password: value });
        setPasswordError("");
        
        // Check password strength
        if (value && value.length < 6) {
          setPasswordError('Password must be at least 6 characters');
        }
        break;
        
      case 'confirmPassword':
        setForm({ ...form, confirmPassword: value });
        setPasswordError("");
        
        // Check if passwords match
        if (value && form.password && value !== form.password) {
          setPasswordError('Passwords do not match');
        }
        break;
        
      default:
        setForm({ ...form, [name]: value });
    }
  };

  const validateForm = () => {
    let isValid = true;
    
    // Validate name
    if (!form.name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else if (form.name.length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    }
    
    // Validate email
    if (!form.email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!form.email.endsWith('@gmail.com')) {
      setEmailError('Email must end with @gmail.com');
      isValid = false;
    } else if (!form.email.includes('@')) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }
    
    // Validate phone
    if (!form.phone.trim()) {
      setPhoneError('Phone number is required');
      isValid = false;
    } else if (form.phone.length !== 10) {
      setPhoneError('Phone number must be 10 digits');
      isValid = false;
    } else if (!form.phone.startsWith('0')) {
      setPhoneError('Phone number must start with 0');
      isValid = false;
    }
    
    // Validate password
    if (!form.password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (form.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    // Validate confirm password
    if (!form.confirmPassword.trim()) {
      setPasswordError('Please confirm your password');
      isValid = false;
    } else if (form.password !== form.confirmPassword) {
      setPasswordError('Passwords do not match');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSignup = async () => {
    // Clear previous errors
    setError("");
    setNameError("");
    setEmailError("");
    setPhoneError("");
    setPasswordError("");
    
    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }

    setSuccess("");

    try {
      console.log('Sending signup request:', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password
      });

      const response = await fetch("http://localhost:8083/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        })
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (data.error) {
        setError(data.error);
      } else {
        setSuccess("Account created successfully!");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      }

    } catch (err) {
      console.error('Signup error:', err);
      setError("Network error. Please check if backend is running on http://localhost:8083");
    }

  };

  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:8083/oauth2/authorization/google";
  };

  return (

<div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">

<div className="w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl bg-white">

<div className="flex">

{/* LEFT SIDE */}

<div className="w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 text-white p-8 flex flex-col justify-between">

<div>

<div className="inline-flex items-center gap-2 bg-green-500/20 rounded-full px-3 py-1 mb-8">
<div className="w-2 h-2 bg-green-400 rounded-full"></div>
<span className="text-sm text-green-300">SMART CAMPUS PLATFORM</span>
</div>

<h1 className="text-5xl font-serif mb-6 leading-tight">
Join the <span className="text-purple-300">future</span> of campus management
</h1>

<p className="text-gray-300 text-lg mb-12 max-w-lg">
Book resources, manage incidents, and stay connected with your university ecosystem.
</p>

</div>

<div className="grid grid-cols-3 gap-8">

<div className="text-center">
<div className="text-4xl font-bold">12k+</div>
<div className="text-gray-400 text-sm">Students</div>
</div>

<div className="text-center">
<div className="text-4xl font-bold">340</div>
<div className="text-gray-400 text-sm">Resources</div>
</div>

<div className="text-center">
<div className="text-4xl font-bold">24/7</div>
<div className="text-gray-400 text-sm">Support</div>
</div>

</div>

</div>


{/* RIGHT SIDE */}

<div className="w-1/2 bg-white flex flex-col justify-center items-center p-12">

<div className="w-full max-w-md">

<div className="text-center mb-8">
<h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
<p className="text-gray-600">Sign up to start using SmartUni Hub</p>
</div>

{error && (
<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
{error}
</div>
)}

{success && (
<div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
{success}
</div>
)}

<div className="space-y-5">

<input
type="text"
name="name"
placeholder="Full Name"
value={form.name}
onChange={handleChange}
className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
  nameError ? 'border-red-500 bg-red-50' : 'border-gray-300'
}`}
/>
{nameError && (
  <p className="mt-1 text-red-500 text-sm">{nameError}</p>
)}

<input
type="email"
name="email"
placeholder="Email Address (must end with @gmail.com)"
value={form.email}
onChange={handleChange}
className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
  emailError ? 'border-red-500 bg-red-50' : 'border-gray-300'
}`}
/>
{emailError && (
  <p className="mt-1 text-red-500 text-sm">{emailError}</p>
)}

<input
type="tel"
name="phone"
placeholder="Phone Number (10 digits, starting with 0)"
value={form.phone}
onChange={handleChange}
className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
  phoneError ? 'border-red-500 bg-red-50' : 'border-gray-300'
}`}
maxLength="10"
/>
{phoneError && (
  <p className="mt-1 text-red-500 text-sm">{phoneError}</p>
)}

<input
type="password"
name="password"
placeholder="Password (min 6 characters)"
value={form.password}
onChange={handleChange}
className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
  passwordError ? 'border-red-500 bg-red-50' : 'border-gray-300'
}`}
/>
{passwordError && passwordError.includes('Password') && (
  <p className="mt-1 text-red-500 text-sm">{passwordError}</p>
)}

<input
type="password"
name="confirmPassword"
placeholder="Confirm Password"
value={form.confirmPassword}
onChange={handleChange}
className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none ${
  passwordError && !passwordError.includes('Password') ? 'border-red-500 bg-red-50' : 'border-gray-300'
}`}
/>
{passwordError && passwordError.includes('match') && (
  <p className="mt-1 text-red-500 text-sm">{passwordError}</p>
)}

<button
onClick={handleSignup}
className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-medium"
>
Create Account
</button>

</div>

<div className="flex items-center my-6">
<hr className="flex-grow border-gray-300"/>
<span className="px-3 text-gray-400 text-sm">OR</span>
<hr className="flex-grow border-gray-300"/>
</div>

<button
onClick={handleGoogleSignup}
className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-lg hover:bg-gray-50"
>
<FcGoogle size={22}/>
<span className="text-gray-700 font-medium">Sign up with Google</span>
</button>

<p className="text-center text-sm text-gray-500 mt-8">
Already have an account?{" "}
<a href="/login" className="text-purple-600 font-medium">
Login
</a>
</p>

</div>

</div>

</div>

</div>

</div>

  );
}