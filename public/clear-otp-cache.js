// Script to clear OTP cache and authentication data
(function() {
  // Display a confirmation dialog
  if (confirm("This will clear your OTP cache and may log you out. Continue?")) {
    try {
      // Clear all 2FA/OTP related data from localStorage
      localStorage.removeItem('is2FAEnabled');
      localStorage.removeItem('pre_2fa_user_id');
      localStorage.removeItem('otpVerified');
      
      // Clear session storage too
      sessionStorage.removeItem('is2FAEnabled');
      sessionStorage.removeItem('pre_2fa_user_id');
      sessionStorage.removeItem('otpVerified');
      
      // Clear any cookies that might be related to OTP
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      alert("OTP cache cleared successfully! Please log in again.");
      window.location.href = "/login";
    } catch (error) {
      console.error("Failed to clear cache:", error);
      alert("Failed to clear cache. Please try again or clear your browser data manually.");
    }
  }
})();
