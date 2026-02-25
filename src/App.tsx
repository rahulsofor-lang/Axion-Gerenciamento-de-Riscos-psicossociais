/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  LogOut, 
  Plus, 
  X, 
  Eye, 
  EyeOff,
  ChevronRight,
  Save,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import { IMaskInput } from 'react-imask';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Company, TechnicalResponsible, DomainResult, RiskLevel, Assessment } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { QUESTIONS, RESPONSE_OPTIONS } from './constants';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  ImageRun, 
  AlignmentType, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType 
} from 'docx';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type View = 'home' | 'register' | 'login-manager' | 'manager-panel' | 'collaborator-login' | 'collaborator-panel' | 'tech-login' | 'tech-panel';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleLogout = () => {
    setCurrentCompany(null);
    setView('home');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
            <img 
              src="https://i.postimg.cc/LqY9MB95/Sem-titulo.png" 
              alt="AXION Logo" 
              className="h-12 w-auto"
              referrerPolicy="no-referrer"
            />
          </div>
          
          {view !== 'home' && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {message && (
            <motion.div 
              key="message-alert"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={cn(
                "fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full shadow-lg text-white font-medium flex items-center gap-2",
                message.type === 'success' ? "bg-emerald-500" : "bg-rose-500"
              )}
            >
              {message.text}
            </motion.div>
          )}

          {view === 'home' && (
            <motion.div key="view-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HomeView setView={setView} />
            </motion.div>
          )}
          {view === 'register' && (
            <motion.div key="view-register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <RegisterView 
                setView={setView} 
                showMessage={showMessage} 
                setCurrentCompany={setCurrentCompany}
                editCompany={currentCompany}
              />
            </motion.div>
          )}
          {view === 'login-manager' && (
            <motion.div key="view-login-manager" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoginManagerView 
                setView={setView} 
                showMessage={showMessage} 
                setCurrentCompany={setCurrentCompany} 
              />
            </motion.div>
          )}
          {view === 'manager-panel' && currentCompany && (
            <motion.div key="view-manager-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ManagerPanelView 
                company={currentCompany} 
                setView={setView} 
                showMessage={showMessage}
              />
            </motion.div>
          )}
          {view === 'tech-login' && (
            <motion.div key="view-tech-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TechLoginView setView={setView} showMessage={showMessage} />
            </motion.div>
          )}
          {view === 'tech-panel' && (
            <motion.div key="view-tech-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TechPanelView setView={setView} showMessage={showMessage} />
            </motion.div>
          )}
          {view === 'collaborator-login' && (
            <motion.div key="view-collaborator-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CollaboratorLoginView setView={setView} showMessage={showMessage} setCurrentCompany={setCurrentCompany} />
            </motion.div>
          )}
          {view === 'collaborator-panel' && currentCompany && (
            <motion.div key="view-collaborator-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CollaboratorPanelView company={currentCompany} setView={setView} showMessage={showMessage} />
            </motion.div>
          )}
          {view === 'assessments' && (
            <motion.div key="view-assessments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
              <h2 className="text-2xl font-bold text-slate-400 italic">Módulo de Avaliações em Desenvolvimento</h2>
              <button onClick={() => setView('home')} className="mt-4 text-blue-600 font-bold">Voltar</button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm">
        <p>© {new Date().getFullYear()} AXION - NR1 Análise de Riscos Psicossociais</p>
      </footer>
    </div>
  );
}

function HomeView({ setView }: { setView: (v: View) => void }) {
  const buttons = [
    { 
      id: 'collaborator-login', 
      label: 'COLABORADOR', 
      desc: 'Acesse para realizar sua avaliação de risco psicossocial.',
      icon: Users, 
      color: 'from-orange-500 to-orange-600',
      shadow: 'shadow-orange-200',
      span: 'md:col-span-2'
    },
    { 
      id: 'login-manager', 
      label: 'GESTOR', 
      desc: 'Gerencie sua empresa, setores e acompanhe o progresso.',
      icon: BarChart3, 
      color: 'from-slate-800 to-slate-900',
      shadow: 'shadow-slate-200'
    },
    { 
      id: 'tech-login', 
      label: 'RESPONSÁVEL TÉCNICO', 
      desc: 'Análise detalhada de dados e emissão de relatórios técnicos.',
      icon: ClipboardCheck, 
      color: 'from-indigo-600 to-indigo-700',
      shadow: 'shadow-indigo-200'
    },
    { 
      id: 'register', 
      label: 'REGISTRAR EMPRESA', 
      desc: 'Cadastre uma nova organização no sistema Axion.',
      icon: Building2, 
      color: 'from-blue-600 to-blue-700',
      shadow: 'shadow-blue-200'
    },
    { 
      id: 'assessments', 
      label: 'AVALIAÇÕES', 
      desc: 'Módulo de consulta e histórico de avaliações.',
      icon: ClipboardCheck, 
      color: 'from-emerald-600 to-emerald-700',
      shadow: 'shadow-emerald-200'
    },
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <img 
          src="https://i.postimg.cc/LqY9MB95/Sem-titulo.png" 
          alt="AXION Logo" 
          className="h-32 md:h-40 w-auto mx-auto mb-6 drop-shadow-xl"
          referrerPolicy="no-referrer"
        />
        <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
          Plataforma especializada em Análise de Riscos Psicossociais conforme a NR1. 
          Gestão inteligente para ambientes de trabalho mais saudáveis.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {buttons.map((btn, i) => (
          <motion.button
            key={btn.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setView(btn.id as View)}
            className={cn(
              "relative overflow-hidden flex flex-col items-start p-8 rounded-3xl transition-all transform hover:scale-[1.02] active:scale-[0.98] text-white gap-4 group text-left",
              "bg-gradient-to-br", btn.color,
              "shadow-xl", btn.shadow,
              btn.span
            )}
          >
            <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform">
              <btn.icon size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight mb-1">{btn.label}</h3>
              <p className="text-white/80 text-sm font-medium leading-relaxed">
                {btn.desc}
              </p>
            </div>
            <ChevronRight className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

function RegisterView({ 
  setView, 
  showMessage, 
  setCurrentCompany,
  editCompany 
}: { 
  setView: (v: View) => void, 
  showMessage: (t: string, type?: 'success' | 'error') => void,
  setCurrentCompany: (c: Company) => void,
  editCompany?: Company | null
}) {
  const [formData, setFormData] = useState({
    name: editCompany?.name || '',
    cnpj: editCompany?.cnpj || '',
    employeeCount: editCompany?.employeeCount || 0,
    password: '',
    confirmPassword: '',
  });
  const [sectors, setSectors] = useState<string[]>(editCompany?.sectors || []);
  const [functions, setFunctions] = useState<string[]>(editCompany?.functions || []);
  const [sectorInput, setSectorInput] = useState('');
  const [functionInput, setFunctionInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateAccessCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `#EMP ${result}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCompany && formData.password !== formData.confirmPassword) {
      showMessage('As senhas não coincidem!', 'error');
      return;
    }

    setLoading(true);
    try {
      const accessCode = editCompany?.accessCode || generateAccessCode();
      const companyData: Company = {
        name: formData.name,
        cnpj: formData.cnpj,
        employeeCount: Number(formData.employeeCount),
        sectors,
        functions,
        accessCode,
        createdAt: editCompany?.createdAt || Date.now(),
      };

      if (!editCompany) {
        companyData.password = formData.password;
        const docRef = await addDoc(collection(db, 'companies'), companyData);
        const newCompany = { ...companyData, id: docRef.id };
        setCurrentCompany(newCompany);
        alert(`Empresa salva com sucesso!\n\nCÓDIGO DE ACESSO: ${accessCode}\n\nPor favor, grave este código. Ele servirá como senha para acessar o painel dos colaboradores e do gestor.`);
      } else {
        await updateDoc(doc(db, 'companies', editCompany.id!), {
          name: formData.name,
          cnpj: formData.cnpj,
          employeeCount: Number(formData.employeeCount),
          sectors,
          functions,
        });
        setCurrentCompany({ ...editCompany, ...companyData });
        showMessage('Empresa atualizada com sucesso!');
      }

      setView('manager-panel');
    } catch (error) {
      console.error(error);
      showMessage('Erro ao salvar empresa.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addSector = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && sectorInput.trim()) {
      e.preventDefault();
      if (!sectors.includes(sectorInput.trim())) {
        setSectors([...sectors, sectorInput.trim()]);
      }
      setSectorInput('');
    }
  };

  const addFunction = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && functionInput.trim()) {
      e.preventDefault();
      if (!functions.includes(functionInput.trim())) {
        setFunctions([...functions, functionInput.trim()]);
      }
      setFunctionInput('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setView('home')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800">
          {editCompany ? 'Editar Empresa' : 'Registrar Empresa'}
        </h2>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nome da Empresa</label>
            <input 
              required
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Axion Soluções"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">CNPJ</label>
            <IMaskInput
              mask="00.000.000/0000-00"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.cnpj}
              onAccept={(value: string) => setFormData({...formData, cnpj: value})}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Número de Colaboradores</label>
            <input 
              required
              type="number"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={formData.employeeCount || ''}
              onChange={e => setFormData({...formData, employeeCount: parseInt(e.target.value) || 0})}
              placeholder="Quantidade de avaliações liberadas"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Cadastrar Setores (Pressione Enter)</label>
            <input 
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={sectorInput}
              onChange={e => setSectorInput(e.target.value)}
              onKeyDown={addSector}
              placeholder="Digite o nome do setor e aperte Enter"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {sectors.map((s, i) => (
                <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2">
                  {s}
                  <button type="button" onClick={() => setSectors(sectors.filter((_, idx) => idx !== i))}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Cadastrar Funções (Pressione Enter)</label>
            <input 
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={functionInput}
              onChange={e => setFunctionInput(e.target.value)}
              onKeyDown={addFunction}
              placeholder="Digite o nome da função e aperte Enter"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {functions.map((f, i) => (
                <span key={i} className="bg-orange-50 text-orange-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2">
                  {f}
                  <button type="button" onClick={() => setFunctions(functions.filter((_, idx) => idx !== i))}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {!editCompany && (
            <>
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Senha do Gestor</label>
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmar Senha</label>
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </>
          )}
        </div>

        <div className="pt-4">
          <button 
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : (
              <>
                <Save size={20} />
                {editCompany ? 'SALVAR ALTERAÇÕES' : 'SALVAR INFORMAÇÕES'}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function LoginManagerView({ 
  setView, 
  showMessage, 
  setCurrentCompany 
}: { 
  setView: (v: View) => void, 
  showMessage: (t: string, type?: 'success' | 'error') => void,
  setCurrentCompany: (c: Company) => void 
}) {
  const [accessCode, setAccessCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const q = query(
        collection(db, 'companies'), 
        where('accessCode', '==', accessCode.toUpperCase().trim())
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        showMessage('Código de acesso não encontrado.', 'error');
        return;
      }

      const companyDoc = querySnapshot.docs[0];
      const companyData = companyDoc.data() as Company;

      if (companyData.password === password) {
        setCurrentCompany({ ...companyData, id: companyDoc.id });
        setView('manager-panel');
      } else {
        showMessage('Senha incorreta.', 'error');
      }
    } catch (error) {
      console.error(error);
      showMessage('Erro ao realizar login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-8 mt-12"
    >
      <div className="text-center mb-8">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 size={32} className="text-slate-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Acesso do Gestor</h2>
        <p className="text-slate-500 mt-2">Entre com suas credenciais para gerenciar sua empresa.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Código de Acesso</label>
          <input 
            required
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all uppercase"
            value={accessCode}
            onChange={e => setAccessCode(e.target.value)}
            placeholder="#EMP XXXXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Senha</label>
          <input 
            required
            type="password"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 transition-all disabled:opacity-50"
        >
          {loading ? 'Entrando...' : 'ACESSAR PAINEL'}
        </button>

        <button 
          type="button"
          onClick={() => setView('home')}
          className="w-full text-slate-500 font-medium hover:text-slate-800 transition-colors"
        >
          Voltar para Início
        </button>
      </form>
    </motion.div>
  );
}

function ManagerPanelView({ 
  company, 
  setView, 
  showMessage 
}: { 
  company: Company, 
  setView: (v: View) => void, 
  showMessage: (t: string) => void 
}) {
  const [stats, setStats] = useState({
    total: 0,
    bySector: {} as Record<string, number>
  });

  useEffect(() => {
    // In a real app, we would listen to assessments collection
    // For now, we'll mock some data or just show 0
    const q = query(collection(db, 'assessments'), where('companyId', '==', company.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts: Record<string, number> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        counts[data.sector] = (counts[data.sector] || 0) + 1;
      });
      setStats({
        total: snapshot.size,
        bySector: counts
      });
    });

    return () => unsubscribe();
  }, [company.id]);

  const shareOnWhatsApp = () => {
    const appUrl = window.location.origin;
    const message = `Olá equipe ${company.name}!\n\nAcesse o link abaixo, baixe o app e participe da Avaliação de Riscos Psicossociais da NR-1. Assim você contribui para o bem-estar da nossa empresa.\n\nSua participação é essencial para essa virada de chave!\n\nLink de Acesso: ${appUrl}\n\nUse esse código para acessar a Avaliação: ${company.accessCode}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{company.name}</h2>
          <p className="text-slate-500 font-medium mt-1">Código de Acesso: <span className="text-blue-600 font-bold">{company.accessCode}</span></p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={shareOnWhatsApp}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center gap-2"
          >
            <MessageCircle size={20} />
            CONVIDAR COLABORADORES
          </button>
          <button 
            onClick={() => {
              localStorage.setItem('axion_kiosk_mode', company.accessCode);
              setView('collaborator-login');
            }}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-100 transition-all flex items-center gap-2"
          >
            <Users size={20} />
            MODO QUIOSQUE
          </button>
          <button 
            onClick={() => setView('register')}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center gap-2"
          >
            EDITAR EMPRESA
          </button>
          <button 
            onClick={() => setView('home')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all"
          >
            SAIR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-blue-500">
          <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Total de Colaboradores</p>
          <p className="text-4xl font-black text-slate-800 mt-2">{company.employeeCount}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-emerald-500">
          <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Avaliações Respondidas</p>
          <p className="text-4xl font-black text-slate-800 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-orange-500">
          <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Progresso Geral</p>
          <p className="text-4xl font-black text-slate-800 mt-2">
            {company.employeeCount > 0 ? Math.round((stats.total / company.employeeCount) * 100) : 0}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800">Participação por Setor</h3>
          <Users size={20} className="text-slate-400" />
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {company.sectors.length > 0 ? (
              company.sectors.map((sector, i) => {
                const count = stats.bySector[sector] || 0;
                const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-slate-700">{sector}</span>
                      <span className="text-sm font-medium text-slate-500">{count} respondentes ({percentage}%)</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center py-8 text-slate-400 italic">Nenhum setor cadastrado.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CollaboratorLoginView({ setView, showMessage, setCurrentCompany }: { setView: (v: View) => void, showMessage: (t: string, type?: 'success' | 'error') => void, setCurrentCompany: (c: Company) => void }) {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const normalizedCode = accessCode.toUpperCase().trim();
    const isKiosk = localStorage.getItem('axion_kiosk_mode') === normalizedCode;

    if (!isKiosk && localStorage.getItem(`axion_responded_${normalizedCode}`)) {
      showMessage('A AVALIAÇÃO JÁ FOI RESPONDIDA, OBRIGADO', 'error');
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, 'companies'), 
        where('accessCode', '==', normalizedCode)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        showMessage('Código da empresa não encontrado.', 'error');
        return;
      }

      const companyDoc = querySnapshot.docs[0];
      const companyData = companyDoc.data() as Company;
      
      setCurrentCompany({ ...companyData, id: companyDoc.id });
      setView('collaborator-panel');
    } catch (error) {
      console.error(error);
      showMessage('Erro ao validar código.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-8 mt-12"
    >
      <div className="text-center mb-8">
        <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users size={32} className="text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Acesso do Colaborador</h2>
        <p className="text-slate-500 mt-2">Insira o código fornecido pela sua empresa.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Código da Empresa</label>
          <input 
            required
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all uppercase"
            value={accessCode}
            onChange={e => setAccessCode(e.target.value)}
            placeholder="#EMP XXXXXX"
          />
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 transition-all disabled:opacity-50"
        >
          {loading ? 'Validando...' : 'INICIAR AVALIAÇÃO'}
        </button>

        <button 
          type="button"
          onClick={() => setView('home')}
          className="w-full text-slate-500 font-medium hover:text-slate-800 transition-colors"
        >
          Voltar para Início
        </button>
      </form>
    </motion.div>
  );
}

function CollaboratorPanelView({ company, setView, showMessage }: { company: Company, setView: (v: View) => void, showMessage: (t: string, type?: 'success' | 'error') => void }) {
  const [step, setStep] = useState<'selection' | 'questions'>('selection');
  const [selection, setSelection] = useState({ sector: '', function: '' });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection.sector || !selection.function) {
      showMessage('Selecione seu setor e função.', 'error');
      return;
    }
    setStep('questions');
  };

  const handleAnswer = (value: number) => {
    if (loading) return;
    const newResponses = { ...responses, [`P${currentQuestionIndex + 1}`]: value };
    setResponses(newResponses);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishAssessment(newResponses);
    }
  };

  const finishAssessment = async (finalResponses: Record<string, number>) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'assessments'), {
        companyId: company.id,
        sector: selection.sector,
        function: selection.function,
        timestamp: Date.now(),
        responses: finalResponses
      });
      
      localStorage.setItem(`axion_responded_${company.accessCode}`, 'true');
      setFinished(true);
    } catch (error) {
      console.error(error);
      showMessage('Erro ao salvar avaliação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (finished) {
    const isKiosk = localStorage.getItem('axion_kiosk_mode') === company.accessCode;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-12 text-center mt-12"
      >
        <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ClipboardCheck size={40} className="text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Avaliação concluída com sucesso, obrigado pela sua participação</h2>
        <button 
          onClick={() => {
            if (isKiosk) {
              setFinished(false);
              setStep('selection');
              setResponses({});
              setCurrentQuestionIndex(0);
              setSelection({ sector: '', function: '' });
            } else {
              setView('home');
            }
          }}
          className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg"
        >
          {isKiosk ? 'NOVA AVALIAÇÃO' : 'VOLTAR AO INÍCIO'}
        </button>
        {isKiosk && (
          <button 
            onClick={() => {
              localStorage.removeItem('axion_kiosk_mode');
              setView('home');
            }}
            className="mt-4 w-full text-slate-500 font-medium hover:text-slate-800 transition-colors"
          >
            Sair do Modo Quiosque
          </button>
        )}
      </motion.div>
    );
  }

  if (step === 'selection') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-8 mt-12"
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Identificação</h2>
        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Seu Setor</label>
            <select 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              value={selection.sector}
              onChange={e => setSelection({...selection, sector: e.target.value})}
            >
              <option value="">Selecione o setor</option>
              {company.sectors.map((s, i) => <option key={i} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Sua Função</label>
            <select 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              value={selection.function}
              onChange={e => setSelection({...selection, function: e.target.value})}
            >
              <option value="">Selecione a função</option>
              {company.functions.map((f, i) => <option key={i} value={f}>{f}</option>)}
            </select>
          </div>
          <button 
            type="submit"
            className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg"
          >
            INICIAR PERGUNTAS
          </button>
        </form>
      </motion.div>
    );
  }

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Progress Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => currentQuestionIndex > 0 ? setCurrentQuestionIndex(currentQuestionIndex - 1) : setStep('selection')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <span className="text-slate-500 font-bold">
            Pergunta {currentQuestionIndex + 1} de {QUESTIONS.length}
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white p-10 rounded-2xl shadow-sm space-y-10 min-h-[400px] flex flex-col justify-center">
        <h3 className="text-2xl font-bold text-slate-800 text-center leading-relaxed">
          {currentQuestion.text}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {RESPONSE_OPTIONS.slice(0, 4).map((opt) => (
            <button
              key={opt.value}
              disabled={loading}
              onClick={() => handleAnswer(opt.value)}
              className={cn(
                "py-6 px-4 rounded-xl border-2 font-bold transition-all text-lg",
                loading && "opacity-50 cursor-not-allowed",
                responses[`P${currentQuestionIndex + 1}`] === opt.value
                  ? "bg-orange-500 border-orange-500 text-white shadow-lg"
                  : "border-slate-100 hover:border-orange-200 text-slate-600 hover:bg-orange-50"
              )}
            >
              {opt.label}
            </button>
          ))}
          <button
            disabled={loading}
            onClick={() => handleAnswer(RESPONSE_OPTIONS[4].value)}
            className={cn(
              "col-span-2 py-6 px-4 rounded-xl border-2 font-bold transition-all text-lg",
              loading && "opacity-50 cursor-not-allowed",
              responses[`P${currentQuestionIndex + 1}`] === RESPONSE_OPTIONS[4].value
                ? "bg-orange-500 border-orange-500 text-white shadow-lg"
                : "border-slate-100 hover:border-orange-200 text-slate-600 hover:bg-orange-50"
            )}
          >
            {RESPONSE_OPTIONS[4].label}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function TechLoginView({ setView, showMessage }: { setView: (v: View) => void, showMessage: (t: string, type?: 'success' | 'error') => void }) {
  const [password, setPassword] = useState('');
  const MASTER_PASSWORD = '30061979';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MASTER_PASSWORD) {
      setView('tech-panel');
    } else {
      showMessage('Senha Master incorreta.', 'error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-sm p-8 mt-12"
    >
      <div className="text-center mb-8">
        <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <ClipboardCheck size={32} className="text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Acesso Responsável Técnico</h2>
        <p className="text-slate-500 mt-2">Insira a Senha Master para continuar.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Senha Master</label>
          <input 
            required
            type="password"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all"
        >
          ACESSAR PAINEL
        </button>

        <button 
          type="button"
          onClick={() => setView('home')}
          className="w-full text-slate-500 font-medium hover:text-slate-800 transition-colors"
        >
          Voltar para Início
        </button>
      </form>
    </motion.div>
  );
}

function TechPanelView({ setView, showMessage }: { setView: (v: View) => void, showMessage: (t: string, type?: 'success' | 'error') => void }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [techResponsible, setTechResponsible] = useState<TechnicalResponsible | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const unsubCompanies = onSnapshot(collection(db, 'companies'), (snapshot) => {
      setCompanies(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Company)));
    });

    const unsubTech = onSnapshot(collection(db, 'tech_responsible'), (snapshot) => {
      if (!snapshot.empty) {
        setTechResponsible({ ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as TechnicalResponsible);
      }
    });

    return () => {
      unsubCompanies();
      unsubTech();
    };
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      const q = query(collection(db, 'assessments'), where('companyId', '==', selectedCompany.id));
      const unsubAssessments = onSnapshot(q, (snapshot) => {
        setAssessments(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Assessment)));
      });
      return () => unsubAssessments();
    }
  }, [selectedCompany]);

  const exportCSV = () => {
    if (!selectedCompany || assessments.length === 0) {
      showMessage('Nenhuma avaliação encontrada para exportar.', 'error');
      return;
    }

    const headers = ['DATA', 'SETOR'];
    // Dynamically generate headers based on number of questions
    QUESTIONS.forEach((_, i) => headers.push(`P${i + 1}`));

    // Use semicolon as delimiter for better Excel compatibility in many regions (like Brazil)
    const delimiter = ';';
    const csvRows = [headers.join(delimiter)];

    assessments.forEach(ass => {
      const date = new Date(ass.timestamp).toLocaleDateString('pt-BR');
      const row = [date, ass.sector];
      QUESTIONS.forEach((_, i) => {
        row.push(ass.responses[`P${i + 1}`]?.toString() || '');
      });
      csvRows.push(row.join(delimiter));
    });

    // Add BOM for UTF-8 to ensure Excel handles special characters and delimiters correctly
    const BOM = '\uFEFF';
    const csvContent = BOM + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `avaliacoes_${selectedCompany.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showMessage('CSV exportado com sucesso!');
  };

  const exportDocx = async () => {
    if (!selectedCompany || assessments.length === 0 || !techResponsible) {
      showMessage('Dados insuficientes para gerar o relatório DOCX.', 'error');
      return;
    }

    showMessage('Gerando relatório DOCX, por favor aguarde...');

    try {
      const domainsChart = document.getElementById('chart-domains');
      const distributionChart = document.getElementById('chart-distribution');

      let domainsImg = '';
      let distributionImg = '';

      if (domainsChart) {
        domainsImg = await toPng(domainsChart, { backgroundColor: '#ffffff' });
      }
      if (distributionChart) {
        distributionImg = await toPng(distributionChart, { backgroundColor: '#ffffff' });
      }

      const base64ToUint8Array = (base64: string) => {
        const binaryString = window.atob(base64.split(',')[1]);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      };

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "RELATÓRIO DE ANÁLISE DE RISCOS PSICOSSOCIAIS (NR-1)",
                    bold: true,
                    size: 32,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Empresa: ${selectedCompany.name}`, bold: true }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `CNPJ: ${selectedCompany.cnpj}` }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Data do Relatório: ${new Date().toLocaleDateString('pt-BR')}` }),
                ],
                spacing: { after: 400 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "RESPONSÁVEL TÉCNICO", bold: true }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Nome: ${techResponsible.name}` }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Registro Profissional: ${techResponsible.registrationNumber}` }),
                ],
                spacing: { after: 400 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "GRÁFICOS DE ANÁLISE", bold: true, size: 24 }),
                ],
                spacing: { after: 200 },
              }),
              ...(domainsImg ? [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: base64ToUint8Array(domainsImg),
                      transformation: { width: 500, height: 300 },
                    } as any),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({ 
                  children: [new TextRun({ text: "Figura 1: Domínios de Risco" })],
                  alignment: AlignmentType.CENTER, 
                  spacing: { after: 400 } 
                }),
              ] : []),
              ...(distributionImg ? [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: base64ToUint8Array(distributionImg),
                      transformation: { width: 400, height: 300 },
                    } as any),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({ 
                  children: [new TextRun({ text: "Figura 2: Distribuição de Riscos" })],
                  alignment: AlignmentType.CENTER, 
                  spacing: { after: 400 } 
                }),
              ] : []),
              new Paragraph({
                children: [
                  new TextRun({ text: "TABELA DE RESULTADOS POR DOMÍNIO", bold: true, size: 24 }),
                ],
                spacing: { after: 200 },
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Domínio", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Score", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Classificação", bold: true })] })] }),
                    ],
                  }),
                  ...reportData.map(row => new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.domain })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.score.toString() })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.classification })] })] }),
                    ],
                  })),
                ],
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `Relatorio_NR1_${selectedCompany.name.replace(/\s+/g, '_')}.docx`);
      showMessage('Relatório DOCX gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar DOCX:', error);
      showMessage('Erro ao gerar relatório DOCX.', 'error');
    }
  };

  const getRiskColor = (level: RiskLevel) => {
    if (level === 'Leve') return '#10b981'; // Emerald 500
    if (level === 'Moderado') return '#f59e0b'; // Amber 500
    return '#ef4444'; // Rose 500
  };

  const getRiskLevel = (score: number): RiskLevel => {
    if (score < 50) return 'Alto';
    if (score < 75) return 'Moderado';
    return 'Leve';
  };

  const calculateResults = (): DomainResult[] => {
    if (assessments.length === 0) return [];

    const domainScores: Record<string, number[]> = {};

    assessments.forEach(ass => {
      QUESTIONS.forEach((q, index) => {
        const responseValue = ass.responses[`P${index + 1}`];
        if (responseValue !== undefined) {
          // Calculation logic: 0-4 scale normalized to 100
          // Direct: score * 25
          // Inverted: (4 - score) * 25
          const correctedScore = q.inverted 
            ? (4 - responseValue) * 25 
            : responseValue * 25;
          
          if (!domainScores[q.domain]) domainScores[q.domain] = [];
          domainScores[q.domain].push(correctedScore);
        }
      });
    });

    return Object.entries(domainScores).map(([domain, scores]) => {
      const average = scores.reduce((a, b) => a + b, 0) / scores.length;
      const level = getRiskLevel(average);
      return {
        domain,
        score: Math.round(average),
        severity: level,
        probability: level,
        classification: level
      };
    });
  };

  const reportData = calculateResults();
  const pieData = [
    { name: 'Leve', value: reportData.filter(d => d.classification === 'Leve').length, color: '#10b981' },
    { name: 'Moderado', value: reportData.filter(d => d.classification === 'Moderado').length, color: '#f59e0b' },
    { name: 'Alto', value: reportData.filter(d => d.classification === 'Alto').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Painel Técnico</h2>
          <p className="text-slate-500 font-medium mt-1">
            {techResponsible ? `Responsável: ${techResponsible.name} (${techResponsible.registrationNumber})` : 'Nenhum responsável cadastrado'}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded-xl transition-all"
          >
            CADASTRAR RESPONSÁVEL
          </button>
          <button 
            onClick={() => setView('home')}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all"
          >
            SAIR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Companies List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Building2 size={18} />
              Empresas
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {companies.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelectedCompany(c); setShowReport(false); }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl transition-all flex flex-col gap-1",
                  selectedCompany?.id === c.id ? "bg-indigo-600 text-white shadow-md" : "hover:bg-slate-50 text-slate-700"
                )}
              >
                <span className="font-bold truncate">{c.name}</span>
                <span className={cn("text-xs", selectedCompany?.id === c.id ? "text-indigo-100" : "text-slate-400")}>
                  {c.cnpj}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Company Details & Reports */}
        <div className="lg:col-span-3 space-y-6">
          {selectedCompany ? (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{selectedCompany.name}</h3>
                  <p className="text-slate-500">Setores: {selectedCompany.sectors.join(', ')}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={exportCSV}
                    className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-lg transition-all flex items-center gap-2"
                  >
                    EXPORTAR CSV
                  </button>
                  <button 
                    onClick={() => setShowReport(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all flex items-center gap-2"
                  >
                    GERAR RELATÓRIO
                  </button>
                  {showReport && (
                    <button 
                      onClick={exportDocx}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all flex items-center gap-2"
                    >
                      EXPORTAR DOCX
                    </button>
                  )}
                </div>
              </div>

              {showReport && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div id="chart-domains" className="bg-white p-6 rounded-2xl shadow-sm h-[400px]">
                      <h4 className="font-bold text-slate-800 mb-6">Domínios de Risco</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reportData} layout="vertical" margin={{ left: 40, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" hide />
                          <YAxis dataKey="domain" type="category" width={150} tick={{ fontSize: 10, fontWeight: 600 }} />
                          <Tooltip />
                          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                            {reportData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={getRiskColor(entry.classification)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div id="chart-distribution" className="bg-white p-6 rounded-2xl shadow-sm h-[400px] flex flex-col items-center">
                      <h4 className="font-bold text-slate-800 mb-6 w-full">Distribuição de Riscos</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-4 font-bold">Domínio</th>
                          <th className="px-6 py-4 font-bold">Severidade</th>
                          <th className="px-6 py-4 font-bold">Probabilidade</th>
                          <th className="px-6 py-4 font-bold">Classificação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportData.map((row, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4 font-bold text-slate-700">{row.domain}</td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: getRiskColor(row.severity) }}>
                                {row.severity}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: getRiskColor(row.probability) }}>
                                {row.probability}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: getRiskColor(row.classification) }}>
                                {row.classification}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <div className="bg-white h-[400px] rounded-2xl shadow-sm flex flex-col items-center justify-center text-slate-400 gap-4">
              <Building2 size={64} className="opacity-20" />
              <p className="font-medium">Selecione uma empresa para visualizar os dados e relatórios.</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            key="tech-form-overlay" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              key="tech-form-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Cadastrar Responsável</h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <TechResponsibleForm 
                onSave={() => { setShowForm(false); showMessage('Responsável Técnico salvo com sucesso!'); }} 
                initialData={techResponsible}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TechResponsibleForm({ onSave, initialData }: { onSave: () => void, initialData: TechnicalResponsible | null }) {
  const [name, setName] = useState(initialData?.name || '');
  const [reg, setReg] = useState(initialData?.registrationNumber || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData?.id) {
        await updateDoc(doc(db, 'tech_responsible', initialData.id), {
          name,
          registrationNumber: reg,
          updatedAt: Date.now()
        });
      } else {
        await addDoc(collection(db, 'tech_responsible'), {
          name,
          registrationNumber: reg,
          updatedAt: Date.now()
        });
      }
      onSave();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Nome Completo</label>
        <input 
          required
          type="text"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Número de Registro</label>
        <input 
          required
          type="text"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={reg}
          onChange={e => setReg(e.target.value)}
        />
      </div>
      <button 
        disabled={loading}
        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'SALVAR RESPONSÁVEL'}
      </button>
    </form>
  );
}
