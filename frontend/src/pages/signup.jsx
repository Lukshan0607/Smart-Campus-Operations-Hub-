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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async () => {

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setError("");
    setSuccess("");

    try {
      console.log('Sending signup request:', {
        name: form.name,
        email: form.email,
        phone: form.phone
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
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
/>

<input
type="email"
name="email"
placeholder="Email Address"
value={form.email}
onChange={handleChange}
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
/>

<input
type="tel"
name="phone"
placeholder="Phone Number"
value={form.phone}
onChange={handleChange}
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
/>

<input
type="password"
name="password"
placeholder="Password"
value={form.password}
onChange={handleChange}
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
/>

<input
type="password"
name="confirmPassword"
placeholder="Confirm Password"
value={form.confirmPassword}
onChange={handleChange}
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
/>

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