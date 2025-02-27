import LoginForm from "../components/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <div className="registration-page">
      <h1 className="mb-8 text-2xl font-bold">Log in!</h1>
      <LoginForm />
    </div>
  );
};
export default LoginPage;
