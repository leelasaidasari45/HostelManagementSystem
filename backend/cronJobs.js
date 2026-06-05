import cron from 'node-cron';
import { supabase } from './supabaseClient.js';
import { sendPushToUser } from './utils/notificationService.js';

export function startCronJobs() {
  // Run every 2 minutes
  cron.schedule('*/2 * * * *', async () => {
    console.log('⏳ Running owner dues notification cron job...');

    try {
      // 1. Fetch all owners
      const { data: owners } = await supabase
        .from('users')
        .select('id, name')
        .eq('role', 'owner');

      if (!owners) return;

      for (const owner of owners) {
        // 2. Fetch owner's hostels
        const { data: hostels } = await supabase
          .from('hostels')
          .select('id')
          .eq('owner_id', owner.id);

        if (!hostels || hostels.length === 0) continue; // No hostels

        let totalDues = 0;
        let tenantCount = 0;

        for (const hostel of hostels) {
          // Calculate dues for active tenants in the current month
          const now = new Date();
          const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

          const { data: activeAllocations } = await supabase
            .from('allocations')
            .select('rent_amount, tenant_id, beds!inner(rooms!inner(floors!inner(hostel_id)))')
            .in('status', ['active', 'vacating'])
            .eq('beds.rooms.floors.hostel_id', hostel.id);

          if (activeAllocations && activeAllocations.length > 0) {
            tenantCount += activeAllocations.length;
            const activeTenantIds = activeAllocations.map(a => a.tenant_id).filter(Boolean);
            
            if (activeTenantIds.length > 0) {
              const { data: activeTenantsPayments } = await supabase
                .from('payments')
                .select('tenant_id, amount')
                .in('tenant_id', activeTenantIds)
                .gte('paid_at', thisMonthStart)
                .eq('status', 'completed');

              const tenantPaidMap = {};
              (activeTenantsPayments || []).forEach(p => {
                tenantPaidMap[p.tenant_id] = (tenantPaidMap[p.tenant_id] || 0) + (Number(p.amount) || 0);
              });

              activeAllocations.forEach(a => {
                const paid = tenantPaidMap[a.tenant_id] || 0;
                const due = (Number(a.rent_amount) || 0) - paid;
                if (due > 0) {
                  totalDues += due;
                }
              });
            }
          }
        }

        // 3. Send Notification based on tenant count and dues
        let title = '';
        let body = '';

        if (tenantCount === 0) {
          title = 'No Tenants Found';
          body = 'There are no active tenants in your hostels at the moment.';
        } else {
          title = 'Tenant Dues Report';
          body = `You have ${tenantCount} active tenants. Total pending dues: ₹${totalDues}. Please check the dashboard.`;
        }

        await sendPushToUser(owner.id, title, body, { type: 'cron_dues_report' });
      }

      console.log('✅ Owner dues notification cron job completed.');
    } catch (error) {
      console.error('❌ Error running owner dues cron job:', error);
    }
  });

  console.log('✅ Cron jobs initialized');
}
