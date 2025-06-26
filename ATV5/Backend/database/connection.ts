import { PrismaClient } from '@prisma/client';

class DatabaseManager {
    private static instance: PrismaClient;
    
    public static getInstance(): PrismaClient {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new PrismaClient();
        }
        return DatabaseManager.instance;
    }
    
    public static async initialize(): Promise<void> {
        try {
            await DatabaseManager.getInstance().$connect();
            console.log('🗄️ Database connection established successfully');
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            process.exit(1);
        }
    }
    
    public static async terminate(): Promise<void> {
        await DatabaseManager.getInstance().$disconnect();
        console.log('🔒 Database connection closed gracefully');
    }
}

export default DatabaseManager.getInstance();
export { DatabaseManager };