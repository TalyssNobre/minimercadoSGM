import useSWR from 'swr';
import { getLoggedUserController } from '@/src/Server/controllers/UserController';

export function useUsuario() {
  // A string 'usuarioLogado' é a "chave" mágica do SWR. 
  // Qualquer componente que pedir essa mesma chave ao mesmo tempo vai receber o mesmo dado, sem duplicar a requisição!
  const { data, error, isLoading } = useSWR('usuarioLogado', async () => {
    const resposta = await getLoggedUserController();
    return resposta; 
  }, {
    dedupingInterval: 10000, // Se outro componente pedir o usuário nos próximos 10 segundos, o SWR nem vai no banco, entrega da memória.
    revalidateOnFocus: false, // Evita ficar recarregando toda hora que você muda de aba no navegador
  });

  // Mantemos exatamente a mesma lógica que você tinha na Sidebar original
  let cargoUsuario: string | null = null;
  
  if (!isLoading) {
    if (data?.success && data?.user?.profile) {
      cargoUsuario = data.user.profile;
    } else {
      cargoUsuario = 'Operador';
    }
  }

  if (error) {
    cargoUsuario = 'Operador';
  }

  // Exportamos os dados mastigados para qualquer página ou componente usar
  return {
    user: data?.user || null,
    cargoUsuario,
    isLoading,
    isError: !!error
  };
}