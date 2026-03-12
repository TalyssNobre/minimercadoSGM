"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "../ui/Button"; 

export function RegisterForm() {
const [nome, setNome] = useState("");
const [email, setEmail] = useState("");
const [senha, setSenha] = useState("");
const [confirmarSenha, setConfirmarSenha] = useState("");
const [perfil, setPerfil] = useState("OPERADOR");
const [isLoading, setIsLoading] = useState(false);

const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (senha !== confirmarSenha) {
    alert("As senhas não coincidem!");
    return;
    }

    setIsLoading(true);

    try {
    console.log("Novo Cadastro:", { nome, email, senha, perfil });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
    console.error(error);
    } finally {
    setIsLoading(false);
    }
  };

  return (
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
    <div className="flex flex-col gap-1.5">
    <label htmlFor="senha" className="text-sm font-bold text-gray-700">Senha</label>
    <input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0D9488] outline-none transition-all" required />
    </div>

        <div className="flex flex-col gap-1.5">
        <label htmlFor="confirmarSenha" className="text-sm font-bold text-gray-700">Confirmar Senha</label>
        <input id="confirmarSenha" type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0D9488] outline-none transition-all" required />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="perfil" className="text-sm font-bold text-gray-700">Perfil de Acesso</label>
        <select id="perfil" value={perfil} onChange={(e) => setPerfil(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0D9488] outline-none transition-all cursor-pointer">
          <option value="OPERADOR">Operador</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>

      <div className="flex flex-col items-center gap-3 mt-4">
        <Button type="submit" isLoading={isLoading}>
          CADASTRAR
        </Button>
        
    <Link href="/" className="text-sm text-gray-600 hover:text-[#0D9488] font-medium transition-colors mt-2">
    Já tem uma conta? <span className="font-bold text-[#D4AF37] hover:text-yellow-600 uppercase">Faça login</span>
    </Link>
    </div>

    </form>
  );
}