"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button"; 

// 1. Importando a Action correta (ajuste o caminho se necessário)
import { loginController } from "@/src/Server/controllers/UserController"; 

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [erroMsg, setErroMsg] = useState(""); 

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErroMsg(""); 
    setIsLoading(true);

    try {
      const resposta = await loginController({ 
        email: email, 
        password: senha 
      });

      if (!resposta.success) {
        setErroMsg(resposta.message || "E-mail ou senha inválidos.");
      } else {
        console.log("Login realizado!");
        
        // 🟢 4. O GUARDA DE TRÂNSITO INTELIGENTE
        // Tentamos achar o perfil dentro do objeto que o backend devolveu
        // 🟢 O GUARDA DE TRÂNSITO INTELIGENTE (Sem erro de TypeScript)
        const res = resposta as any;
        const perfil = res.user?.profile || res.user?.user_metadata?.profile || res.data?.user?.user_metadata?.profile;

        // Se for Admin, caminho livre pro Dashboard. Se não, vai direto pro Caixa limpinho!
        if (perfil === 'Admin') {
          router.push("/admin/dashboard"); 
        } else {
          router.push("/caixa"); 
        }

        router.refresh(); 
      }

    } catch (error) {
      console.error("Erro no Front:", error);
      setErroMsg("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
      
      {/* Exibição de Erro */}
      {erroMsg && (
        <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center font-semibold animate-pulse">
          {erroMsg}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-bold text-gray-700">E-mail</label>
        <input 
          id="email" 
          type="email" 
          placeholder="seu@email.com"
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0D9488] outline-none transition-all" 
          required 
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="senha" className="text-sm font-bold text-gray-700">Senha</label>
        <input 
          id="senha" 
          type="password" 
          placeholder="••••••••"
          value={senha} 
          onChange={(e) => setSenha(e.target.value)} 
          className="w-full px-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0D9488] outline-none transition-all" 
          required 
        />
      </div>

      <div className="flex flex-col items-center gap-4 mt-2">
        <Button type="submit" isLoading={isLoading}>
          ENTRAR
        </Button>
      </div>
    </form>
  );
}