import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:glassmorphism/glassmorphism.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class TenantDashboard extends StatefulWidget {
  const TenantDashboard({super.key});

  @override
  State<TenantDashboard> createState() => _TenantDashboardState();
}

class _TenantDashboardState extends State<TenantDashboard> {
  Map<String, dynamic>? _dashData;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchDashboard();
  }

  Future<void> _fetchDashboard() async {
    try {
      final res = await ApiService.get('/api/tenant/dashboard');
      if (res.statusCode == 200) {
        setState(() {
          _dashData = jsonDecode(res.body);
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final hostelName = _dashData?['hostelName'] ?? 'Your Hostel';

    return Scaffold(
      appBar: AppBar(
        title: const Text('EasyPG Dashboard', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white70),
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
            colors: [Color(0xFF0F172A), Color(0xFF1E1B4B)],
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
                      _buildGreeting(user?['name'] ?? 'User', hostelName),
                      const SizedBox(height: 24),
                      _buildMenuCard(_dashData?['menu']),
                      const SizedBox(height: 20),
                      _buildNoticesList(_dashData?['notices']),
                      const SizedBox(height: 20),
                      _buildGuidelinesCard(),
                    ],
                  ),
                ),
              ),
      ),
    );
  }

  Widget _buildGreeting(String name, String hostel) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Hello, $name 👋', style: const TextStyle(fontSize: 18, color: Colors.white70)),
        const SizedBox(height: 4),
        RichText(
          text: TextSpan(
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
            children: [
              const TextSpan(text: 'Welcome to '),
              TextSpan(
                text: hostel,
                style: const TextStyle(color: Color(0xFF6366F1)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMenuCard(Map<String, dynamic>? menu) {
    return GlassmorphicContainer(
      width: double.infinity,
      height: 220,
      borderRadius: 16,
      blur: 15,
      alignment: Alignment.center,
      border: 1,
      linearGradient: LinearGradient(colors: [Colors.white.withOpacity(0.05), Colors.white.withOpacity(0.02)]),
      borderGradient: LinearGradient(colors: [const Color(0xFF6366F1).withOpacity(0.5), Colors.white.withOpacity(0.1)]),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.restaurant_menu, color: Color(0xFF6366F1), size: 20),
                const SizedBox(width: 8),
                Text("Today's Menu (${menu?['day'] ?? 'N/A'})", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            const Divider(color: Colors.white10, height: 24),
            _menuRow('Breakfast', menu?['breakfast']),
            _menuRow('Lunch', menu?['lunch']),
            _menuRow('Snacks', menu?['snacks']),
            _menuRow('Dinner', menu?['dinner']),
          ],
        ),
      ),
    );
  }

  Widget _menuRow(String label, String? item) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(width: 80, child: Text(label, style: const TextStyle(color: Colors.white38, fontSize: 13))),
          Expanded(child: Text(item ?? 'Not updated', style: const TextStyle(color: Colors.white, fontSize: 13))),
        ],
      ),
    );
  }

  Widget _buildNoticesList(List? notices) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Recent Notices', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        if (notices == null || notices.isEmpty)
          const Text('No notices for now.', style: TextStyle(color: Colors.white38))
        else
          ...notices.map((n) => Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: GlassmorphicContainer(
              width: double.infinity,
              height: 100,
              borderRadius: 12,
              blur: 10,
              alignment: Alignment.center,
              border: 1,
              linearGradient: LinearGradient(colors: [Colors.white.withOpacity(0.05), Colors.white.withOpacity(0.02)]),
              borderGradient: LinearGradient(colors: [Colors.white.withOpacity(0.1), Colors.white.withOpacity(0.05)]),
              child: ListTile(
                title: Text(n['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF6366F1))),
                subtitle: Text(n['message'] ?? '', maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, color: Colors.white70)),
                trailing: const Icon(Icons.arrow_forward_ios, size: 14, color: Colors.white24),
              ),
            ),
          )),
      ],
    );
  }

  Widget _buildGuidelinesCard() {
    return GlassmorphicContainer(
      width: double.infinity,
      height: 280,
      borderRadius: 16,
      blur: 15,
      alignment: Alignment.center,
      border: 1,
      linearGradient: LinearGradient(colors: [Colors.white.withOpacity(0.05), Colors.white.withOpacity(0.02)]),
      borderGradient: LinearGradient(colors: [const Color(0xFF6366F1).withOpacity(0.3), Colors.white.withOpacity(0.1)]),
      child: const Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.gavel, color: Color(0xFF6366F1), size: 20),
                SizedBox(width: 8),
                Text("Hostel Guidelines & Terms", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            Divider(color: Colors.white10, height: 24),
            _RuleItem('Rent must be paid by the 5th of every month.'),
            _RuleItem('Minimum 10-day notice required before vacating.'),
            _RuleItem('Respect silence between 10:00 PM and 7:00 AM.'),
            _RuleItem('Turn off lights/fans when leaving your room.'),
            _RuleItem('Maintain cleanliness in common areas.'),
          ],
        ),
      ),
    );
  }
}

class _RuleItem extends StatelessWidget {
  final String text;
  const _RuleItem(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('• ', style: TextStyle(color: Color(0xFF6366F1), fontWeight: FontWeight.bold)),
          Expanded(child: Text(text, style: const TextStyle(color: Colors.white70, fontSize: 13))),
        ],
      ),
    );
  }
}
