import React, { useEffect, useState } from 'react';
import { 
  FcGoogle, // Google colored icon
} from 'react-icons/fc';
import { 
  FaFacebook,
  FaMicrosoft 
} from 'react-icons/fa';

interface OAuthStatus {
  google: boolean;
  facebook: boolean;
  microsoft: boolean;
  any: boolean;
}

export const OAuthButtons: React.FC = () => {
  const [oauthStatus, setOauthStatus] = useState<OAuthStatus>({
    google: false,
    facebook: false,
    microsoft: false,
    any: false
  });

  useEffect(() => {
    // Check which OAuth providers are configured
    fetch('/api/oauth/status')
      .then(res => res.json())
      .then(data => setOauthStatus(data))
      .catch(err => console.error('Failed to fetch OAuth status:', err));
  }, []);

  // Don't render anything if no OAuth providers are configured
  if (!oauthStatus.any) {
    return null;
  }

  const handleOAuthLogin = (provider: string) => {
    // Redirect to OAuth provider
    window.location.href = `/api/oauth/${provider}`;
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">
            Ou continuer avec
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {oauthStatus.google && (
          <button
            onClick={() => handleOAuthLogin('google')}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <FcGoogle size={20} />
            <span className="text-sm font-medium">Google</span>
          </button>
        )}

        {oauthStatus.facebook && (
          <button
            onClick={() => handleOAuthLogin('facebook')}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#1877F2] bg-[#1877F2] px-4 py-2.5 text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <FaFacebook size={20} />
            <span className="text-sm font-medium">Facebook</span>
          </button>
        )}

        {oauthStatus.microsoft && (
          <button
            onClick={() => handleOAuthLogin('microsoft')}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <FaMicrosoft size={18} className="text-[#00BCF2]" />
            <span className="text-sm font-medium">Microsoft</span>
          </button>
        )}
      </div>

      <p className="mt-3 text-xs text-center text-gray-500">
        En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité
      </p>
    </div>
  );
};