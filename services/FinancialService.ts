import { isSupabaseConfigured, supabase } from '../supabaseClient';
import { PersonalTransaction } from '../data';

export class FinancialService {
    static mapTransactionFromDb(dbTransaction: any): PersonalTransaction {
        return {
            id: dbTransaction.id,
            type: dbTransaction.type,
            description: dbTransaction.description,
            category: dbTransaction.category,
            value: dbTransaction.value,
            status: dbTransaction.status,
            date: dbTransaction.date,
        };
    }

    static mapTransactionToDb(transaction: Omit<PersonalTransaction, 'id'>, artistId: string): any {
        return {
            artist_id: artistId,
            type: transaction.type,
            description: transaction.description,
            category: transaction.category,
            value: transaction.value,
            status: transaction.status,
            date: transaction.date,
        };
    }

    static async getTransactions(artistId: string): Promise<PersonalTransaction[]> {
        if (!isSupabaseConfigured) return [];
        const { data, error } = await supabase
            .from('personal_transactions')
            .select('*')
            .eq('artist_id', artistId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching transactions:', error.message);
            return [];
        }
        return (data || []).map(this.mapTransactionFromDb);
    }

    static async addTransaction(artistId: string, transaction: Omit<PersonalTransaction, 'id'>): Promise<PersonalTransaction | null> {
        if (!isSupabaseConfigured) return null;
        const { data, error } = await supabase
            .from('personal_transactions')
            .insert([this.mapTransactionToDb(transaction, artistId)])
            .select()
            .single();

        if (error) {
            console.error('Error adding transaction:', error.message);
            return null;
        }
        return this.mapTransactionFromDb(data);
    }
    
    static async updateTransaction(transactionId: number, updates: Partial<Omit<PersonalTransaction, 'id' | 'type'>>): Promise<PersonalTransaction | null> {
        if (!isSupabaseConfigured) return null;

        const { data, error } = await supabase
            .from('personal_transactions')
            .update(updates)
            .eq('id', transactionId)
            .select()
            .single();

        if (error) {
            console.error('Error updating transaction:', error.message);
            return null;
        }
        return this.mapTransactionFromDb(data);
    }
    
    static async updateTransactionStatus(transactionId: number, status: 'paid' | 'pending'): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase
            .from('personal_transactions')
            .update({ status })
            .eq('id', transactionId);

        if (error) {
            console.error('Error updating transaction status:', error.message);
            return false;
        }
        return true;
    }

    static async deleteTransaction(transactionId: number): Promise<boolean> {
        if (!isSupabaseConfigured) return false;
        const { error } = await supabase
            .from('personal_transactions')
            .delete()
            .eq('id', transactionId);

        if (error) {
            console.error('Error deleting transaction:', error.message);
            return false;
        }
        return true;
    }
}