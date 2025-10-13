// Comprehensive RBAC (Role-Based Access Control) System for MediMimi
import { db } from "./db";
import { users, auditLogs } from "../shared/schema";
import { eq } from "drizzle-orm";

// Define all possible permissions in the system
export type Permission = 
  // Content Management
  | 'content.read'
  | 'content.create'
  | 'content.edit'
  | 'content.delete'
  | 'content.publish'
  | 'content.approve'
  | 'content.submit_for_review'
  
  // User Management  
  | 'users.read'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'users.blacklist'
  | 'users.assign_roles'
  | 'users.manage_owners'
  
  // Financial Management
  | 'finance.view_reports'
  | 'finance.manage_prices'
  | 'finance.manage_taxes'
  | 'finance.manage_coupons'
  | 'finance.process_payments'
  | 'finance.issue_refunds'
  | 'finance.validate_offline_payments'
  
  // Analytics & Reports
  | 'analytics.view_basic'
  | 'analytics.view_advanced'
  | 'analytics.view_financial'
  | 'analytics.export_csv'
  | 'analytics.export_json'
  
  // System Settings
  | 'settings.theme'
  | 'settings.logo'
  | 'settings.i18n'
  | 'settings.seo'
  | 'settings.chatbot'
  | 'settings.system'
  
  // Support & Tickets
  | 'support.view_tickets'
  | 'support.respond_tickets'
  | 'support.resolve_tickets'
  
  // Media Management
  | 'media.upload'
  | 'media.edit'
  | 'media.delete'
  | 'media.manage_all'
  
  // Consultant Features
  | 'consultant.manage_profile'
  | 'consultant.manage_availability'
  | 'consultant.manage_agenda'
  
  // Comments
  | 'comments.read'
  | 'comments.create'
  | 'comments.moderate'
  
  // Contracts Management
  | 'contracts.view'
  | 'contracts.create'
  | 'contracts.edit'
  | 'contracts.delete'
  | 'contracts.sign'
  | 'contracts.approve';

// Define the 5 main roles
export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'consultant';

// Role hierarchy (higher number = higher privilege)
export const roleHierarchy: Record<UserRole, number> = {
  owner: 5,
  admin: 4,
  editor: 3,
  consultant: 2,
  viewer: 1
};

// Complete permission matrix for all roles
export const rolePermissions: Record<UserRole, Permission[]> = {
  owner: [
    // Complete content control
    'content.read', 'content.create', 'content.edit', 'content.delete', 
    'content.publish', 'content.approve', 'content.submit_for_review',
    
    // Full user management including other owners
    'users.read', 'users.create', 'users.edit', 'users.delete', 
    'users.blacklist', 'users.assign_roles', 'users.manage_owners',
    
    // Complete financial control
    'finance.view_reports', 'finance.manage_prices', 'finance.manage_taxes',
    'finance.manage_coupons', 'finance.process_payments', 'finance.issue_refunds',
    'finance.validate_offline_payments',
    
    // Full analytics access
    'analytics.view_basic', 'analytics.view_advanced', 'analytics.view_financial',
    'analytics.export_csv', 'analytics.export_json',
    
    // All system settings
    'settings.theme', 'settings.logo', 'settings.i18n', 'settings.seo',
    'settings.chatbot', 'settings.system',
    
    // Support management
    'support.view_tickets', 'support.respond_tickets', 'support.resolve_tickets',
    
    // Complete media control
    'media.upload', 'media.edit', 'media.delete', 'media.manage_all',
    
    // Comments
    'comments.read', 'comments.create', 'comments.moderate',
    
    // Contracts (full control)
    'contracts.view', 'contracts.create', 'contracts.edit', 
    'contracts.delete', 'contracts.sign', 'contracts.approve'
  ],
  
  admin: [
    // Content management (no final approval)
    'content.read', 'content.create', 'content.edit', 'content.delete',
    'content.publish', 'content.submit_for_review',
    
    // User management (except owners)
    'users.read', 'users.create', 'users.edit', 'users.delete',
    'users.blacklist', 'users.assign_roles',
    
    // Limited financial operations
    'finance.view_reports', 'finance.validate_offline_payments',
    'finance.issue_refunds',
    
    // Standard analytics
    'analytics.view_basic', 'analytics.export_csv', 'analytics.export_json',
    
    // Support operations
    'support.view_tickets', 'support.respond_tickets', 'support.resolve_tickets',
    
    // Media management
    'media.upload', 'media.edit', 'media.delete', 'media.manage_all',
    
    // Comments
    'comments.read', 'comments.create', 'comments.moderate',
    
    // Contracts (view and sign)
    'contracts.view', 'contracts.sign'
  ],
  
  editor: [
    // Content creation and editing (own content)
    'content.read', 'content.create', 'content.edit',
    'content.submit_for_review',
    
    // Media for own content
    'media.upload', 'media.edit',
    
    // Comments
    'comments.read', 'comments.create',
    
    // Contracts (view and sign own)
    'contracts.view', 'contracts.sign'
  ],
  
  viewer: [
    // Read-only access
    'content.read',
    'comments.read',
    'comments.create' // Can comment if enabled
  ],
  
  consultant: [
    // Basic content access
    'content.read',
    
    // Consultant-specific features
    'consultant.manage_profile',
    'consultant.manage_availability',
    'consultant.manage_agenda',
    
    // Comments
    'comments.read', 'comments.create',
    
    // Contracts (view and sign)
    'contracts.view', 'contracts.sign'
  ]
};

// Check if a role has a specific permission
export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) || false;
}

// Check if one role can manage another role
export function canManageRole(actorRole: UserRole, targetRole: UserRole): boolean {
  // Only owner can manage other owners
  if (targetRole === 'owner') {
    return actorRole === 'owner';
  }
  
  // Check hierarchy - can only manage lower roles
  return roleHierarchy[actorRole] > roleHierarchy[targetRole];
}

// Get user's role and permissions
export async function getUserPermissions(userId: string): Promise<{
  role: UserRole | null;
  permissions: Permission[];
}> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  
  if (!user || !user.role) {
    return { role: null, permissions: [] };
  }
  
  // Validate role is one of our 5 defined roles
  const validRoles: UserRole[] = ['owner', 'admin', 'editor', 'viewer', 'consultant'];
  const userRole = validRoles.includes(user.role as UserRole) 
    ? user.role as UserRole 
    : 'viewer'; // Default to viewer if unknown role
  
  return {
    role: userRole,
    permissions: rolePermissions[userRole] || []
  };
}

// Check if user has specific permission
export async function userHasPermission(userId: string, permission: Permission): Promise<boolean> {
  const { permissions } = await getUserPermissions(userId);
  return permissions.includes(permission);
}

// Check if user has any of the specified permissions
export async function userHasAnyPermission(userId: string, permissions: Permission[]): Promise<boolean> {
  const userPerms = await getUserPermissions(userId);
  return permissions.some(p => userPerms.permissions.includes(p));
}

// Check if user has all of the specified permissions
export async function userHasAllPermissions(userId: string, permissions: Permission[]): Promise<boolean> {
  const userPerms = await getUserPermissions(userId);
  return permissions.every(p => userPerms.permissions.includes(p));
}

// Middleware factory for Express routes
export function requirePermission(...permissions: Permission[]) {
  return async (req: any, res: any, next: any) => {
    try {
      // Get user ID from session or JWT
      const userId = req.user?.claims?.sub || req.session?.adminUserId;
      
      if (!userId) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }
      
      // Check if user has required permissions
      const hasPermission = permissions.length === 1
        ? await userHasPermission(userId, permissions[0])
        : await userHasAnyPermission(userId, permissions);
      
      if (!hasPermission) {
        // Log unauthorized access attempt
        await logSecurityEvent(userId, 'unauthorized_access', {
          required_permissions: permissions,
          path: req.path,
          method: req.method
        });
        
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Insufficient permissions',
          required: permissions
        });
      }
      
      // Add user permissions to request for downstream use
      const userPerms = await getUserPermissions(userId);
      req.userRole = userPerms.role;
      req.userPermissions = userPerms.permissions;
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to verify permissions'
      });
    }
  };
}

// Middleware to require specific role
export function requireRole(...roles: UserRole[]) {
  return async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.claims?.sub || req.session?.adminUserId;
      
      if (!userId) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }
      
      const { role } = await getUserPermissions(userId);
      
      if (!role || !roles.includes(role)) {
        await logSecurityEvent(userId, 'unauthorized_role_access', {
          required_roles: roles,
          user_role: role,
          path: req.path
        });
        
        return res.status(403).json({ 
          error: 'Forbidden',
          message: 'Role not authorized',
          required: roles
        });
      }
      
      req.userRole = role;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to verify role'
      });
    }
  };
}

// Log security-related events
async function logSecurityEvent(
  userId: string,
  action: string,
  metadata: any
) {
  try {
    const { role } = await getUserPermissions(userId);
    
    await db.insert(auditLogs).values({
      userId,
      userRole: role || 'unknown',
      action,
      metadata,
      severity: 'warning',
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Helper to check content ownership
export async function userOwnsContent(
  userId: string,
  contentType: 'article' | 'blogPost' | 'course' | 'quiz',
  contentId: string
): Promise<boolean> {
  // Implementation depends on your content schema
  // This is a placeholder - implement based on your actual schema
  return false;
}

// Check if user can perform action on content
export async function canPerformContentAction(
  userId: string,
  action: 'edit' | 'delete' | 'publish',
  contentType: string,
  contentId: string
): Promise<boolean> {
  const { role, permissions } = await getUserPermissions(userId);
  
  if (!role) return false;
  
  // Owners and admins can do anything
  if (role === 'owner' || role === 'admin') {
    return true;
  }
  
  // Editors can edit/delete their own content
  if (role === 'editor' && (action === 'edit' || action === 'delete')) {
    return await userOwnsContent(userId, contentType as any, contentId);
  }
  
  // Check specific permissions
  const permissionMap = {
    edit: 'content.edit' as Permission,
    delete: 'content.delete' as Permission,
    publish: 'content.publish' as Permission
  };
  
  return permissions.includes(permissionMap[action]);
}