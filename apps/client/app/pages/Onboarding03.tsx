import { Link } from "react-router";

function Onboarding03() {
  return (
    <div className="px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl text-gray-800 font-bold mb-6">Company information ✨</h1>
        {/* htmlForm */}
        <form>
          <div className="space-y-4 mb-8">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="company-name">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input id="company-name" className="form-input w-full" type="text" />
            </div>
            {/* City and Postal Code */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1" htmlFor="city">
                  City <span className="text-red-500">*</span>
                </label>
                <input id="city" className="form-input w-full" type="text" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1" htmlFor="postal-code">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input id="postal-code" className="form-input w-full" type="text" />
              </div>
            </div>
            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="street">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input id="street" className="form-input w-full" type="text" />
            </div>
            {/* Country */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="country">
                Country <span className="text-red-500">*</span>
              </label>
              <select id="country" className="form-select w-full">
                <option>USA</option>
                <option>Italy</option>
                <option>United Kingdom</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Link className="text-sm underline hover:no-underline" to="/onboarding-02">
              &lt;- Back
            </Link>
            <Link className="btn bg-indigo-500 hover:bg-indigo-600 text-white ml-auto" to="/onboarding-04">
              Next Step -&gt;
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Onboarding03;
