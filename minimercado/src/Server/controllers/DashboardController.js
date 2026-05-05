'use server'
import { authAdmin, authUser } from "@/src/Server/utils/auth";
import * as dashboardService from "../services/DashboardService"

export async function dashboardStatus() {
    try{
    await authAdmin ();
    const results = await dashboardService.createDashboard();
    if (results.error) return { success: false, message: results.error };
        return { success: true, data: results.data};
    }catch(error){
        return { success: false ,message: error.message };
    }
} 
