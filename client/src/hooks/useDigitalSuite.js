import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useDigitalSuite(navConfig) {
  const [isEmbedded, setIsEmbedded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const inIframe = window !== window.parent;
    setIsEmbedded(inIframe);

    if (inIframe && navConfig) {
      window.parent.postMessage({
        type: 'DIGITAL_SUITE_REGISTER',
        navigation: navConfig
      }, '*');
    }

    const handleMessage = (event) => {
      // Allow messages from any origin in development, but you might want to restrict this in production
      if (event.data?.type === 'DIGITAL_SUITE_NAVIGATE') {
        const { path } = event.data;
        if (typeof path === 'string') {
          navigate(path);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navConfig, navigate]);

  return { isEmbedded };
}
