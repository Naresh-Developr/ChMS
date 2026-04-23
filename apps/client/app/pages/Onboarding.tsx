import { Link } from "react-router";
import logo from "../assets/csi-sirumugai-logo.png";
import HouseOfGodImage from "../assets/house-of-god-2k.webp";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/index";
import Onboarding01 from "./Onboarding01";
import Onboarding02 from "./Onboarding02";
import Onboarding03 from "./Onboarding03";
import Onboarding04 from "./Onboarding04";
import { setOnboardingStepperIndex } from "~/features/onboarding/onboardingSlice";

function Onboarding() {
  const onboardingStepperIndex = useSelector((state: RootState) => state.onboarding);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <main className="bg-white">
      <div className="relative flex">
        {/* Content */}
        <div className="w-full md:w-1/2">
          <div className="min-h-screen h-full flex flex-col after:flex-1">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <Link className="block" to="/">
                  <img width="50" height="50" src={logo} alt="CSI-Immanuel-Church-Sirumugai-Logo"></img>
                </Link>
                {/* <div className="text-sm">
                  Have an account?{" "}
                  <Link className="font-medium text-indigo-500 hover:text-indigo-600" to="/signin">
                    Sign In
                  </Link>
                </div> */}
              </div>

              {/* Progress bar */}
              <div className="px-4 pt-12 pb-8">
                <div className="max-w-md mx-auto w-full">
                  <div className="relative">
                    <div className="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-gray-200" aria-hidden="true"></div>
                    <ul className="relative flex justify-between w-full">
                      {[1, 2, 3, 4].map((index) => (
                        <li key={index}>
                          <button
                            className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${onboardingStepperIndex === index ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-500"}`}
                            onClick={() => {
                              dispatch(setOnboardingStepperIndex(index));
                            }}
                          >
                            {index}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div>
              {onboardingStepperIndex === 1 && <Onboarding01 />}
              {onboardingStepperIndex === 2 && <Onboarding02 />}
              {onboardingStepperIndex === 3 && <Onboarding03 />}
              {onboardingStepperIndex === 4 && <Onboarding04 />}
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
            alt="Onboarding"
          />
          {/* <img
            className="absolute top-1/4 left-0 transform -translate-x-1/2 ml-8 hidden lg:block"
            src={OnboardingDecoration}
            width="218"
            height="224"
            alt="Authentication decoration"
          /> */}
        </div>
      </div>
    </main>
  );
}

export default Onboarding;
