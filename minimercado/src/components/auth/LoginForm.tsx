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
  
  // 🟢 1. Novo Estado para controlar a visualização da senha
  const [mostrarSenha, setMostrarSenha] = useState(false); 

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
        
        {/* 🟢 2. Container "relative" para podermos posicionar o olho em cima do input */}
        <div className="relative">
          <input 
            id="senha" 
            // 🟢 3. Alterna o tipo do input baseado no estado
            type={mostrarSenha ? "text" : "password"} 
            placeholder="••••••••"
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            // 🟢 4. Adicionei um padding-right (pr-12) maior para o texto não passar por cima do olho
            className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0D9488] outline-none transition-all" 
            required 
          />
          
          {/* 🟢 5. O Botão do Olhinho */}
          <button
            type="button" // Importante ser "button" para não submeter o formulário
            onClick={() => setMostrarSenha(!mostrarSenha)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D9488] transition-colors focus:outline-none"
            title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
          >
            {mostrarSenha ? (
              // Olho Fechado (riscado)
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              // Olho Aberto
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 mt-2">
        <Button type="submit" isLoading={isLoading}>
          ENTRAR
        </Button>
      </div>
    </form>
  );
}