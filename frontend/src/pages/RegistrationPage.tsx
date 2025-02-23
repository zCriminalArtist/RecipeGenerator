import RegistrationForm from "../components/RegistrationForm";

const RegistrationPage: React.FC = () => {
  return (
    <div className="registration-page">
      <h1 className="mb-8 text-2xl font-bold">User Registration</h1>
      <RegistrationForm />
    </div>
  );
};
export default RegistrationPage;
