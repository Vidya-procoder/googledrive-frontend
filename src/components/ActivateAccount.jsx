import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

const ActivateAccount = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const response = await authAPI.activate(token);
        setStatus('success');
        toast.success(response.data.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setStatus('error');
        toast.error(error.response?.data?.message || 'Activation failed');
      }
    };

    if (token) {
      activateAccount();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center animate-fade-in">
          {status === 'loading' && (
            <>
              <FiLoader className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Activating Account</h2>
              <p className="text-gray-600">Please wait while we activate your account...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Activated!</h2>
              <p className="text-gray-600 mb-6">
                Your account has been successfully activated. You will be redirected to login shortly.
              </p>
              <Link to="/login" className="btn btn-primary">
                Go to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <FiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Activation Failed</h2>
              <p className="text-gray-600 mb-6">
                The activation link is invalid or has expired. Please try registering again.
              </p>
              <Link to="/register" className="btn btn-primary">
                Back to Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;
