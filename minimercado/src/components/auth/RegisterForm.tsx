"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button"; 
import { registerUserAction } from "@/src/Server/controllers/UserController"; 

// 🟢 IMPORTANDO O NOSSO MODAL PADRONIZADO
import { ModalAlerta } from "@/src/components/ui/ModalAlerta";

export function RegisterForm() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [perfil, setPerfil] = useState("Operador");
  
  const [isLoading, setIsLoading] = useState(false);

  // 🟢 1. ESTADOS PARA O OLHINHO DAS SENHAS
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  // 🟢 STATE DO MODAL DE ALERTA
  const [modalAlerta, setModalAlerta] = useState({ 
    isOpen: false, 
    mensagem: "", 
    tipo: "success" as "success" | "error" 
  });

  // 🟢 FUNÇÃO PARA CHAMAR O MODAL FÁCIL
  const exibirAlerta = (mensagem: string, tipo: "success" | "error" = "success") => {
    setModalAlerta({ isOpen: true, mensagem, tipo });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (senha !== confirmarSenha) {   
      exibirAlerta("As senhas não coincidem!", "error");
      return;
    }

    setIsLoading(true);

    try {
      const dadosUsuario = { nome, email, senha, profile: perfil };
      
      const resposta = await registerUserAction({ data: dadosUsuario }) as any;

      if (!resposta || resposta.success === false) {
        exibirAlerta(resposta?.message || "Erro desconhecido ao cadastrar.", "error");
      } else {
        exibirAlerta("Usuário cadastrado com sucesso!", "success");
        setNome(""); 
        setEmail(""); 
        setSenha(""); 
        setConfirmarSenha("");
        setPerfil("Operador");
      }

    } catch (error) {
      exibirAlerta("Erro ao conectar com o servidor.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
        
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nome" className="text-sm font-bold text-gray-700">Nome Completo</label>
          <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0D9488] outline-none transition-all" required />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-bold text-gray-700">E-mail</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0D9488] outline-none transition-all" required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* 🟢 CAMPO DE SENHA */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="text-sm font-bold text-gray-700">Senha</label>
            <div className="relative">
              <input 
                id="senha" 
                type={mostrarSenha ? "text" : "password"} 
                value={senha} 
                onChange={(e) => setSenha(e.target.value)} 
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0D9488] outline-none transition-all" 
                required minLength={6} 
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D9488] transition-colors focus:outline-none"
              >
                {mostrarSenha ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>

          {/* 🟢 CAMPO CONFIRMAR SENHA */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmarSenha" className="text-sm font-bold text-gray-700">Confirmar Senha</label>
            <div className="relative">
              <input 
                id="confirmarSenha" 
                type={mostrarConfirmarSenha ? "text" : "password"} 
                value={confirmarSenha} 
                onChange={(e) => setConfirmarSenha(e.target.value)} 
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0D9488] outline-none transition-all" 
                required minLength={6} 
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D9488] transition-colors focus:outline-none"
              >
                {mostrarConfirmarSenha ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="perfil" className="text-sm font-bold text-gray-700">Perfil de Acesso</label>
          <select id="perfil" value={perfil} onChange={(e) => setPerfil(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0D9488] outline-none transition-all cursor-pointer">
            <option value="Operador">Operador</option>
            <option value="Admin">Administrador</option>
          </select>
        </div>

        <div className="flex flex-col items-center gap-3 mt-4">
          <Button type="submit" isLoading={isLoading}>
            CADASTRAR
          </Button>
        </div>
      </form>

      {/* 🟢 MODAL DE ALERTA RENDERIZADO AQUI */}
      <ModalAlerta 
        isOpen={modalAlerta.isOpen}
        mensagem={modalAlerta.mensagem}
        tipo={modalAlerta.tipo}
        onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })}
      />
    </>
  );
}