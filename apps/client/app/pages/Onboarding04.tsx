import React from "react";
import { Link } from "react-router";

import OnboardingImage from "../images/onboarding-image.jpg";
import OnboardingDecoration from "../images/auth-decoration.png";

function Onboarding04() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <svg className="inline-flex w-16 h-16 fill-current mb-6" viewBox="0 0 64 64">
            <circle className="text-green-100" cx="32" cy="32" r="32" />
            <path className="text-green-500" d="m28.5 41-8-8 3-3 5 5 12-12 3 3z" />
          </svg>
          <h1 className="text-3xl text-gray-800 font-bold mb-8">Nice to have you, Acme Inc. 🙌</h1>
          <Link className="btn bg-indigo-500 hover:bg-indigo-600 text-white" to="/">
            Go To Dashboard -&gt;
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Onboarding04;
