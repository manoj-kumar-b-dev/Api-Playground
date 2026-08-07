import { useNavigate } from "react-router-dom";
import { api } from "../../service/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../../schema/auth.schema";
import React from "react";
import { useAuthStore } from "../../store/useAuthStore";

function Login() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const setLoading = useAuthStore(state => state.setLoading)

  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setServerSuccess(null);
    try {

      const response = await api.post("auth/login", data);
      const result = response.data;
      console.log(result.user)
      login(result.user, result.accessToken)
      setServerSuccess(result.message);
      navigate("/dashboard")
    }
    catch (error: any) {
      const message = error.response?.data?.message || "Unexpected error occurs";
      setServerError(message)
      console.log(message)
    }
    finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex justify-center items-center text-white h-screen ">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center border w-[430px] h-[500px] bg-blue-600 rounded-3xl">

        {serverError && <p className="text-red-500 mb-5 text-lg">{serverError}</p>}
        {serverSuccess && <p className="text-green-500 mb-5 text-lg">{serverSuccess}</p>}

        <p className="text-3xl font-bold mb-10">Login Form</p>

        <input className="border py-2 rounded-lg focus:outline-blue-500 mb-5 w-78 pl-5" {...register("email")} placeholder="johndoe@gmail.com" aria-label='email' type="email" name='email' />
        {errors.email && <span>{errors.email.message}</span>}

        <input className="border focus:outline-blue-500 py-2 rounded-lg mb-3 w-78 pl-5 placeholder:text-3xl" {...register("password")} placeholder="..................." aria-label='password' type="password" name='password' />
        {errors.password && <span>{errors.password.message}</span>}

        <div className="w-78 mb-3 flex justify-end">
          <button type="button" onClick={() => navigate("/forget-password")} className="cursor-pointer hover:underline">Forgot Password?</button>
        </div>

        <button type="submit" className="px-34 py-2 border rounded-xl cursor-pointer">{isSubmitting ?
          "Logging" : "Login"}</button>
        <div className="mt-4">
          <button type="button" className="cursor-pointer hover:underline" onClick={() => navigate("/register")}>Do not have an account? Register</button>
        </div>
      </form>
    </div>
  )
}

export default Login