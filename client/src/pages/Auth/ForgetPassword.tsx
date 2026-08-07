import React from "react";
import { api } from "../../service/api";
import { useNavigate } from "react-router-dom";

function ForgetPassword() {

  const [serverSuccess, setServerSuccess] = React.useState<null | string>(null);
  const [serverError, setServerError] = React.useState<string | null>(null)
  const navigate = useNavigate();
  const handleSendLink = async (formData: FormData) => {

    setServerSuccess(null)
    setServerError(null)

    const email = formData.get("email");
    try {
      const response = await api.post("/auth/forgot-password", { email });
      const result = response.data;
      setServerSuccess(result.message)
      console.log(result)
    }
    catch (error: any) {
      console.log(error.response?.data?.message)
      setServerError(error.response?.data?.message || "An unexpected error occurred.")
    }

  }
  const handleBack = () => {
    return navigate("/login")
  }
  return (
    <div className="flex justify-center items-center h-screen">

      <form className="flex flex-col items-center border w-[500px] h-[350px] rounded-3xl px-10" action={handleSendLink}>

        <div className="mt-4  flex justify-start w-full">
          <button onClick={handleBack} type="button" className=" cursor-pointer hover:underline text-lg">back</button>
        </div>
        <header className=" mb-2">
          <p className="text-xl">Forget Your Password</p>
        </header>


        <section className="my-2 text-lg">
          {serverSuccess && <p className="text-green-900 ">{serverSuccess}</p>}
          {serverError && <p className="text-red-900 ">{serverError}</p>}
        </section>


        <p className="mb-5">Please enter email address you'd like your password reset information sent to</p>

        <div className="flex gap-2 items-center ">
          <label className="text-lg" htmlFor="email">Email:</label>
          <input className="border w-64 pl-2 py-2 border  rounded-lg placeholder:text-white focus:outline-blue-500" name="email" type="email" placeholder="Enter your email" />
        </div>

        <div className="flex">
          <button className="mt-3 px-25  border py-2 rounded-lg cursor-pointer">Send Reset Link</button>
        </div>


      </form>
    </div>
  )
}

export default ForgetPassword