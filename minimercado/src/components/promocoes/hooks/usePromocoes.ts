import { useState, useEffect, useMemo } from 'react';
import { getAllProducts, updateProduct, createProduct, deleteProduct } from '@/src/Server/controllers/ProductController';
import { getAllCategory } from '@/src/Server/controllers/CategoryController';

import { useImageUpload } from '@/src/components/produtos/hooks/useImageUpload';

export function usePromocoes() {
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [buscaTexto, setBuscaTexto] = useState('');
  
  const [isModalOfertaOpen, setIsModalOfertaOpen] = useState(false);
  const [isModalComboOpen, setIsModalComboOpen] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);

  const [nomeCombo, setNomeCombo] = useState('');
  const [precoCombo, setPrecoCombo] = useState<number | string>('');
  const [categoriaId, setCategoriaId] = useState('');
  const [itensDoCombo, setItensDoCombo] = useState<any[]>([]);
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<string>('');
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState<number>(1);

  const [ofertaProdutoId, setOfertaProdutoId] = useState<string>('');
  const [ofertaPreco, setOfertaPreco] = useState<number | string>('');

  const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensagem: '', tipo: 'success' as 'success' | 'error' });
  const exibirAlerta = (mensagem: string, tipo: 'success' | 'error' = 'success') => {
    setModalAlerta({ isOpen: true, mensagem, tipo });
  };

  // 🟢 NOVO: Estado para controlar o modal de confirmação
  const [modalConfirmacao, setModalConfirmacao] = useState({
    isOpen: false,
    titulo: '',
    mensagem: '',
    onConfirm: () => {}
  });

  // 🟢 NOVO: Função auxiliar para chamar o modal
  const pedirConfirmacao = (titulo: string, mensagem: string, acao: () => void) => {
    setModalConfirmacao({ isOpen: true, titulo, mensagem, onConfirm: acao });
  };

  const imageHook = useImageUpload();
  const [imagemAtualUrl, setImagemAtualUrl] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setIsLoading(true);
    try {
      const [prodResp, catResp] = await Promise.all([
        getAllProducts() as any,
        getAllCategory() as any
      ]);

      if (prodResp?.success) {
        const data = prodResp.data || prodResp.product || prodResp;
        setProdutosDisponiveis(Array.isArray(data) ? data : []);
      }
      
      if (catResp?.success) {
        const catData = catResp.data || catResp.category || [];
        setCategorias(Array.isArray(catData) ? catData : []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const ofertasAtivas = useMemo(() => {
    return produtosDisponiveis.filter(p => p.promo_status === true);
  }, [produtosDisponiveis]);

  const combosCadastrados = useMemo(() => {
    return produtosDisponiveis
      .filter(p => p.combo && p.combo !== 'null' && p.combo !== null)
      .map(c => {
        let rawItens = [];
        try { rawItens = typeof c.combo === 'string' ? JSON.parse(c.combo) : c.combo; } catch(e) {}

        const itensDescricao = rawItens.map((item: any) => {
           const prod = produtosDisponiveis.find(p => p.id === item.product_id);
           return `${item.quantity || item.qty}x ${prod?.name || 'Item Removido'}`;
        }).join(', ');

        const precoOriginal = rawItens.reduce((acc: number, item: any) => {
           const prod = produtosDisponiveis.find(p => p.id === item.product_id);
           return acc + (Number(prod?.price || 0) * (item.quantity || item.qty));
        }, 0);

        return {
           id: c.id,
           name: c.name,
           category_id: c.category_id,
           image: c.image_url || c.image || null,
           itens: itensDescricao,
           preco_original: precoOriginal,
           preco_final: Number(c.price),
           rawItens: rawItens.map((item: any) => {
              const prod = produtosDisponiveis.find(p => p.id === item.product_id);
              return {
                produto_id: item.product_id,
                nome: prod?.name || 'Item Removido',
                quantidade: item.quantity || item.qty,
                preco_unitario: Number(prod?.price || 0),
                subtotal: Number(prod?.price || 0) * (item.quantity || item.qty)
              };
           })
        };
      });
  }, [produtosDisponiveis]);

  const produtosFiltrados = useMemo(() => {
    if (!buscaTexto) return [];
    return produtosDisponiveis.filter(p => 
      p.name.toLowerCase().includes(buscaTexto.toLowerCase())
    ).slice(0, 5); 
  }, [produtosDisponiveis, buscaTexto]);

  const stats = useMemo(() => {
    return { totalOfertas: ofertasAtivas.length, totalCombos: combosCadastrados.length };
  }, [ofertasAtivas, combosCadastrados]);

  const fecharModais = () => {
    setIsModalOfertaOpen(false);
    setIsModalComboOpen(false);
    setIdEditando(null);
    setNomeCombo('');
    setPrecoCombo('');
    setCategoriaId('');
    setItensDoCombo([]);
    setOfertaProdutoId('');
    setOfertaPreco('');
    setBuscaTexto('');
    imageHook.handleRemoveImage();
    setImagemAtualUrl(null);
  };

  const handleAdicionarProdutoNoCombo = () => {
    const produtoEncontrado = produtosDisponiveis.find(p => p.id === Number(produtoSelecionadoId));
    if (produtoEncontrado) {
      setItensDoCombo([...itensDoCombo, {
        produto_id: produtoEncontrado.id,
        nome: produtoEncontrado.name,
        preco_unitario: Number(produtoEncontrado.price),
        quantidade: quantidadeSelecionada,
        subtotal: Number(produtoEncontrado.price) * quantidadeSelecionada
      }]);
      setProdutoSelecionadoId('');
      setBuscaTexto(''); 
      setQuantidadeSelecionada(1);
    }
  };

  const handleEditarCombo = (combo: any) => {
    setIdEditando(combo.id);
    setNomeCombo(combo.name);
    setPrecoCombo(combo.preco_final);
    setCategoriaId(String(combo.category_id || ''));
    setItensDoCombo(combo.rawItens || []);
    setImagemAtualUrl(combo.image); 
    setIsModalComboOpen(true);
  };

  const handleSalvarCombo = async () => {
    if (!nomeCombo || !precoCombo || !categoriaId || itensDoCombo.length === 0) {
      return exibirAlerta("Preencha nome, preço, categoria e adicione produtos ao combo!", 'error');
    }
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      if (idEditando) formData.append('id', idEditando.toString());
      formData.append('name', nomeCombo);
      formData.append('price', precoCombo.toString());
      formData.append('category_id', categoriaId);
      formData.append('stock', '0');
      
      const comboData = itensDoCombo.map(item => ({ product_id: item.produto_id, quantity: item.quantidade }));
      formData.append('combo', JSON.stringify(comboData));

      if (imageHook.image) formData.append('image', imageHook.image);

      let resp = idEditando ? await updateProduct(formData) as any : await createProduct(formData) as any;

      if (resp?.success) {
        exibirAlerta(idEditando ? "Combo atualizado com sucesso!" : "Combo criado com sucesso!", 'success');
        carregarDados();
        fecharModais();
      } else {
        exibirAlerta("Erro: " + (resp?.message || "Ocorreu um erro ao salvar"), 'error');
      }
    } catch(e) {
      exibirAlerta("Erro ao conectar com o servidor.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExcluirCombo = (id: number) => {
    // 🟢 Chamando o Modal em vez do confirm()
    pedirConfirmacao("Excluir Combo?", "Tem certeza que deseja excluir este combo permanentemente?", async () => {
      try {
        const resp = await deleteProduct(id) as any;
        if(resp?.success) {
           exibirAlerta("Combo excluído com sucesso!", 'success');
           carregarDados();
        } else {
           exibirAlerta("Erro ao excluir: " + resp.message, 'error');
        }
      } catch (e) { exibirAlerta("Erro de conexão com o banco.", 'error'); }
    });
  };

  const handleAtivarOferta = async () => {
    if(!ofertaProdutoId || !ofertaPreco) return exibirAlerta("Selecione um produto e digite o preço promocional!", 'error');
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('id', ofertaProdutoId);
      formData.append('promo_status', 'true');
      formData.append('promo_price', ofertaPreco.toString());
      
      const resp = await updateProduct(formData);
      if(resp.success) {
        exibirAlerta("Oferta relâmpago ativada!", 'success');
        carregarDados();
        fecharModais();
      } else {
        exibirAlerta("Erro ao ativar: " + resp.message, 'error');
      }
    } catch (error) { exibirAlerta("Erro de conexão ao ativar oferta.", 'error'); } 
    finally { setIsSubmitting(false); }
  };

  const handleDesativarOferta = (produtoId: number) => {
    // 🟢 Chamando o Modal em vez do confirm()
    pedirConfirmacao("Encerrar Oferta?", "Deseja realmente retirar este produto da promoção?", async () => {
      try {
        const formData = new FormData();
        formData.append('id', produtoId.toString());
        formData.append('promo_status', 'false');
        formData.append('promo_price', '0');
        
        const resp = await updateProduct(formData);
        if(resp.success) {
          exibirAlerta("Oferta encerrada com sucesso!", 'success');
          carregarDados();
        } else { exibirAlerta("Erro ao desativar: " + resp.message, 'error'); }
      } catch (error) { exibirAlerta("Erro de conexão.", 'error'); }
    });
  };

  return {
    dados: { produtosDisponiveis, categorias, isLoading, isSubmitting, ofertasAtivas, combosCadastrados, produtosFiltrados, stats },
    // 🟢 Adicionamos o modalConfirmacao aqui no export dos modais
    modais: { isModalOfertaOpen, setIsModalOfertaOpen, isModalComboOpen, setIsModalComboOpen, fecharModais, modalAlerta, setModalAlerta, modalConfirmacao, setModalConfirmacao },
    comboForm: { idEditando, nomeCombo, setNomeCombo, precoCombo, setPrecoCombo, categoriaId, setCategoriaId, itensDoCombo, setItensDoCombo, produtoSelecionadoId, setProdutoSelecionadoId, quantidadeSelecionada, setQuantidadeSelecionada, buscaTexto, setBuscaTexto, imagemAtualUrl, setImagemAtualUrl, imageHook, handleAdicionarProdutoNoCombo, handleEditarCombo, handleSalvarCombo, handleExcluirCombo },
    ofertaForm: { ofertaProdutoId, setOfertaProdutoId, ofertaPreco, setOfertaPreco, handleAtivarOferta, handleDesativarOferta, buscaTexto, setBuscaTexto }
  };
}