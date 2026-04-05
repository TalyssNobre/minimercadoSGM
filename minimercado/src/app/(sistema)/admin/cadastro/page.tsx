import { RegisterForm } from "../../../../components/auth/RegisterForm";


export default function CadastroPage() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-10 max-w-2xl mx-auto mt-4 md:mt-8 relative">
      
      {/* CABEÇALHO LIMPO E PADRONIZADO */}
      <div className="mb-8 border-b border-gray-100 pb-5">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
          Cadastro de Usuários
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Adicione novos operadores ou administradores para acessar o sistema.
        </p>
      </div>

      {/* FORMULÁRIO (Nossa lógica intacta fica toda aqui dentro) */}
      <RegisterForm />
      
    </div>
  );
}