import React from 'react'
import { api } from '../../service/api';
import { useSearchParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [serverSuccess, setServerSuccess] = React.useState<null | string>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const token = searchParams.get("token") || "";

  const handleResetPassword = async (formData: FormData) => {
    setServerError(null);
    setServerSuccess(null);

    if (!token) {
      setServerError("Reset token is missing from URL. Please request a new password reset link.");
      return;
    }

    const newPassword = formData.get("new-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (!newPassword || !confirmPassword) {
      setServerError("Please fill in both password fields.");
      return;
    }

    if (confirmPassword !== newPassword) {
      setServerError("Passwords do not match.");
      return;
    }

    try {
      const response = await api.post("/auth/reset-password", { token, newPassword });
      setServerSuccess(response.data.message || "Password reset successful!");
      console.log(response.data);
    } catch (error: any) {
      console.log("Error response:", error.response?.data);
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const validationMsgs = data.errors.map((err: { message: string }) => err.message).join(". ");
        setServerError(validationMsgs);
      } else if (data?.message) {
        setServerError(data.message);
      } else {
        setServerError("Failed to reset password. Please try again.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form className="flex flex-col border w-[420px] min-h-[420px] bg-slate-900 text-white rounded-3xl px-10 py-6 justify-between" action={handleResetPassword}>

        <div className='flex flex-col items-center'>
          <p className="mt-4 mb-2 text-xl font-medium">Change your password</p>
          <p className="mb-4 text-sm text-gray-300 text-center">Enter a new password below to reset your password</p>
        </div>

        <section className="my-1 text-sm text-center">
          {serverSuccess && (
            <div>
              <p className="text-green-400 font-medium mb-2">{serverSuccess}</p>
              <button 
                type="button" 
                onClick={() => navigate("/login")}
                className="text-blue-400 underline cursor-pointer"
              >
                Go to Login
              </button>
            </div>
          )}
          {serverError && <p className="text-red-400 font-medium">{serverError}</p>}
        </section>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="new-password">New Password</label>
          <input 
            className="border border-gray-600 pl-3 py-2 rounded-lg bg-slate-800 text-white focus:outline-blue-500 text-sm" 
            name="new-password" 
            id="new-password"
            type="password" 
            placeholder="At least 8 chars (1 upper, 1 lower, 1 number)"
            required 
          />
        </div>

        <div className="flex flex-col gap-2 mt-3">
          <label className="text-sm font-medium" htmlFor="confirm-password">Confirm Password</label>
          <input 
            className="border border-gray-600 pl-3 py-2 rounded-lg bg-slate-800 text-white focus:outline-blue-500 text-sm" 
            name="confirm-password" 
            id="confirm-password"
            type="password" 
            placeholder="Re-enter new password"
            required 
          />
        </div>

        <div className="flex mt-6 mb-2">
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg cursor-pointer font-medium transition-colors">
            Reset Password
          </button>
        </div>

      </form>
    </div>
  );
}

export default ResetPassword;