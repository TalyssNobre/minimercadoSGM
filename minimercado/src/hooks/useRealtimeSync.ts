import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 🟢 Adicionamos o "payload: any" aqui para repassar os dados exatos da mudança
export function useRealtimeSync(tabela: string, onUpdateCallback?: (payload: any) => void) {
  const router = useRouter();

  useEffect(() => {
    // Inscreve a página para ouvir a tabela específica
    const channel = supabase
      .channel(`mudancas-${tabela}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tabela },
        (payload) => {
          // 🟢 console.log REMOVIDO DAQUI PARA MAIOR SEGURANÇA NO FRONT-END
          
          if (onUpdateCallback) {
            onUpdateCallback(payload); // Repassando a informação da mudança para a página
          } else {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tabela, onUpdateCallback, router]);
}