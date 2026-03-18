
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
  Plus,
  Database
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
      roles: ['SALES'], 
      icon: Briefcase 
    },
    { 
      label: 'Design Queue', 
      href: '/design', 
      roles: ['DESIGN'], 
      icon: Paintbrush 
    },
    { 
      label: 'Intelligence', 
      href: '/management', 
      roles: ['MANAGEMENT', 'ADMIN'], 
      icon: LayoutDashboard 
    },
    { 
      label: 'Assets', 
      href: '/admin/buildings', 
      roles: ['ADMIN'], 
      icon: Building2 
    },
    { 
      label: 'Access', 
      href: '/admin/users', 
      roles: ['ADMIN'], 
      icon: Users 
    },
    {
      label: 'Import',
      href: '/admin/import',
      roles: ['ADMIN'],
      icon: Database
    }
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <nav className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-black text-lg">S</span>
          </div>
          <span className="font-black text-xl tracking-tight text-primary">Simpliwork <span className="text-slate-400 font-bold">OS</span></span>
        </Link>
        
        <div className="hidden md:flex items-center gap-1">
          {filteredItems.map(item => (
            <Link key={item.href} href={item.href}>
              <Button 
                variant="ghost" 
                className={cn(
                  "gap-2 h-10 px-4 text-xs font-bold uppercase tracking-wider",
                  pathname.startsWith(item.href) && "bg-slate-100 text-primary"
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
        {user.role === 'SALES' && (
          <Link href="/sales/create">
            <Button size="sm" className="gap-2 font-bold px-4">
              <Plus className="w-4 h-4" />
              CREATE DEAL
            </Button>
          </Link>
        )}
        
        <div className="flex items-center gap-3 pl-4 border-l">
          <div className="text-right">
            <p className="text-xs font-black leading-none uppercase">{user.full_name}</p>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest">{user.role}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} title="Logout" className="hover:bg-red-50 hover:text-red-600 rounded-full h-8 w-8">
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
