"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

import {
  HomeIcon,
  TagIcon,
  FolderIcon,
  BuildingStorefrontIcon,
  ShareIcon,
  PhotoIcon,
  RectangleStackIcon,
  UserIcon,
  UsersIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

interface AdminUser {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  nome?: string;
  status: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAuth();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        router.push("/auth/login");
      } else if (event === "SIGNED_IN" && session) {
        await loadUserProfile(session.user.id);
      } else if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed successfully");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const checkAuth = async () => {
    try {
      setLoading(true);

      // Tentar obter o usuário atual
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("Auth error:", authError);
        // Se há erro de autenticação, limpar sessão e redirecionar
        await supabase.auth.signOut();
        router.push("/auth/login");
        return;
      }

      if (!authUser) {
        // Sem usuário, redirecionar para login
        router.push("/auth/login");
        return;
      }

      // Carregar perfil do usuário
      await loadUserProfile(authUser.id);
    } catch (error) {
      console.error("Error checking auth:", error);
      router.push("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        // Se não conseguir carregar o perfil, ainda permitir acesso básico
        setUser({
          id: userId,
          email: "Usuário",
          role: "admin",
          full_name: "Administrador",
          status: "ativo",
        });
        return;
      }

      setUser(profileData);
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      }
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error in logout:", error);
      // Forçar logout mesmo com erro
      setUser(null);
      router.push("/login");
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: HomeIcon,
      current: pathname === "/admin",
    },
    {
      name: "Categorias",
      href: "/admin/categorias",
      icon: FolderIcon,
      current: pathname?.startsWith("/admin/categorias"),
    },
    {
      name: "Subcategorias",
      href: "/admin/subcategorias",
      icon: TagIcon,
      current: pathname?.startsWith("/admin/subcategorias"),
    },
    {
      name: "Produtos",
      href: "/admin/produtos",
      icon: TagIcon,
      current: pathname?.startsWith("/admin/produtos"),
    },
    {
      name: "Lojas",
      href: "/admin/lojas",
      icon: BuildingStorefrontIcon,
      current: pathname?.startsWith("/admin/lojas"),
    },
    {
      name: "Banners",
      href: "/admin/banners",
      icon: PhotoIcon,
      current: pathname?.startsWith("/admin/banners"),
    },
    {
      name: "Logos",
      href: "/admin/logos",
      icon: RectangleStackIcon,
      current: pathname?.startsWith("/admin/logos"),
    },
    {
      name: "Redes Sociais",
      href: "/admin/redes-sociais",
      icon: ShareIcon,
      current: pathname?.startsWith("/admin/redes-sociais"),
    },
    {
      name: "Vendedores",
      href: "/admin/vendedores",
      icon: UserIcon,
      current: pathname?.startsWith("/admin/vendedores"),
    },
    {
      name: "Usuários",
      href: "/admin/usuarios",
      icon: UsersIcon,
      current: pathname?.startsWith("/admin/usuarios"),
    },
    {
      name: "Configurações",
      href: "/admin/configuracoes",
      icon: CogIcon,
      current: pathname?.startsWith("/admin/configuracoes"),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-base">
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-base">
            Redirecionando para login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar para desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>

          {/* Navegação */}
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-3 text-base font-semibold rounded-md transition-colors ${
                      item.current
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-6 w-6 ${
                        item.current
                          ? "text-blue-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Seção de Logout */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="group flex items-center w-full px-2 py-3 text-base font-semibold rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-6 w-6 text-red-500 group-hover:text-red-600" />
                Sair do Painel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Layout mobile */}
      <div className="md:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 flex z-40">
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>

              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <h1 className="text-xl font-bold text-gray-900">
                    Admin Panel
                  </h1>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          item.current
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <Icon
                          className={`mr-3 h-6 w-6 ${
                            item.current
                              ? "text-blue-500"
                              : "text-gray-400 group-hover:text-gray-500"
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar mobile */}
        <div className="md:hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex-1 px-4 flex justify-between items-center">
              <h1 className="text-lg font-medium text-gray-900">Admin Panel</h1>
            </div>
          </div>
        </div>

        {/* Área de conteúdo */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
