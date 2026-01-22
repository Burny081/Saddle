// =============================================================================
// API ACCOUNTING - Gestion comptable complète
// =============================================================================

import { supabase } from './supabaseClient';
import type {
  ChartOfAccount,
  AccountingEntry,
  CashJournal,
  TaxRecord,
  ApiResponse,
  PaginatedResponse,
  DateRange,
} from '@/types/database';

// ===== CHART OF ACCOUNTS =====

export async function getChartOfAccounts(storeId: string): Promise<ApiResponse<ChartOfAccount[]>> {
  try {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('code');

    if (error) throw error;
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error fetching chart of accounts:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

export async function getAccountById(id: string): Promise<ApiResponse<ChartOfAccount>> {
  try {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error fetching account:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

export async function createAccount(account: Partial<ChartOfAccount>): Promise<ApiResponse<ChartOfAccount>> {
  try {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .insert(account)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error creating account:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

export async function updateAccount(id: string, updates: Partial<ChartOfAccount>): Promise<ApiResponse<ChartOfAccount>> {
  try {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error updating account:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

export async function deleteAccount(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await supabase
      .from('chart_of_accounts')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
    return { data: null, error: null, success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

// ===== ACCOUNTING ENTRIES =====

export async function getAccountingEntries(
  storeId: string,
  options?: {
    dateRange?: DateRange;
    accountId?: string;
    page?: number;
    pageSize?: number;
  }
): Promise<ApiResponse<PaginatedResponse<AccountingEntry>>> {
  try {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('accounting_entries')
      .select('*, account:chart_of_accounts(*)', { count: 'exact' })
      .eq('store_id', storeId);

    if (options?.dateRange) {
      query = query
        .gte('entry_date', options.dateRange.startDate)
        .lte('entry_date', options.dateRange.endDate);
    }

    if (options?.accountId) {
      query = query.eq('account_id', options.accountId);
    }

    const { data, error, count } = await query
      .order('entry_date', { ascending: false })
      .order('entry_number', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching accounting entries:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

export async function createAccountingEntry(entry: Partial<AccountingEntry>): Promise<ApiResponse<AccountingEntry>> {
  try {
    const { data, error } = await supabase
      .from('accounting_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error creating accounting entry:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

export async function createJournalEntry(
  storeId: string,
  entries: { account_id: string; debit: number; credit: number; description?: string }[],
  entryDate: string,
  description?: string
): Promise<ApiResponse<AccountingEntry[]>> {
  try {
    // Generate entry number
    const { data: lastEntry } = await supabase
      .from('accounting_entries')
      .select('entry_number')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const lastNumber = lastEntry?.entry_number ? parseInt(lastEntry.entry_number.split('-')[1] || '0') : 0;
    const entryNumber = `JE-${String(lastNumber + 1).padStart(6, '0')}`;

    // Create all entries with the same entry number
    const entriesToCreate = entries.map(e => ({
      store_id: storeId,
      entry_number: entryNumber,
      entry_date: entryDate,
      description: e.description || description,
      account_id: e.account_id,
      debit: e.debit,
      credit: e.credit,
    }));

    const { data, error } = await supabase
      .from('accounting_entries')
      .insert(entriesToCreate)
      .select();

    if (error) throw error;
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

// ===== CASH JOURNAL =====

export async function getCashJournal(
  storeId: string,
  options?: {
    dateRange?: DateRange;
    type?: 'income' | 'expense' | 'transfer';
    page?: number;
    pageSize?: number;
  }
): Promise<ApiResponse<PaginatedResponse<CashJournal>>> {
  try {
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('cash_journal')
      .select('*', { count: 'exact' })
      .eq('store_id', storeId);

    if (options?.dateRange) {
      query = query
        .gte('transaction_date', options.dateRange.startDate)
        .lte('transaction_date', options.dateRange.endDate);
    }

    if (options?.type) {
      query = query.eq('type', options.type);
    }

    const { data, error, count } = await query
      .order('transaction_date', { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Error fetching cash journal:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

export async function createCashJournalEntry(entry: Partial<CashJournal>): Promise<ApiResponse<CashJournal>> {
  try {
    // Get current balance
    const { data: lastEntry } = await supabase
      .from('cash_journal')
      .select('balance_after')
      .eq('store_id', entry.store_id)
      .order('transaction_date', { ascending: false })
      .limit(1)
      .single();

    const previousBalance = lastEntry?.balance_after || 0;
    const amount = entry.amount || 0;
    const balanceAfter = entry.type === 'expense' 
      ? previousBalance - Math.abs(amount)
      : previousBalance + Math.abs(amount);

    const { data, error } = await supabase
      .from('cash_journal')
      .insert({ ...entry, balance_after: balanceAfter })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error creating cash journal entry:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

export async function getCashBalance(storeId: string): Promise<ApiResponse<number>> {
  try {
    const { data, error } = await supabase
      .from('cash_journal')
      .select('balance_after')
      .eq('store_id', storeId)
      .order('transaction_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data: data?.balance_after || 0, error: null, success: true };
  } catch (error) {
    console.error('Error fetching cash balance:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

// ===== TAX RECORDS =====

export async function getTaxRecords(
  storeId: string,
  options?: {
    taxType?: string;
    status?: 'pending' | 'declared' | 'paid';
    year?: number;
  }
): Promise<ApiResponse<TaxRecord[]>> {
  try {
    let query = supabase
      .from('tax_records')
      .select('*')
      .eq('store_id', storeId);

    if (options?.taxType) {
      query = query.eq('tax_type', options.taxType);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.year) {
      query = query
        .gte('period_start', `${options.year}-01-01`)
        .lte('period_end', `${options.year}-12-31`);
    }

    const { data, error } = await query.order('period_start', { ascending: false });

    if (error) throw error;
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error fetching tax records:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

export async function createTaxRecord(record: Partial<TaxRecord>): Promise<ApiResponse<TaxRecord>> {
  try {
    const { data, error } = await supabase
      .from('tax_records')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error creating tax record:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

export async function updateTaxRecord(id: string, updates: Partial<TaxRecord>): Promise<ApiResponse<TaxRecord>> {
  try {
    const { data, error } = await supabase
      .from('tax_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Error updating tax record:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

// ===== REPORTS =====

export async function getTrialBalance(
  storeId: string,
  asOfDate: string
): Promise<ApiResponse<{ account: ChartOfAccount; debit: number; credit: number; balance: number }[]>> {
  try {
    const { data: entries, error } = await supabase
      .from('accounting_entries')
      .select('account_id, debit, credit, account:chart_of_accounts(*)')
      .eq('store_id', storeId)
      .lte('entry_date', asOfDate);

    if (error) throw error;

    // Aggregate by account
    const balances = new Map<string, { account: ChartOfAccount; debit: number; credit: number }>();
    
    entries?.forEach(entry => {
      const key = entry.account_id;
      if (!balances.has(key)) {
        balances.set(key, { account: entry.account as unknown as ChartOfAccount, debit: 0, credit: 0 });
      }
      const balance = balances.get(key)!;
      balance.debit += entry.debit || 0;
      balance.credit += entry.credit || 0;
    });

    const result = Array.from(balances.values()).map(b => ({
      ...b,
      balance: b.debit - b.credit,
    }));

    return { data: result, error: null, success: true };
  } catch (error) {
    console.error('Error generating trial balance:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

export async function getIncomeStatement(
  storeId: string,
  dateRange: DateRange
): Promise<ApiResponse<{
  revenue: { account: string; amount: number }[];
  expenses: { account: string; amount: number }[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}>> {
  try {
    const { data: entries, error } = await supabase
      .from('accounting_entries')
      .select('debit, credit, account:chart_of_accounts(id, name, type)')
      .eq('store_id', storeId)
      .gte('entry_date', dateRange.startDate)
      .lte('entry_date', dateRange.endDate);

    if (error) throw error;

    const revenue: Map<string, number> = new Map();
    const expenses: Map<string, number> = new Map();

    entries?.forEach(entry => {
      const account = entry.account as unknown as ChartOfAccount;
      if (account.type === 'revenue') {
        const current = revenue.get(account.name) || 0;
        revenue.set(account.name, current + (entry.credit - entry.debit));
      } else if (account.type === 'expense') {
        const current = expenses.get(account.name) || 0;
        expenses.set(account.name, current + (entry.debit - entry.credit));
      }
    });

    const revenueArray = Array.from(revenue.entries()).map(([account, amount]) => ({ account, amount }));
    const expensesArray = Array.from(expenses.entries()).map(([account, amount]) => ({ account, amount }));
    const totalRevenue = revenueArray.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expensesArray.reduce((sum, e) => sum + e.amount, 0);

    return {
      data: {
        revenue: revenueArray,
        expenses: expensesArray,
        totalRevenue,
        totalExpenses,
        netIncome: totalRevenue - totalExpenses,
      },
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Error generating income statement:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}

export async function getCashFlowSummary(
  storeId: string,
  dateRange: DateRange
): Promise<ApiResponse<{
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  byCategory: { category: string; income: number; expense: number }[];
}>> {
  try {
    const { data, error } = await supabase
      .from('cash_journal')
      .select('type, category, amount')
      .eq('store_id', storeId)
      .gte('transaction_date', dateRange.startDate)
      .lte('transaction_date', dateRange.endDate);

    if (error) throw error;

    let totalIncome = 0;
    let totalExpenses = 0;
    const byCategory = new Map<string, { income: number; expense: number }>();

    data?.forEach(entry => {
      const category = entry.category || 'Non catégorisé';
      if (!byCategory.has(category)) {
        byCategory.set(category, { income: 0, expense: 0 });
      }
      const cat = byCategory.get(category)!;

      if (entry.type === 'income') {
        totalIncome += entry.amount;
        cat.income += entry.amount;
      } else if (entry.type === 'expense') {
        totalExpenses += entry.amount;
        cat.expense += entry.amount;
      }
    });

    return {
      data: {
        totalIncome,
        totalExpenses,
        netCashFlow: totalIncome - totalExpenses,
        byCategory: Array.from(byCategory.entries()).map(([category, data]) => ({ category, ...data })),
      },
      error: null,
      success: true,
    };
  } catch (error) {
    console.error('Error generating cash flow summary:', error);
    return { data: null, error: (error as Error).message, success: false };
  }
}
