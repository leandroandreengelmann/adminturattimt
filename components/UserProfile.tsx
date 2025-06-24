"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import {
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

interface Profile {
  id: string;
  email: string;
  nome: string;
  role: string;
  avatar_url?: string;
  status: string;
  created_at: string;
}

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        // Se não encontrar perfil, criar um básico
        const { data: newProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([
            {
              id: user.id,
              email: user.email,
              nome: user.email?.split("@")[0] || "Usuário",
              role: "admin",
            },
          ])
          .select()
          .single();

        if (insertError) {
          console.error("Erro ao criar perfil:", insertError);
        } else {
          setProfile(newProfile);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Tem certeza que deseja sair?")) {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("Erro ao fazer logout:", error);
          alert("Erro ao fazer logout");
        }
      } catch (error) {
        console.error("Erro inesperado no logout:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 w-24 bg-gray-300 rounded mb-1"></div>
            <div className="h-3 w-16 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Informações do usuário */}
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.nome}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <UserIcon className="h-6 w-6 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {profile?.nome || user.email?.split("@")[0] || "Usuário"}
          </p>
          <p className="text-xs text-gray-600 truncate">
            {profile?.role || "Admin"}
          </p>
        </div>
      </div>

      {/* Botão de logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300"
      >
        <ArrowRightOnRectangleIcon className="h-4 w-4" />
        <span>Sair</span>
      </button>
    </div>
  );
}
