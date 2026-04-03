import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/index";
import { signUp } from "../features/auth/authSlice";
import HouseOfGodImage from "../assets/house-of-god-2k.webp";
import type { SignUpRequest } from "~/interfaces/auth.interface";
import logo from "../assets/csi-sirumugai-logo.png";
import Toast2 from "~/components/Toast2";
import Banner2 from "~/components/Banner2";
// import AuthDecoration from "../images/auth-decoration.png";

function Signup() {
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<SignUpRequest>({
    name: "",
    email: "",
    role: "user",
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

  const [banner, setBanner] = useState<{
    open: boolean;
    type?: "error" | "success" | "warning" | undefined;
    message: string;
  }>({
    open: false,
    message: "",
  });

  const isPasswordStrong = (password: string): boolean => {
    return PASSWORD_REGEX.test(password);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!isPasswordStrong(formData.password)) {
      setBanner({
        open: true,
        type: "error",
        message:
          "Password must be at least 8 characters and include: uppercase, lowercase, number, and special character (@$!%*?&)",
      });
      return;
    }

    try {
      await dispatch(signUp(formData)).unwrap();
      // TODO: Pop a toast and redirect
    } catch (error) {
      // TODO: Pop a relevant toast for error
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
              <Banner2
                open={banner.open}
                type={banner.type}
                children={banner.message}
                setOpen={(val) => setBanner((prev) => ({ ...prev, open: val }))}
                className="px-8 py-8"
              ></Banner2>
            </div>

            <div className="w-96 max-w-sm mx-auto px-4 py-8">
              <h1 className="text-3xl text-gray-800 font-bold mb-6">Create your family account</h1>
              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      className="form-input w-full"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      className="form-input w-full"
                      type="text"
                      value={formData.name}
                      required
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="role">
                      Your Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      className="form-select w-full"
                      value={formData.role}
                      required
                      onChange={handleInputChange}
                    >
                      <option value={"user"}>Member</option>
                      <option value={"admin"}>Management</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="password">
                      Password
                    </label>
                    <input
                      id="password"
                      className="form-input w-full"
                      type="password"
                      autoComplete="on"
                      minLength={8}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-6">
                  {/* <div className="mr-1">
                    <label className="flex items-center">
                      <input type="checkbox" className="form-checkbox" />
                      <span className="text-sm ml-2">
                        Email me about product news.
                      </span>
                    </label>
                  </div> */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn bg-indigo-500 hover:bg-indigo-600 text-white whitespace-nowrap"
                    >
                      {loading ? "Signing Up..." : "Sign Up"}
                    </button>

                    <div
                      className={`overflow-hidden transition-all duration-300 ease-out ${
                        formData.role === "admin"
                          ? "opacity-100 translate-y-0 max-h-32 mt-5"
                          : "opacity-0 -translate-y-2 max-h-0"
                      }`}
                    >
                      <div className="bg-yellow-100 text-yellow-600 px-3 py-2 rounded">
                        <span className="text-sm">
                          Management accounts will be submitted for review and will be activated after approval.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              {/* Footer */}
              <div className="pt-5 mt-6 border-t border-gray-200">
                <div className="text-sm">
                  Have an account?{" "}
                  <Link className="font-medium text-indigo-500 hover:text-indigo-600" to="/signin">
                    Sign In
                  </Link>
                </div>
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
            alt="CSI-Immanuel-Church-Sirumugai"
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

export default Signup;
