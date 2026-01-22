// API pour les fonctionnalités Comptable
import { supabase } from './supabaseClient';

// Types
export interface Invoice {
  id: string;
  invoice_number: string;
  sale_id?: string;
  client_id: string;
  store_id: string;
  status: 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_amount: number;
  total: number;
  paid_amount: number;
  issue_date: string;
  due_date: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'mobile_money' | 'check';
  payment_date: string;
  reference?: string;
  notes?: string;
  received_by: string;
  created_at: string;
}

export interface CashJournalEntry {
  id: string;
  store_id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  reference?: string;
  journal_date: string;
  created_by: string;
  created_at: string;
}

export interface AccountingEntry {
  id: string;
  store_id: string;
  entry_date: string;
  account_code: string;
  description: string;
  debit: number;
  credit: number;
  reference?: string;
  created_by: string;
  created_at: string;
}

export interface TaxRecord {
  id: string;
  store_id: string;
  period_start: string;
  period_end: string;
  tax_type: string;
  taxable_amount: number;
  tax_amount: number;
  status: 'pending' | 'filed' | 'paid';
  filed_date?: string;
  payment_date?: string;
  created_at: string;
}

// Factures
export async function getInvoices(storeId?: string, status?: string): Promise<Invoice[]> {
  let query = supabase.from('invoices').select('*').order('created_at', { ascending: false });
  if (storeId) query = query.eq('store_id', storeId);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
  const { data, error } = await supabase.from('invoices').insert(invoice).select().single();
  if (error) throw error;
  return data;
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
  const { data, error } = await supabase.from('invoices').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteInvoice(id: string): Promise<void> {
  const { error } = await supabase.from('invoices').delete().eq('id', id);
  if (error) throw error;
}

// Paiements
export async function getPayments(invoiceId?: string): Promise<Payment[]> {
  let query = supabase.from('payments').select('*').order('payment_date', { ascending: false });
  if (invoiceId) query = query.eq('invoice_id', invoiceId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createPayment(payment: Partial<Payment>): Promise<Payment> {
  const { data, error } = await supabase.from('payments').insert(payment).select().single();
  if (error) throw error;
  return data;
}

export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase.from('payments').delete().eq('id', id);
  if (error) throw error;
}

// Journal de caisse
export async function getCashJournal(storeId?: string, startDate?: string, endDate?: string): Promise<CashJournalEntry[]> {
  let query = supabase.from('cash_journal').select('*').order('journal_date', { ascending: false });
  if (storeId) query = query.eq('store_id', storeId);
  if (startDate) query = query.gte('journal_date', startDate);
  if (endDate) query = query.lte('journal_date', endDate);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createCashJournalEntry(entry: Partial<CashJournalEntry>): Promise<CashJournalEntry> {
  const { data, error } = await supabase.from('cash_journal').insert(entry).select().single();
  if (error) throw error;
  return data;
}

export async function updateCashJournalEntry(id: string, updates: Partial<CashJournalEntry>): Promise<CashJournalEntry> {
  const { data, error } = await supabase.from('cash_journal').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCashJournalEntry(id: string): Promise<void> {
  const { error } = await supabase.from('cash_journal').delete().eq('id', id);
  if (error) throw error;
}

// Écritures comptables
export async function getAccountingEntries(storeId?: string, startDate?: string, endDate?: string): Promise<AccountingEntry[]> {
  let query = supabase.from('accounting_entries').select('*').order('entry_date', { ascending: false });
  if (storeId) query = query.eq('store_id', storeId);
  if (startDate) query = query.gte('entry_date', startDate);
  if (endDate) query = query.lte('entry_date', endDate);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createAccountingEntry(entry: Partial<AccountingEntry>): Promise<AccountingEntry> {
  const { data, error } = await supabase.from('accounting_entries').insert(entry).select().single();
  if (error) throw error;
  return data;
}

// Enregistrements fiscaux (TVA)
export async function getTaxRecords(storeId?: string): Promise<TaxRecord[]> {
  let query = supabase.from('tax_records').select('*').order('period_start', { ascending: false });
  if (storeId) query = query.eq('store_id', storeId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createTaxRecord(record: Partial<TaxRecord>): Promise<TaxRecord> {
  const { data, error } = await supabase.from('tax_records').insert(record).select().single();
  if (error) throw error;
  return data;
}

export async function updateTaxRecord(id: string, updates: Partial<TaxRecord>): Promise<TaxRecord> {
  const { data, error } = await supabase.from('tax_records').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// Rapports financiers
export async function getFinancialSummary(storeId: string, startDate: string, endDate: string) {
  const [invoices, payments, cashJournal] = await Promise.all([
    supabase
      .from('invoices')
      .select('total, paid_amount, status')
      .eq('store_id', storeId)
      .gte('issue_date', startDate)
      .lte('issue_date', endDate),
    supabase
      .from('payments')
      .select('amount, payment_method')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate),
    supabase
      .from('cash_journal')
      .select('type, amount')
      .eq('store_id', storeId)
      .gte('journal_date', startDate)
      .lte('journal_date', endDate)
  ]);

  const totalRevenue = invoices.data?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0;
  const totalPaid = invoices.data?.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0) || 0;
  const totalReceived = payments.data?.reduce((sum, pay) => sum + (pay.amount || 0), 0) || 0;
  const cashIncome = cashJournal.data?.filter(e => e.type === 'income').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;
  const cashExpense = cashJournal.data?.filter(e => e.type === 'expense').reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

  return {
    totalRevenue,
    totalPaid,
    totalUnpaid: totalRevenue - totalPaid,
    totalReceived,
    cashIncome,
    cashExpense,
    netCashFlow: cashIncome - cashExpense,
    invoiceCount: invoices.data?.length || 0,
    paidInvoices: invoices.data?.filter(inv => inv.status === 'paid').length || 0,
    overdueInvoices: invoices.data?.filter(inv => inv.status === 'overdue').length || 0
  };
}

// Balance comptable
export async function getTrialBalance(storeId: string, asOfDate: string) {
  const { data, error } = await supabase
    .from('accounting_entries')
    .select('account_code, debit, credit')
    .eq('store_id', storeId)
    .lte('entry_date', asOfDate);

  if (error) throw error;

  const balances: Record<string, { debit: number; credit: number }> = {};
  data?.forEach(entry => {
    if (!balances[entry.account_code]) {
      balances[entry.account_code] = { debit: 0, credit: 0 };
    }
    balances[entry.account_code].debit += entry.debit || 0;
    balances[entry.account_code].credit += entry.credit || 0;
  });

  return Object.entries(balances).map(([account_code, values]) => ({
    account_code,
    debit: values.debit,
    credit: values.credit,
    balance: values.debit - values.credit
  }));
}
