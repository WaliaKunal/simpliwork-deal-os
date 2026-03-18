"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Briefcase, 
  Paintbrush, 
  Building2, 
  Users, 
  LogOut,
  Plus
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    { 
      label: 'My Deals', 
      href: '/sales', 
      roles: ['Sales'], 
      icon: Briefcase 
    },
    { 
      label: 'Design Queue', 
      href: '/design', 
      roles: ['Design'], 
      icon: Paintbrush 
    },
    { 
      label: 'Management', 
      href: '/management', 
      roles: ['Management', 'Admin'], 
      icon: LayoutDashboard 
    },
    { 
      label: 'Buildings', 
      href: '/admin/buildings', 
      roles: ['Admin'], 
      icon: Building2 
    },
    { 
      label: 'Users', 
      href: '/admin/users', 
      roles: ['Admin'], 
      icon: Users 
    },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <nav className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">Simpliwork Deal OS</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-1">
          {filteredItems.map(item => (
            <Link key={item.href} href={item.href}>
              <Button 
                variant="ghost" 
                className={cn(
                  "gap-2 h-10",
                  pathname.startsWith(item.href) && "bg-secondary text-primary font-semibold"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user.role === 'Sales' && (
          <Link href="/sales/create">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Deal
            </Button>
          </Link>
        )}
        
        <div className="flex items-center gap-3 pl-4 border-l">
          <div className="text-right">
            <p className="text-sm font-semibold leading-none">{user.full_name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="Logout">
            <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      </div>
    </nav>
  );
}