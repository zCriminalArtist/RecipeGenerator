import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../utils/api";

// Define the login form schema using Zod
const loginSchema = z.object({
  username: z.string().min(1, "Username must be at least 1 character long"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// TypeScript type for form data
type LoginForm = z.infer<typeof loginSchema>;

const UserLogin = () => {
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await api.post("/api/auth/login", data);
      const { token } = response.data;

      localStorage.setItem("jwt", token);
      window.location.href = "/";
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-700">Username:</label>
            <input
              type="username"
              {...register("username")}
              className="w-full p-2 border rounded"
            />
            {errors.username && <p className="text-red-500">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-gray-700">Password:</label>
            <input
              type="password"
              {...register("password")}
              className="w-full p-2 border rounded"
            />
            {errors.password && <p className="text-red-500">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
