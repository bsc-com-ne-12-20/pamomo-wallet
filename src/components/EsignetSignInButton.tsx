import React from "react";
import { Hexagon } from 'lucide-react';
import esignetlogo from "./images/esignetlogo.png";

interface ButtonConfig {
  labelText: string;
  shape: string;
  theme: string;
  type: string;
}

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
  scope: string;
  state: string;
  ui_locales: string;
  response_type: string;
}

const EsignetSignInButton: React.FC = () => {
  const buttonConfig: ButtonConfig = {
    labelText: "Sign in with e-Signet",
    shape: "soft-edges",
    theme: "filled-orange",
    type: "standard",
  };

  const oidcConfig: OidcConfig = {
    acr_values:
      "mosip:idp:acr:generated-code mosip:idp:acr:biometrics mosip:idp:acr:static-code",
    authorizeUri: "http://localhost:3000/authorize",
    claims_locales: "en",
    client_id: "IIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEArVTcO",
    display: "page",
    max_age: 21,
    response_type: "code",
    nonce: "ere973eieljznge2311",
    prompt: "consent",
    redirect_uri: "http://localhost:4174",
    scope: "openid profile",
    state: "eree2311",
    ui_locales: "en",
  };

  const handleSignIn = () => {
    const queryParams = new URLSearchParams(oidcConfig).toString();
    window.location.href = `${oidcConfig.authorizeUri}?${queryParams}`;
  };

  return (
    <button 
      className="flex items-center gap-3 bg-[#eb6f2d] text-white px-5 py-3 rounded-xl hover:bg-[#d65d1e] transition-colors" 
      onClick={handleSignIn}
    >
      <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
        {/* <Hexagon size={16} className="text-[#eb6f2d]" /> */}
        <img src={esignetlogo} alt="e-Signet Logo" />
      </div>
      {buttonConfig.labelText}
    </button>
  );
};

export default EsignetSignInButton;