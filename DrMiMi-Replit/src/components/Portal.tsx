import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ReactNode } from 'react';

interface PortalProps {
  children: ReactNode;
  id?: string;
}

export function Portal({ children, id = 'portal-root' }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    let portalRoot = document.getElementById(id);
    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.id = id;
      portalRoot.className = 'dropdown-portal';
      document.body.appendChild(portalRoot);
    }
    return () => {
      const root = document.getElementById(id);
      if (root && !root.hasChildNodes()) {
        root.remove();
      }
    };
  }, [id]);

  if (!mounted) return null;
  const portalRoot = document.getElementById(id);
  if (!portalRoot) return null;
  
  return createPortal(children, portalRoot);
}