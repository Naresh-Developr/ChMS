import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import HouseOfGodImage from "../assets/house-of-god-2k.webp";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/index";
import type { SignInRequest } from "~/interfaces/auth.interface";
import logo from "../assets/csi-sirumugai-logo.png";
import { signIn } from "~/features/auth/authSlice";
import Toast2 from "~/components/Toast2";
// import AuthDecoration from "../images/auth-decoration.png";

function Signin() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<SignInRequest>({
    email: "",
    password: "",
  });

  const [toast, setToast] = useState<{
    open: boolean;
    type?: "error" | "success" | "warning" | undefined;
    message: string;
  }>({
    open: false,
    message: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // Expanding handle submit to use .unwrap()
  // This would help us react based on response returned
  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    try {
      await dispatch(signIn(formData)).unwrap();
      setToast({
        open: true,
        type: "success",
        message: "Signed in successfully!",
      });
      setTimeout(() => {
        navigate("/");
        setFormData({ email: "", password: "" });
      }, 3000);
    } catch (error: any) {
      if (error.status == 401) {
        setToast({
          open: true,
          type: "error",
          message: "Invalid credentials!",
        });
      } else if (error.status == 403) {
        setToast({
          open: true,
          type: "error",
          message: "Account not activated!",
        });
      } else {
        setToast({
          open: true,
          type: "error",
          message: "Server down!",
        });
      }
    }
  };

  return (
    <main className="bg-white">
      <div className="relative md:flex">
        {/* Content */}
        <div className="md:w-1/2">
          <div className="min-h-screen h-full flex flex-col after:flex-1">
            {/* Header */}
            <div className="flex-1">
              <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link className="block" to="/">
                  <img width="50" height="50" src={logo} alt="CSI-Immanuel-Church-Sirumugai-Logo"></img>
                </Link>
              </div>
              <Toast2
                open={toast.open}
                type={toast.type}
                children={toast.message}
                setOpen={(val) => setToast((prev) => ({ ...prev, open: val }))}
                className={"w-96 max-w-sm mx-auto px-8 py-8"}
              ></Toast2>
            </div>

            <div className="w-96 max-w-sm mx-auto px-4 py-8">
              <h1 className="text-3xl text-gray-800 font-bold mb-6">Welcome back!</h1>
              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      id="email"
                      className="form-input w-full"
                      type="email"
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="password">
                      Password
                    </label>
                    <input
                      id="password"
                      required
                      className="form-input w-full"
                      type="password"
                      autoComplete="on"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <div className="mr-1">
                    <Link className="text-sm underline hover:no-underline" to="/reset-password">
                      Forgot Password?
                    </Link>
                  </div>
                  <button
                    className="btn bg-indigo-500 hover:bg-indigo-600 text-white ml-3 disabled"
                    disabled={loading}
                    type="submit"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>
                </div>
              </form>
              {/* Footer */}
              <div className="pt-5 mt-6 border-t border-gray-200">
                <div className="text-sm">
                  Don’t you have an account?{" "}
                  <Link className="font-medium text-indigo-500 hover:text-indigo-600" to="/signup">
                    Sign Up
                  </Link>
                </div>
                {/* Warning */}
              </div>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="hidden md:block absolute top-0 bottom-0 right-0 md:w-1/2" aria-hidden="true">
          <img
            className="object-cover object-center w-full h-full"
            src={HouseOfGodImage}
            width="760"
            height="1024"
            alt="Authentication"
          />
          {/* <img
            className="absolute top-1/4 left-0 transform -translate-x-1/2 ml-8 hidden lg:block"
            src={}
            width="218"
            height="224"
            alt="Authentication decoration"
          /> */}
        </div>
      </div>
    </main>
  );
}

export default Signin;
