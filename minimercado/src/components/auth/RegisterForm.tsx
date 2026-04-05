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

  // 🟢 STATE DO MODAL DE ALERTA (Substituindo o estado antigo de mensagem)
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
          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="text-sm font-bold text-gray-700">Senha</label>
            <input id="senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0D9488] outline-none transition-all" required minLength={6} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="confirmarSenha" className="text-sm font-bold text-gray-700">Confirmar Senha</label>
            <input id="confirmarSenha" type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0D9488] outline-none transition-all" required minLength={6} />
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