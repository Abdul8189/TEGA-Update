import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center ">
      <div >
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
