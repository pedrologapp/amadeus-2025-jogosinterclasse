import React, { useState } from 'react';
import './App.css';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';

import { 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  CreditCard, 
  FileText, 
  Phone, 
  Mail,
  Bus,
  Camera,
  Shield,
  Heart,
  CheckCircle,
  ArrowRight,
  User,
  X,
  Plus,
  Minus,
  UserPlus,
  Utensils,
  XCircle,      // <- Adicione este
  AlertTriangle,
  ClipboardCheck
} from 'lucide-react';
// Importando as imagens
import interiorImage1 from './assets/happy1.jpg';
import interiorImage2 from './assets/happy2.jpg';
import jardimImage from './assets/happy3.jpg';

function App() {
  // Estados para o formulário
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    studentGrade: '',
    studentClass: '',
    parentName: '',
    cpf: '',
    email: '',
    phone: '',
    paymentMethod: 'pix',
    installments: 1
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [inscriptionSuccess, setInscriptionSuccess] = useState(false);
  
  // Estados para validação de CPF
  const [cpfError, setCpfError] = useState('');
  const [cpfValid, setCpfValid] = useState(false);

  // Função para validar CPF
  const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, ''); // Remove caracteres não numéricos
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // CPF com todos dígitos iguais
    
    let soma = 0;
    let resto;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    // Segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Função para mostrar formulário
  const showInscricaoForm = () => {
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('formulario-inscricao')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Cálculo de preço atualizado
  const calculatePrice = () => {
    const PRECO_BASE = 280.0;
    
    let valorTotal = PRECO_BASE;
    
    if (formData.paymentMethod === 'credit') {
      let taxaPercentual = 0;
      const taxaFixa = 0.49;
      const parcelas = parseInt(formData.installments) || 1;
      
      if (parcelas === 1) {
        taxaPercentual = 0.0299;
      } else if (parcelas >= 2 && parcelas <= 4) {
        taxaPercentual = 0.0349;
      } else {
        taxaPercentual = 0.0399;
      }
      
      valorTotal = valorTotal + (valorTotal * taxaPercentual) + taxaFixa;
    }
    
    const valorParcela = valorTotal / (parseInt(formData.installments) || 1);
    return { valorTotal, valorParcela };
  };

  const { valorTotal, valorParcela } = calculatePrice();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Aplicar máscara de CPF
    if (name === 'cpf') {
      const cpfValue = value
        .replace(/\D/g, '') // Remove tudo que não é dígito
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona primeiro ponto
        .replace(/(\d{3})(\d)/, '$1.$2') // Adiciona segundo ponto
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2'); // Adiciona hífen

      setFormData(prev => ({ ...prev, [name]: cpfValue }));
      
      // Validação em tempo real do CPF
      const cpfSemMascara = cpfValue.replace(/[^\d]/g, '');
      
      if (cpfSemMascara.length === 0) {
        setCpfError('');
        setCpfValid(false);
      } else if (cpfSemMascara.length < 11) {
        setCpfError('CPF deve ter 11 dígitos');
        setCpfValid(false);
      } else if (cpfSemMascara.length === 11) {
        if (validarCPF(cpfSemMascara)) {
          setCpfError('');
          setCpfValid(true);
        } else {
          setCpfError('CPF inválido. Verifique os números digitados.');
          setCpfValid(false);
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Função de validação antes do submit
  const validateForm = () => {
    const cpfSemMascara = formData.cpf.replace(/[^\d]/g, '');
    
    if (!cpfSemMascara || cpfSemMascara.length !== 11) {
      alert('Por favor, preencha um CPF válido.');
      return false;
    }
    
    if (!validarCPF(cpfSemMascara)) {
      alert('CPF inválido. Verifique os números digitados.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulário antes de enviar
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);

    try {  
      // Enviar dados para o webhook do n8n
      const response = await fetch('https://webhook.escolaamadeus.com/webhook/amadeuseventos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: formData.studentName,
          studentGrade: formData.studentGrade,
          studentClass: formData.studentClass,
          parentName: formData.parentName,
          cpf: formData.cpf,
          email: formData.email,
          phone: formData.phone,
          paymentMethod: formData.paymentMethod,
          installments: formData.installments,
          amount: valorTotal,
          timestamp: new Date().toISOString(),
          event: 'Amadeus-interclasse'
        })
      });

      if (response.ok) {
          // Pegar a resposta do n8n PRIMEIRO
          const responseData = await response.json();
          console.log('Resposta do n8n:', responseData); // Para debug
          
          // Verificar se houve erro retornado pelo n8n
          if (responseData.success === false) {
            alert(responseData.message || 'Erro ao processar dados. Tente novamente.');
            return;
          }
          
          // Mostrar tela de sucesso
        setInscriptionSuccess(true);
  
        // Redirecionar para o Asaas após 2 segundos
        setTimeout(() => {
          if (responseData.paymentUrl) {
            window.location.href = responseData.paymentUrl;
          } else {
            console.log('Link de pagamento não encontrado na resposta');
            alert('Erro: Link de pagamento não encontrado. Entre em contato conosco.');
          }
        }, 1000);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Erro ao enviar dados para o servidor');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar inscrição. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (inscriptionSuccess) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Aguarde!</CardTitle>
            <CardDescription>Redirecionando para o pagamento...</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Seus dados foram registrados com sucesso. Em instantes você será redirecionado para finalizar o pagamento.
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen smooth-scroll">
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-900">Escola Amadeus</h1>
            <div className="hidden md:flex space-x-6">
              <button onClick={() => scrollToSection('sobre')} className="text-sm hover:text-primary transition-colors">Sobre</button>
              <button onClick={() => scrollToSection('Programação do Evento')} className="text-sm hover:text-primary transition-colors">Programação do Evento</button>
              <button onClick={() => scrollToSection('custos')} className="text-sm hover:text-primary transition-colors">Custos</button>
              <button onClick={() => scrollToSection('Observação')} className="text-sm hover:text-primary transition-colors">Observação</button>
              <button onClick={() => scrollToSection('orientacoes')} className="text-sm hover:text-primary transition-colors">Orientações</button>
              <button onClick={() => scrollToSection('contato')} className="text-sm hover:text-primary transition-colors">Contato</button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section min-h-screen flex items-center justify-center text-white relative">
        <div className="text-center z-10 max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            Jogos Interclasses Amadeus 2025
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Começa os nossos jogos interclasses, que vença a melhor turma!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary px-8 py-3 bg-white text-primary"
              onClick={() => scrollToSection("sobre")}
            >
              Saiba Mais
            </Button>
          </div>
          <div className="mt-12 flex justify-center items-center space-x-8 text-sm">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              31 de Outubro de 2025 - pela manhã.
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Ginásio do Amarante
            </div>
          </div>
        </div>
      </section>
      
    {/* Itinerário */}
      <section id="itinerario" className="section-padding bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Sobre os Jogos Inteclasses</h2>
            <p className="text-lg text-muted-foreground">
              Confira as informações
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Data e Horário</CardTitle>
                <CardDescription>Horário</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center">
                  Dia 31 de Outubro de 2025
                </p>
                <p className="text-sm text-center">
                  Horário: Das 7h às 11h
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-accent/10 rounded-full w-fit">
                  <MapPin className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>Local</CardTitle>
                {/*   <CardDescription>Atividades e diversão</CardDescription>  */}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center">
                  Ginásio do Amarante
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-green-500/10 rounded-full w-fit">
                  <ClipboardCheck className="h-8 w-8 text-blue-500" />
                </div>
                <CardTitle> Modalidades</CardTitle>
                <CardDescription>Modalidades permitidas</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm list-disc list-inside space-y-1 text-left">
                  <li>Futsal (Masculino e Feminino)</li>
                  <li>Voleibol (Masculino e Feminino)</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardHeader className="text-center">
				<div className="mx-auto mb-4 p-3 bg-green-500/10 rounded-full w-fit">
 					 <FileText className="h-8 w-8 text-blue-500" />
					</div>
                <CardTitle>Inscrições</CardTitle>
                <CardDescription>Regras</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm list-disc list-inside space-y-1 text-left">
                  <li>Os alunos interessados em participar devem se inscrever acessando esse formulário</li>
                   </ul>
              </CardContent>
            </Card>
			  
          </div>
          {/*
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-white p-4 rounded-lg shadow-sm">
              <Bus className="h-5 w-5 text-primary" />
              <span className="font-medium">Término previsto às 17:00</span>
            </div>
          </div>
          */}
        </div>
      </section>
  {/* Documentação */}
      <section id="documentacao" className="section-padding bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Observações importantes</h2>
          </div>

          <div className="mt-8 p-6 bg-accent/10 rounded-lg border border-accent/20">
            <div className="space-y-4">
              
			<div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm">
                  Prazo Final de Inscrição: 29 de outubro. 
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm">
                     O aluno deverá comparecer com a camisa da gincana ou a camisa na cor da sua equipe ( Roupa composta). Meninos: Calção para jogar e Meninas: Calça legging.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm">
                    Os alunos deverão ir diretamente para o Ginásio.
                  </p>
                </div>
              </div>    
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <p className="text-sm">
                    É obrigatório trazer seu lanche e garrafa com água.
                  </p>
                </div>
              </div>             
            </div>
          </div>
        </div>
      </section>

		
		
      {/* Custos e Pagamento */}
      <section id="custos" className="section-padding bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Inscrição</h2>
            <p className="text-lg text-muted-foreground">
              Inscreva-se aqui!
            </p>
          </div>

              
              <Separator className="my-6" />
              
              <div className="text-center">
                {!showForm ? (
                  <Button 
                    size="lg" 
                    className="bg-orange-600 hover:bg-orange-700 px-8 py-3"
                    onClick={showInscricaoForm}
                  >
                    Realizar Inscrição e Pagamento
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="px-8 py-3"
                    onClick={() => setShowForm(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Fechar Formulário
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {!showForm ? 'Preencha seus dados e escolha a forma de pagamento' : 'Clique acima para fechar o formulário'}
                </p>
              </div>

			

              {/* FORMULÁRIO DE INSCRIÇÃO - SHOW/HIDE */}
                  {showForm && (
                    <Card id="formulario-inscricao" className="border-orange-200 bg-orange-50/30">
                      <CardHeader>
                        <CardTitle className="flex items-center text-orange-800">
                          <User className="mr-2 h-5 w-5" />
                          Formulário de Inscrição
                        </CardTitle>
                        <CardDescription>
                          Preencha todos os dados para garantir sua participação
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                          
                          {/* Dados do Aluno */}
                          <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <User className="mr-2 h-5 w-5" />
                              Dados do Aluno
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="studentName">Nome Completo do Aluno *</Label>
                                <Input
                                  id="studentName"
                                  name="studentName"
                                  value={formData.studentName}
                                  onChange={handleInputChange}
                                  required
                                  placeholder="Nome completo do aluno"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="studentGrade">Série do Aluno *</Label>
                                  <select
                                    id="studentGrade"
                                    name="studentGrade"
                                    value={formData.studentGrade}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                  >
                                    <option value="">Selecione a série</option>
                                    <option value="4º Ano">4º Ano</option>
                                    <option value="5º Ano">5º Ano</option>
                                    <option value="6º Ano">6º Ano</option>
                                    <option value="7º Ano">7º Ano</option>
                                    <option value="8º Ano">8º Ano</option>
                                    <option value="9º Ano">9º Ano</option>
                                  </select>
                                </div>
                                <div>
                                  <Label htmlFor="studentClass">Turma do Aluno *</Label>
                                  <select
                                    id="studentClass"
                                    name="studentClass"
                                    value={formData.studentClass}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                  >
                                    <option value="">Selecione a turma</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                  </select>
                                </div>                       
                              </div>
                            </div>
                          </div>

                          {/* Botão de Envio */}
                          <Button 
                            type="submit" 
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 text-lg font-bold"
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processando Inscrição...
                              </>
                            ) : (
                              'CONFIRMAR INSCRIÇÃO'
                            )}
                          </Button>

                          <p className="text-xs text-center text-gray-600">
                            Sua inscrição será confirmada instantaneamente
                          </p>
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </section>

      {/* Contato */}
      <section id="contato" className="section-padding bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Entre em Contato</h2>
            <p className="text-lg text-muted-foreground">
              Tire suas dúvidas conosco
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="card-hover">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Phone className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle>Telefone</CardTitle>
                    <CardDescription>Secretaria da escola</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold">(84) 9 8145-0229</p>
                <p className="text-sm text-muted-foreground">
                  Horário de atendimento: 7h às 19h
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Coordenação Pedagógica</strong><br />
              Escola Centro Educacional Amadeus - São Gonçalo do Amarante, RN
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2025 Escola Centro Educacional Amadeus. Todos os direitos reservados.
          </p>
          <p className="text-xs mt-2 opacity-80">
            Passeio ao Game Station no Partage Shopping - 15 de Agosto de 2025
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;




















































