import React from "react";
import { ShieldCheck } from 'lucide-react';
import malawiCoatOfArms from "./images/mw_govt_logo.png";

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
    labelText: "Continue with National ID",
    shape: "soft-edges",
    theme: "filled-orange",
    type: "standard",
  };

  const oidcConfig: OidcConfig = {
    acr_values:
      "mosip:idp:acr:generated-code mosip:idp:acr:biometrics mosip:idp:acr:static-code",
    authorizeUri: "http://34.35.69.91:3000/authorize",
    claims_locales: "en",
    client_id: "IIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtjxKY",
    display: "page",
    max_age: 21,
    response_type: "code",
    nonce: "",
    prompt: "consent",
    redirect_uri: "https://mtima.onrender.com/callback/",
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
      className="flex items-center gap-3 bg-indigo-700 text-white px-5 py-3 rounded-xl hover:bg-indigo-800 transition-colors w-full justify-center shadow-md" 
      onClick={handleSignIn}
    >
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
        <img src={malawiCoatOfArms} alt="Malawi Coat of Arms" className="h-full w-auto" />
      </div>
      <b>{buttonConfig.labelText}</b>
    </button>
  );
};

export default EsignetSignInButton;