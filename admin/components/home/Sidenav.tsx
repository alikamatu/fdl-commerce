"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ChevronDown,
  NewspaperIcon,
  LogOut,
  StarIcon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  children?: { name: string; href: string }[];
}

interface SidenavProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export default function Sidenav({
  mobileOpen: controlledMobileOpen,
  onMobileOpenChange,
  collapsed: controlledCollapsed,
  onCollapsedChange,
}: SidenavProps = {}) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    products: true,
    orders: true,
  });
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const { logout } = useAuth();

  const isMobileControlled = typeof controlledMobileOpen === "boolean";
  const isMobileOpen = isMobileControlled
    ? controlledMobileOpen
    : internalMobileOpen;

  const isCollapsedControlled = typeof controlledCollapsed === "boolean";
  const isSidebarCollapsed = isCollapsedControlled
    ? controlledCollapsed
    : internalCollapsed;

  const setMobileOpen = (open: boolean) => {
    if (onMobileOpenChange) {
      onMobileOpenChange(open);
    }
    if (!isMobileControlled) {
      setInternalMobileOpen(open);
    }
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    if (onCollapsedChange) {
      onCollapsedChange(collapsed);
    }
    if (!isCollapsedControlled) {
      setInternalCollapsed(collapsed);
    }
  };

  const isActive = (path: string) => pathname === path;

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      name: "Products",
      href: "#",
      icon: <Package className="w-5 h-5" />,
      children: [
        { name: "All Products", href: "/dashboard/products" },
        { name: "Add New Product", href: "/dashboard/products/new" },
        { name: "Categories", href: "/dashboard/categories" },
        { name: "Inventory", href: "/dashboard/inventory" },
      ],
    },
    {
      name: "Orders",
      href: "/dashboard/orders",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      name: "Blog",
      href: "/dashboard/blog",
      icon: <NewspaperIcon className="w-5 h-5" />,
    },
    {
      name: "Reviews",
      href: "/dashboard/reviews",
      icon: <StarIcon className="w-5 h-5" />,
    },
  ];

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const NavContent = ({
    onNavigate,
    showCollapseToggle = false,
  }: {
    onNavigate?: () => void;
    showCollapseToggle?: boolean;
  }) => (
    <>
      <div className="flex items-center justify-between mb-8 px-2">
        <span>
          <img
            src="/logo/fdll.jpeg"
            alt="Forbes Logo"
            className="h-16 w-auto sm:h-20 rounded-2xl object-cover"
          />
        </span>

        {showCollapseToggle ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden lg:inline-flex p-2.5 min-h-11 min-w-11 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2.5 min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      <nav className="space-y-1 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <div>
                <button
                  type="button"
                  onClick={() => toggleMenu(item.name.toLowerCase())}
                  className={cn(
                    "w-full flex items-center justify-between p-3 min-h-11 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive(item.href) ||
                      item.children.some((child) => isActive(child.href))
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-700 hover:bg-gray-50 hover:border hover:border-gray-200"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                  <motion.div
                    animate={{
                      rotate: openMenus[item.name.toLowerCase()] ? 180 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openMenus[item.name.toLowerCase()] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-1 space-y-1 ml-4 overflow-hidden"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          onClick={onNavigate}
                          className={cn(
                            "block p-2.5 pl-8 min-h-11 rounded-lg text-sm transition-all duration-200",
                            isActive(child.href)
                              ? "bg-blue-100 text-blue-600 font-medium shadow-sm"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center space-x-3 p-3 min-h-11 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50 hover:border hover:border-gray-200"
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className="bg-red-600 text-white p-2.5 min-h-11 rounded-lg flex items-center justify-center space-x-2 cursor-pointer hover:bg-red-700 transition-colors w-full sm:w-auto"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/logo/fdll.jpeg"
              alt="Forbes Logo"
              className="h-9 w-9 rounded-lg object-cover flex-shrink-0"
            />
            <h1 className="text-base font-bold text-gray-900 truncate">
              Admin Panel
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2.5 min-h-11 min-w-11 inline-flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.aside
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[min(100vw-3rem,16rem)] max-w-xs bg-white p-4 flex flex-col border-r border-gray-200 lg:hidden"
            >
              <NavContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <AnimatePresence>
        {!isSidebarCollapsed && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:flex h-screen fixed bg-white p-4 flex-col z-40 border-r border-gray-200 w-64"
          >
            <NavContent showCollapseToggle />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop expand when collapsed */}
      <AnimatePresence>
        {isSidebarCollapsed && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            type="button"
            onClick={toggleSidebar}
            className="hidden lg:flex fixed top-4 left-4 z-50 p-2.5 min-h-11 min-w-11 items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors shadow-md"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
