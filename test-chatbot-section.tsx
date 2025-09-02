// Minimal test to isolate the syntax issue
export const TestSection = () => {
  const authMode = 'login';
  const setAuthMode = () => {};
  const setAuthError = () => {};
  
  return (
    <div>
      {/* Test the exact problematic section */}
      <button
        type="button"
        onClick={() => {
          setAuthMode(authMode === 'login' ? 'register' : 'login');
          setAuthError('');
        }}
        className="text-sm text-blue-500 hover:text-blue-600 font-medium"
      >
        {authMode === 'login' 
          ? 'No account? Create one here' 
          : 'Have account? Login here'
        }
      </button>
    </div>
  );
};