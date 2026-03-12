import Image from "next/image";
import { RegisterForm } from "../../components/auth/RegisterForm";

export default function CadastroPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-white">
      
      {/* LADO ESQUERDO: Área da Logo */}
      <div className="w-full md:w-1/2 min-h-[25vh] md:min-h-screen flex items-center justify-center bg-fundo border-b md:border-b-0 md:border-r border-gray-200 p-8">
        <div className="w-48 sm:w-64 md:w-80 lg:w-96 flex justify-center">
          <Image
            src="/logo.svg"
            alt="Logo Segue-Me"
            width={400}
            height={400}
            priority
            className="w-full h-auto object-contain drop-shadow-md"
          />
        </div>
      </div>

      {/* LADO DIREITO: Área do Formulário COM A SUA IMAGEM DE FUNDO SVG */}
      <div className="w-full md:w-1/2 relative flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-[url('/fundologin.svg')] bg-cover bg-center bg-no-repeat">
        
        <div className="absolute inset-0 bg-verde-agua/10 backdrop-blur-[2px]"></div>

        {/* Card do Formulário (Glassmorphism) */}
        <div className="w-full max-w-lg flex flex-col items-center relative z-10 bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-2xl shadow-2xl border border-white/20">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center tracking-tight">
            Crie sua conta
          </h1>

          <RegisterForm />
        </div>

      </div>

    </main>
  );
}