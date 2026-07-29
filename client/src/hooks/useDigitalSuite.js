import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useDigitalSuite(navConfig) {
  const [isEmbedded, setIsEmbedded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const [workspaceId, setWorkspaceId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('workspaceId');
    if (idFromUrl) {
      sessionStorage.setItem('ds_workspace_id', idFromUrl);
      return idFromUrl;
    }
    return sessionStorage.getItem('ds_workspace_id') || null;
  });

  useEffect(() => {
    if (isEmbedded) {
      window.parent.postMessage({
        type: 'ROUTE_CHANGE',
        path: location.pathname
      }, '*');
    }
  }, [location.pathname, isEmbedded]);

  return { isEmbedded, workspaceId };
}
