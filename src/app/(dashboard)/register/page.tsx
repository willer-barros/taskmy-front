"use client";
import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, ArrowLeft, Loader2, Mail, Phone, Hash, Briefcase, User as UserIcon } from 'lucide-react';

// URL base da sua API de autenticação
const AUTH_API_URL = "http://192.168.0.107:8000";

// Função utilitária para simular useSearchParams (lê o 'id' da URL)
const getUserIdFromUrl = () => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
};


export default function UserManagementPage() {
  // Simula useRouter, mas usa navegação direta do navegador
  // CORREÇÃO: Usando hash para evitar erros de URL relativa em ambientes sandboxed.
  const navigateTo = (path) => {
      // Usa hash-based routing: /path -> #/path
      window.location.hash = path.startsWith('/') ? path : `/${path}`;
  }
  
  const userId = getUserIdFromUrl();
  const isEditing = !!userId;

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    role: '',
    company_id: null, // Nova propriedade para armazenar a ID da empresa
  });
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Manipulador genérico de mudança de formulário
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Efeito 1: Obter ID da empresa do usuário logado (executa apenas na CRIAÇÃO)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        // CORREÇÃO: Usando a nova função navigateTo com rota 'login'
        navigateTo('login');
        return;
    }
    
    // Se estiver editando, pula esta parte (a empresa já está definida no back-end)
    if (isEditing) {
        setIsAuthReady(true);
        return;
    }

    const fetchCompanyId = async () => {
        try {
            // Assumimos que existe um endpoint de perfil /me/ que retorna a company_id
            const res = await fetch(`${AUTH_API_URL}/me/`, { 
                headers: { 'Authorization': `Token ${token}` }
            });

            if (!res.ok) {
                // Se não conseguir obter o perfil, não conseguirá criar usuários.
                throw new Error("Não foi possível carregar o ID da empresa do usuário logado.");
            }

            const profileData = await res.json();
            
            // ATENÇÃO: Assumindo que o campo da ID da empresa no seu objeto de perfil é 'company_id'
            const companyId = profileData.company_id; 
            
            if (!companyId) {
                throw new Error("ID da empresa não encontrada no perfil do usuário.");
            }

            setFormData(prev => ({ ...prev, company_id: companyId }));
            setIsAuthReady(true);

        } catch (err) {
            setError(err.message);
            setIsAuthReady(false);
        }
    };
    
    fetchCompanyId();

  }, [isEditing]);

  // Efeito 2: Pré-preencher o formulário se estiver no modo de edição
  useEffect(() => {
    if (isEditing) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        // CORREÇÃO: Usando a nova função navigateTo com rota 'login'
        navigateTo('login');
        return;
      }

      setLoading(true);
      setError(null);
      
      const fetchUserData = async () => {
        try {
            // Chamada à API para obter dados do usuário para edição
            const res = await fetch(`${AUTH_API_URL}/users/${userId}/`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.detail || "Falha ao carregar dados do usuário.");
            }

            const userData = await res.json();
            
            // Preenche os campos do formulário para edição
            setFormData(prev => ({ 
                ...prev, 
                username: userData.username || '',
                full_name: userData.full_name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                cpf: userData.cpf || '',
                role: userData.role || '',
                company_id: userData.company_id || null, // Mantém a company_id do usuário que está sendo editado
            }));
            setIsAuthReady(true); // Pronto para edição após carregar os dados
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [userId, isEditing]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validação de Senha
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }
    
    // Verifica se os campos obrigatórios para criação foram preenchidos
    if (!isEditing && (!formData.company_id || !formData.full_name || !formData.email || !formData.role)) {
        setError("Todos os campos de informação pessoal (Nome, Email, Cargo) são obrigatórios.");
        setLoading(false);
        return;
    }


    const token = localStorage.getItem('authToken');
    const method = isEditing ? 'PATCH' : 'POST';
    const endpoint = isEditing ? `users/${userId}/` : 'register/';
    const url = `${AUTH_API_URL}/${endpoint}`;
    
    // Constrói o corpo da requisição com os dados do formulário
    const { confirmPassword, ...dataToSend } = formData;
    
    // Remove a senha se estiver vazia (modo edição)
    if (isEditing && !dataToSend.password) {
        delete dataToSend.password;
    }
    
    // Garante que o company_id só é enviado na CRIAÇÃO (ou mantido na EDIÇÃO se seu backend esperar)
    if (isEditing) {
        delete dataToSend.company_id; // Geralmente, não se altera a empresa ao editar um usuário.
    } else if (!dataToSend.company_id) {
        // Se no modo criação, mas falhou ao obter o company_id
        setError("Não foi possível determinar a empresa do usuário logado. Recarregue a página.");
        setLoading(false);
        return;
    }


    try {
      const headers = { 'Content-Type': 'application/json' };
      
      if (isEditing) {
          // Adicionar token para edição (requer autenticação)
          headers['Authorization'] = `Token ${token}`;
      }

      const res = await fetch(url, {
        method: method,
        headers: headers,
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = Object.values(data)[0] || data.detail || "Ocorreu um erro na requisição.";
        throw new Error(errorMsg);
      }

      if (isEditing) {
        setSuccess("Informações do usuário atualizadas com sucesso!");
        // Não limpa o formulário na edição
      } else {
        setSuccess("Usuário criado com sucesso e vinculado à sua empresa!");
        // Limpa o formulário, exceto a company_id
        setFormData(prev => ({ 
            username: '',
            password: '',
            confirmPassword: '',
            full_name: '',
            email: '',
            phone: '',
            cpf: '',
            role: '',
            company_id: prev.company_id, // Mantém a company_id para criar outro
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const title = isEditing ? 'Editar Usuário' : 'Novo Cadastro';
  const submitText = isEditing ? 'Salvar Alterações' : 'Cadastrar';
  const Icon = isEditing ? UserCheck : UserPlus;

  const isDisabled = loading || (!isEditing && !isAuthReady);
  
  // Exibe um estado de carregamento inicial enquanto busca o ID da empresa
  if (!isAuthReady && !isEditing) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#1e293b] text-white">
            <Loader2 size={32} className="animate-spin text-indigo-400 mb-4" />
            <p className="text-lg">Carregando informações da empresa...</p>
            {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>
      );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#1e293b] py-12">
      <div className="w-full max-w-2xl bg-[#2c3e5a] shadow-2xl rounded-2xl p-8 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <button 
                // CORREÇÃO: Usando a nova função navigateTo com paths de hash
                onClick={() => navigateTo(isEditing ? '' : 'login')}
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700"
                title="Voltar"
            >
                <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Icon size={28} className="text-indigo-400" />
              {title}
            </h1>
            <div>{/* Espaçador para centralizar o título */}</div>
        </div>

        {/* Mensagens de feedback */}
        {loading && (
          <div className="flex items-center justify-center p-4 mb-4 text-indigo-400 bg-indigo-900/50 rounded-xl">
            <Loader2 size={20} className="animate-spin mr-2" />
            Processando...
          </div>
        )}
        {error && (
          <div className="p-4 mb-4 text-red-400 bg-red-900/50 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 mb-4 text-green-400 bg-green-900/50 rounded-xl">
            {success}
          </div>
        )}
        
        {/* Formulário */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Seção de Autenticação */}
            <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-indigo-400 border-b border-indigo-700 pb-2 mb-4">Dados de Acesso</h2>
            </div>
            
            <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300 flex items-center"><UserIcon size={16} className="mr-1"/> Nome de Usuário *</span>
                <input
                type="text"
                name="username"
                placeholder="Digite o nome de usuário"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
            </label>

            <div className='md:col-span-2 text-sm text-slate-400'>
                {isEditing ? 'Preencha os campos abaixo apenas se desejar alterar a senha.' : 'A senha é obrigatória para novos cadastros.'}
            </div>

            <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Nova Senha {isEditing ? '(Opcional)' : '*'}</span>
                <input
                type="password"
                name="password"
                placeholder={isEditing ? 'Deixe em branco para não alterar' : 'Digite a senha'}
                value={formData.password}
                onChange={handleChange}
                required={!isEditing} // Requer senha apenas na criação
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
            </label>

            <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300">Confirmar Senha</span>
                <input
                type="password"
                name="confirmPassword"
                placeholder="Confirme a senha"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!!formData.password} // Requer confirmação se a senha foi digitada
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
            </label>
            
            {/* Seção de Dados Pessoais e Profissionais */}
            <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-indigo-400 border-b border-indigo-700 pb-2 mb-4 mt-6">Informações Pessoais e Profissionais</h2>
            </div>

            {/* Nome Completo */}
            <label className="flex flex-col gap-2 md:col-span-2">
                <span className="text-sm font-medium text-slate-300">Nome Completo *</span>
                <input
                type="text"
                name="full_name"
                placeholder="Nome completo do usuário"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
            </label>

            {/* Email e Telefone */}
            <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300 flex items-center"><Mail size={16} className="mr-1"/> Email *</span>
                <input
                type="email"
                name="email"
                placeholder="email@empresa.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
            </label>
            
            <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300 flex items-center"><Phone size={16} className="mr-1"/> Telefone</span>
                <input
                type="tel"
                name="phone"
                placeholder="(99) 99999-9999"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
            </label>
            
            {/* CPF e Cargo */}
            <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300 flex items-center"><Hash size={16} className="mr-1"/> CPF</span>
                <input
                type="text"
                name="cpf"
                placeholder="Apenas números"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
            </label>

            <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-300 flex items-center"><Briefcase size={16} className="mr-1"/> Cargo *</span>
                <input
                type="text"
                name="role"
                placeholder="Ex: Gerente de Projetos"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
            </label>

            {/* Campo Oculto da Empresa (apenas na CRIAÇÃO) */}
            {!isEditing && formData.company_id && (
                <div className="md:col-span-2 text-sm text-slate-400 pt-2">
                    <p>
                        Este novo usuário será automaticamente vinculado à sua empresa
                        (ID da Empresa: <span className='font-bold text-indigo-400'>{formData.company_id}</span>).
                    </p>
                </div>
            )}
          </div>


          <button
            type="submit"
            disabled={isDisabled}
            className="w-full bg-indigo-600 text-white font-semibold py-3 mt-8 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/50 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 size={20} className="animate-spin mr-2" /> : <Icon size={20} className="mr-2" />}
            {loading ? 'Aguarde...' : submitText}
          </button>
        </form>
        
        {/* Link para login se estiver em modo de criação */}
        {!isEditing && (
            <div className="mt-6 text-center text-slate-400">
                <p>Já tem uma conta? <a href="#/login" className="text-indigo-400 hover:underline font-medium">Faça o login</a></p>
            </div>
        )}
      </div>
    </div>
  );
}
