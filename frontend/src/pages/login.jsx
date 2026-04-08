import React from "react";

import { FcGoogle } from "react-icons/fc";



export default function LoginPage() {

  const handleGoogleLogin = () => {

    // Redirect to backend OAuth endpoint

    window.location.href = "http://localhost:8080/oauth2/authorization/google";

  };



  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">

      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md">

        <div className="text-center mb-6">

          <h1 className="text-3xl font-bold text-gray-800">SmartUni Hub</h1>

          <p className="text-gray-500 mt-2">Welcome back! Please login to continue</p>

        </div>



        <div className="space-y-4">

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
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

          <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Login
          </button>
        </div>



        <div className="flex items-center my-6">

          <hr className="flex-grow border-gray-300" />

          <span className="px-3 text-gray-400 text-sm">OR</span>

          <hr className="flex-grow border-gray-300" />

        </div>



        <button

          onClick={handleGoogleLogin}

          className="w-full flex items-center justify-center gap-3 border py-2 rounded-lg hover:bg-gray-100 transition duration-300"

        >

          <FcGoogle size={22} />

          <span className="text-gray-700 font-medium">Sign in with Google</span>

        </button>



        <p className="text-center text-sm text-gray-500 mt-6">

          Don’t have an account? <span className="text-purple-600 cursor-pointer">Sign up</span>

        </p>

      </div>

    </div>

  );

}

