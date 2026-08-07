import { api } from "../../service/api";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "../../schema/auth.schema";
import { useAuthStore } from "../../store/useAuthStore";

function Register() {
  const login = useAuthStore(state => state.login)
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setServerSuccess(null);
    try {
      console.log(data)
      const response = await api.post("auth/register", data);
      const result = response.data;
      login(result.data, result.accessToken)
      setServerSuccess(result?.message)
      navigate("/dashboard")
      console.log(result)
    }
    catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      setServerError(errorMessage);
      console.log("Error message:", errorMessage);
      console.error("Register Failed", error.response?.data || error);
    }
  }

  return (
    <div className="flex justify-center items-center text-white h-screen ">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center justify-center border w-[430px] h-[500px] bg-orange-500 rounded-3xl">

        {serverError && <p className="text-white mb-3 text-lg">{serverError}</p>}
        {serverSuccess && <p className="text-white mb-3 text-lg">{serverSuccess}</p>}

        <p className="text-2 xl font-bold mb-6">Register Form</p>

        <input className="border py-2 rounded-lg mb-3 w-78 pl-5" placeholder="Name" {...register("name")} aria-label='name' type="text" name='name' />

        {errors.name && <span className="mb-3">{errors.name.message}</span>}

        <input className="border py-2 rounded-lg mb-3 w-78 pl-5" placeholder="Email" {...register("email")} aria-label='email' type="email" name='email' />

        {errors.email && <span className="mb-3">{errors.email.message}</span>}

        <input className="border py-2 rounded-lg mb-3 w-78 pl-5" placeholder="Password" {...register("password")} aria-label='password' type="password" name='password' />

        {errors.password && <span>{errors.password.message}</span>}

        <div className="mb-4">
          <button type="button" className="cursor-pointer hover:underline" onClick={() => navigate("/")}>Already have an account? Login</button>
        </div>

        <button type="submit" className="px-34 py-2 border rounded-xl cursor-pointer">{isSubmitting ? "Logging" : "Login"}</button>
      </form>
    </div>
  )
}

export default Register