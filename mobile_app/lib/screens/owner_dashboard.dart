import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:glassmorphism/glassmorphism.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class OwnerDashboard extends StatefulWidget {
  const OwnerDashboard({super.key});

  @override
  State<OwnerDashboard> createState() => _OwnerDashboardState();
}

class _OwnerDashboardState extends State<OwnerDashboard> {
  Map<String, dynamic>? _analytics;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAnalytics();
  }

  Future<void> _fetchAnalytics() async {
    try {
      // Assuming at least one hostel exists for the owner
      final hostelRes = await ApiService.get('/api/owner/hostels');
      final hostels = jsonDecode(hostelRes.body);
      
      if (hostels.isNotEmpty) {
        final hostelId = hostels[0]['_id'];
        final res = await ApiService.get('/api/owner/analytics?hostelId=$hostelId');
        if (res.statusCode == 200) {
          setState(() {
            _analytics = jsonDecode(res.body);
            _isLoading = false;
          });
        }
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Owner Portal', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => context.read<AuthProvider>().logout(),
          ),
        ],
      ),
      extendBodyBehindAppBar: true,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
          ),
        ),
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : SafeArea(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Business Overview', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 20),
                      _buildMetricCard('Occupancy', '${_analytics?['metrics']?['occupancyRate'] ?? 0}%', Icons.people_outline),
                      _buildMetricCard('Monthly Collection', '₹${_analytics?['metrics']?['totalCollection'] ?? 0}', Icons.payments_outlined),
                      _buildMetricCard('Pending Complaints', '${_analytics?['pendingComplaints'] ?? 0}', Icons.report_problem_outlined),
                      const SizedBox(height: 32),
                      const Text('Recent Payments', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 12),
                      _buildPaymentsList(_analytics?['recentPayments']),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: GlassmorphicContainer(
        width: double.infinity,
        height: 90,
        borderRadius: 12,
        blur: 15,
        alignment: Alignment.center,
        border: 1,
        linearGradient: LinearGradient(colors: [Colors.white.withOpacity(0.05), Colors.white.withOpacity(0.02)]),
        borderGradient: LinearGradient(colors: [const Color(0xFF6366F1).withOpacity(0.3), Colors.white.withOpacity(0.1)]),
        child: ListTile(
          leading: Icon(icon, color: const Color(0xFF6366F1), size: 30),
          title: Text(title, style: const TextStyle(color: Colors.white70, fontSize: 13)),
          trailing: Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
        ),
      ),
    );
  }

  Widget _buildPaymentsList(List? payments) {
    if (payments == null || payments.isEmpty) {
      return const Text('No recent payments.', style: TextStyle(color: Colors.white38));
    }
    return Column(
      children: payments.map((p) => Card(
        color: Colors.white.withOpacity(0.03),
        margin: const EdgeInsets.only(bottom: 8),
        child: ListTile(
          title: Text(p['users']?['name'] ?? 'User', style: const TextStyle(fontSize: 14)),
          trailing: Text('₹${p['amount']}', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.greenAccent)),
        ),
      )).toList(),
    );
  }
}
