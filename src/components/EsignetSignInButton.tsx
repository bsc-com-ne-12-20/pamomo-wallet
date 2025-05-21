import React from "react";
import mwGovtLogo from "./images/mw_govt_logo.png";

interface OidcConfig {
  acr_values: string;
  authorizeUri: string;
  claims_locales: string;
  client_id: string;
  display: string;
  max_age: number;
  nonce: string;
  prompt: string;
  redirect_uri: string;
  response_type: string;
  scope: string;
  state: string;
  ui_locales: string;
  requestTime?: string;
}

/**
 * EsignetSignInButton component for National ID authentication.
 * Using direct OIDC flow with proper requestTime parameter.
 */
const EsignetSignInButton: React.FC = () => {
  const oidcConfig: OidcConfig = {
    acr_values:
      "mosip:idp:acr:generated-code mosip:idp:acr:biometrics mosip:idp:acr:static-code",
    authorizeUri: "http://34.30.20.64:3000/authorize",
    claims_locales: "en",
    client_id: "IIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAi1FKC",
    display: "page",
    max_age: 21,
    response_type: "code",
    nonce: Date.now().toString(), // Generate a unique nonce for security
    prompt: "consent",
    redirect_uri: "https://mtima.onrender.com/callback/",
    scope: "openid profile",
    state: "eree2311",
    ui_locales: "en",
  };

  /**
   * Creates a timestamp that matches the server's expected format
   * Based on error logs, we need to ensure the timestamp is in UTC
   */
  const getServerAlignedTimestamp = (): string => {
    const now = new Date();
    // Format the date in UTC timezone as required by the server
    return now.toISOString();
  };
  
  const handleSignIn = () => {
    // Create params with proper timestamp
    const params: Record<string, string> = {
      ...Object.entries(oidcConfig).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value?.toString() || ''
      }), {}),
      requestTime: getServerAlignedTimestamp()
    };
    
    const queryParams = new URLSearchParams(params).toString();
    window.location.href = `${oidcConfig.authorizeUri}?${queryParams}`;
  };

  return (    
    <button
      onClick={handleSignIn}
      className="flex items-center justify-center px-6 py-3 w-full rounded-md bg-white text-[#8928A4] border-2 border-[#8928A4] hover:bg-gray-50 font-medium transition-colors duration-200 shadow-md"
    >      
      <img 
        src={mwGovtLogo} 
        alt="Malawi Government" 
        className="h-5 mr-3"
      />
      <span>Continue with National ID</span>
    </button>
  );
};

export default EsignetSignInButton;