import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { defaultDashboardPath } from '../utils/auth';


export default function LoginPage() {

  const navigate = useNavigate();

  const location = useLocation();

  const [username, setUsername] = React.useState('admin');

  const [password, setPassword] = React.useState('password');

  const [error, setError] = React.useState('');

  const [loading, setLoading] = React.useState(false);

  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({

    email: "",

    password: ""

  });



  useEffect(() => {

    // Check if we have OAuth callback in URL

    const urlParams = new URLSearchParams(window.location.search);

    const error = urlParams.get('error');

    

    if (error) {

      setError("Login failed: " + error);

    }

  }, []);



  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData(prev => ({

      ...prev,

      [name]: value

    }));

  };



  const handleEmailLogin = async (e) => {

  e.preventDefault();

  setLoading(true);

  setError("");



  try {

    const response = await fetch('http://localhost:8083/auth/login', {

      method: 'POST',

      headers: {

        'Content-Type': 'application/json',

      },

      body: JSON.stringify({

        email: formData.email,

        password: formData.password

      })

    });



    const data = await response.json();



    if (data.error) {

      setError(data.error);

    } else {



      // ✅ Save JWT token

      localStorage.setItem("sc_token", data.token);



      // save user (optional)

      localStorage.setItem("sc_user", JSON.stringify(data.user));



      // redirect to appropriate dashboard based on role

      window.location.href = defaultDashboardPath();

    }



  } catch (err) {

    setError("Login failed. Please try again.");

  } finally {

    setLoading(false);

  }

};



  const handleGoogleLogin = () => {

    // Redirect to backend OAuth endpoint

    window.location.href = "http://localhost:8083/oauth2/authorization/google";

  };



  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">

      <div className="w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl bg-white">

        <div className="flex">

          {/* Left side - Marketing content */}

          <div className="w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 text-white p-8 flex flex-col justify-between">

        <div>

          {/* Academic year badge */}

          <div className="inline-flex items-center gap-2 bg-green-500/20 rounded-full px-3 py-1 mb-8">

            <div className="w-2 h-2 bg-green-400 rounded-full"></div>

            <span className="text-sm text-green-300">ACADEMIC YEAR 2025-26</span>

          </div>

          

          {/* Main title */}

          <h1 className="text-5xl font-serif mb-6 leading-tight">

            Your campus, <span className="text-purple-300">reimagined</span> for the digital age.

          </h1>

          

          {/* Description paragraph */}

          <p className="text-gray-300 text-lg mb-12 max-w-lg">

            Manage courses, connect with peers, and track your progress - all in one place designed for how students actually work.

          </p>

        </div>

        

        {/* Statistics */}

        <div className="grid grid-cols-3 gap-8">

          <div className="text-center">

            <div className="text-4xl font-bold text-white">12k+</div>

            <div className="text-gray-400 mt-2 text-sm">Students enrolled</div>

          </div>

          

          <div className="text-center">

            <div className="text-4xl font-bold text-white">340</div>

            <div className="text-gray-400 mt-2 text-sm">Active courses</div>

          </div>

          

          <div className="text-center">

            <div className="text-4xl font-bold text-white">98%</div>

            <div className="text-gray-400 mt-2 text-sm">Satisfaction rate</div>

          </div>

        </div>

      </div>



      {/* Right side - Login form */}

      <div className="w-1/2 bg-white flex flex-col justify-center items-center p-12">

        <div className="w-full max-w-md">

          <div className="text-center mb-8">

            <h1 className="text-3xl font-bold text-gray-800 mb-2">SmartUni Hub</h1>

            <p className="text-gray-600">Welcome back! Please login to continue</p>

          </div>



          {error && (

            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">

              <p className="text-red-600 text-sm">{error}</p>

            </div>

          )}



          {user && (

            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">

              <p className="text-green-600 text-sm">Login successful! Redirecting...</p>

            </div>

          )}



          <form onSubmit={handleEmailLogin} className="space-y-6" autoComplete="off" spellCheck="false">

            <div>

              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">

                Email Address

              </label>

              <input

                id="email"

                name="email"

                type="email"

                value={formData.email}

                onChange={handleChange}

                placeholder="Enter your email"

                autoComplete="off"

                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"

                required

              />

            </div>



            <div>

              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">

                Password

              </label>

              <input

                id="password"

                name="password"

                type="password"

                value={formData.password}

                onChange={handleChange}

                placeholder="Enter your password"

                autoComplete="new-password"

                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-400"

                required

              />

            </div>



            <div className="flex items-center justify-between">

              <label className="flex items-center cursor-pointer">

                <input

                  type="checkbox"

                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"

                />

                <span className="ml-2 text-sm text-gray-600">Remember me</span>

              </label>

              <a href="#forgot" className="text-sm text-purple-600 hover:text-purple-700 transition-colors duration-200">

                Forgot password?

              </a>

            </div>



            <button 

              type="submit"

              disabled={loading}

              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"

            >

              {loading ? 'Signing in...' : 'Sign in'}

            </button>

          </form>



          <div className="flex items-center my-6">

            <hr className="flex-grow border-gray-300" />

            <span className="px-3 text-gray-400 text-sm">OR</span>

            <hr className="flex-grow border-gray-300" />

          </div>



          <button

            onClick={handleGoogleLogin}

            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition duration-300"

          >

            <FcGoogle size={22} />

            <span className="text-gray-700 font-medium">Sign in with Google</span>

          </button>



          <p className="text-center text-sm text-gray-500 mt-8">

            Don't have an account? <a href="/signup" className="text-purple-600 hover:text-purple-700 font-medium">Create one</a>

          </p>

        </div>

      </div>

        </div>

      </div>

    </div>

  );



}

