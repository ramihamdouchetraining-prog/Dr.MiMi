// RBAC Hook for frontend role and permission checks
import { useQuery } from '@tanstack/react-query';

// Define the 5 main roles
export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'consultant';

// Permission types matching backend
export type Permission = 
  | 'content.read' | 'content.create' | 'content.edit' | 'content.delete' 
  | 'content.publish' | 'content.approve' | 'content.submit_for_review'
  | 'users.read' | 'users.create' | 'users.edit' | 'users.delete'
  | 'users.blacklist' | 'users.assign_roles' | 'users.manage_owners'
  | 'finance.view_reports' | 'finance.manage_prices' | 'finance.manage_taxes'
  | 'finance.manage_coupons' | 'finance.process_payments' | 'finance.issue_refunds'
  | 'finance.validate_offline_payments'
  | 'analytics.view_basic' | 'analytics.view_advanced' | 'analytics.view_financial'
  | 'analytics.export_csv' | 'analytics.export_json'
  | 'settings.theme' | 'settings.logo' | 'settings.i18n' | 'settings.seo'
  | 'settings.chatbot' | 'settings.system'
  | 'support.view_tickets' | 'support.respond_tickets' | 'support.resolve_tickets'
  | 'media.upload' | 'media.edit' | 'media.delete' | 'media.manage_all'
  | 'consultant.manage_profile' | 'consultant.manage_availability' | 'consultant.manage_agenda'
  | 'comments.read' | 'comments.create' | 'comments.moderate';

// Role hierarchy
export const roleHierarchy: Record<UserRole, number> = {
  owner: 5,
  admin: 4,
  editor: 3,
  consultant: 2,
  viewer: 1
};

// Role display information with metallic badges
export const roleInfo: Record<UserRole, { label: string; color: string; description: string }> = {
  owner: {
    label: 'Owner',
    color: 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/50',
    description: 'Full system control with all permissions'
  },
  admin: {
    label: 'Admin',
    color: 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 text-gray-900 shadow-lg shadow-gray-400/50',
    description: 'Manage content, users, and support'
  },
  editor: {
    label: 'Editor',
    color: 'bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 text-white shadow-lg shadow-orange-600/50',
    description: 'Create and edit content'
  },
  viewer: {
    label: 'Viewer',
    color: 'bg-gray-600 text-white',
    description: 'View content and comment'
  },
  consultant: {
    label: 'Consultant',
    color: 'bg-indigo-600 text-white',
    description: 'Medical consultant with calendar management'
  }
};

interface AdminCheckResponse {
  isAdmin: boolean;
  role?: UserRole;
  permissions?: Permission[];
}

// Hook to check admin status and permissions
export function useRBAC() {
  const { data, isLoading, error } = useQuery<AdminCheckResponse>({
    queryKey: ['rbac-admin-check'],
    queryFn: async () => {
      const response = await fetch('/api/admin/check', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to check admin status');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Helper functions
  const hasRole = (role: UserRole): boolean => {
    if (!data?.role) return false;
    return data.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    if (!data?.role) return false;
    return roles.includes(data.role);
  };

  const hasMinimumRole = (role: UserRole): boolean => {
    if (!data?.role) return false;
    return roleHierarchy[data.role] >= roleHierarchy[role];
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!data?.permissions) return false;
    return data.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (!data?.permissions) return false;
    return permissions.some(p => data.permissions!.includes(p));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (!data?.permissions) return false;
    return permissions.every(p => data.permissions!.includes(p));
  };

  const canManageRole = (targetRole: UserRole): boolean => {
    if (!data?.role) return false;
    
    // Only owner can manage other owners
    if (targetRole === 'owner') {
      return data.role === 'owner';
    }
    
    // Check hierarchy
    return roleHierarchy[data.role] > roleHierarchy[targetRole];
  };

  return {
    isLoading,
    error,
    isAdmin: data?.isAdmin ?? false,
    role: data?.role,
    permissions: data?.permissions ?? [],
    
    // Role checks
    hasRole,
    hasAnyRole,
    hasMinimumRole,
    canManageRole,
    
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Quick role checks
    isOwner: data?.role === 'owner',
    isAdminOrHigher: data?.role ? ['owner', 'admin'].includes(data.role) : false,
    isEditorOrHigher: data?.role ? ['owner', 'admin', 'editor'].includes(data.role) : false,
    isConsultant: data?.role === 'consultant',
    isViewer: data?.role === 'viewer',
  };
}

// Component to conditionally render based on role
interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  minimumRole?: UserRole;
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function RoleGate({
  children,
  allowedRoles,
  minimumRole,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  fallback = null
}: RoleGateProps) {
  const rbac = useRBAC();

  let hasAccess = false;

  if (allowedRoles) {
    hasAccess = rbac.hasAnyRole(allowedRoles);
  } else if (minimumRole) {
    hasAccess = rbac.hasMinimumRole(minimumRole);
  } else if (requiredPermission) {
    hasAccess = rbac.hasPermission(requiredPermission);
  } else if (requiredPermissions) {
    hasAccess = requireAll 
      ? rbac.hasAllPermissions(requiredPermissions)
      : rbac.hasAnyPermission(requiredPermissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}