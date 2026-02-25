export interface Company {
  id?: string;
  name: string;
  cnpj: string;
  employeeCount: number;
  sectors: string[];
  functions: string[];
  password?: string;
  accessCode: string;
  createdAt: number;
}

export interface TechnicalResponsible {
  id?: string;
  name: string;
  registrationNumber: string;
  updatedAt: number;
}

export interface Assessment {
  id?: string;
  companyId: string;
  sector: string;
  function: string;
  timestamp: number;
  responses: Record<string, number>; // P1, P2, P3...
}

export type RiskLevel = 'Leve' | 'Moderado' | 'Alto';

export interface DomainResult {
  domain: string;
  score: number;
  severity: RiskLevel;
  probability: RiskLevel;
  classification: RiskLevel;
}
