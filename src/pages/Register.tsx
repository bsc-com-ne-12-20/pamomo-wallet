import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hexagon, User, Lock, Mail, Phone } from 'lucide-react';
import axios from 'axios';

interface RegisterProps {
  onRegister: (username: string, email: string, phone: string, password: string) => boolean;
}

const Register: React.FC<RegisterProps> = ({ onRegister }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();

  // Simple loader component that matches the website color
  const SimpleLoader = () => (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8928A4]"></div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('https://mtima.onrender.com/api/v1/dj-rest-auth/registration/', {
        username,
        email,
        password1: password,
        password2: confirmPassword,
      });

      if (response.data.key) {
        setPopupMessage('Registration successful! You can now log in.');
        setShowPopup(true);
        setTimeout(() => {
          localStorage.setItem('authToken', response.data.key);
          localStorage.setItem('username', username);
          localStorage.setItem('email', email);
          onRegister(username, email, phone, password);
          navigate('/login');
        }, 3000);
      }
    } catch (err: any) {
      if (err.response?.data) {
        const errors = Object.values(err.response.data).flat();
        setPopupMessage(errors.join(' '));
        setShowPopup(true);
      } else {
        setPopupMessage('Registration failed. Please try again.');
        setShowPopup(true);
      }
    } finally {
      setTimeout(() => setLoading(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Hexagon size={64} className="text-[#8928A4]" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Pamomo and start managing your digital wallet
          </p>
        </div>

        {loading ? (
          <SimpleLoader />
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#8928A4] focus:border-[#8928A4] focus:z-10 sm:text-sm"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#8928A4] focus:border-[#8928A4] focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#8928A4] focus:border-[#8928A4] focus:z-10 sm:text-sm"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#8928A4] focus:border-[#8928A4] focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-[#8928A4] focus:border-[#8928A4] focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#8928A4] hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
              >
                Sign up
              </button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account?</span>{' '}
              <Link to="/login" className="text-[#8928A4] hover:text-[#7a2391] font-medium">
                Sign in
              </Link>
            </div>
          </form>
        )}

        {/* Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <p className="text-gray-800 text-center mb-4">{popupMessage}</p>
              <button
                onClick={() => {
                  setShowPopup(false);
                  if (popupMessage === 'Registration successful! You can now log in.') {
                    navigate('/login');
                  }
                }}
                className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
              >
                {popupMessage === 'Registration successful! You can now log in.'
                  ? 'Continue to Login'
                  : 'Close'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;